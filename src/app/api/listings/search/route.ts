import { NextResponse } from 'next/server'

interface HistoryRecord {
    source: string
    listing_url?: string
    last_seen_at_date: string
    price?: number
    miles?: number
    city?: string
    state?: string
}

// In-memory storage for VINs (temporary solution)
const savedVins = [
    {
        vin: '5YJ3E1EA7KF470984',
        year: '2019',
        make: 'Tesla',
        model: 'Model 3',
    },
    {
        vin: '2HGFC2F59LH500001',
        year: '2020',
        make: 'Honda',
        model: 'Civic',
    }
]

async function getVehicleHistory(vin: string) {
    const API_KEY = process.env.MARKETCHECK_API_KEY

    if (!API_KEY) {
        throw new Error('Marketcheck API key is not configured')
    }

    const historyUrl = `https://mc-api.marketcheck.com/v2/history/car/${vin}?api_key=${API_KEY}&sort_order=desc`
    const historyResponse = await fetch(historyUrl, {
        method: 'GET',
        headers: {
            'Accept': 'application/json'
        }
    })

    if (!historyResponse.ok) {
        throw new Error(`Vehicle history request failed for VIN ${vin}: ${historyResponse.statusText}`)
    }

    const historyData = await historyResponse.json()
    return historyData as HistoryRecord[]
}

export async function GET() {
    try {
        // Fetch history for each VIN
        const allListings = []
        for (const vinDoc of savedVins) {
            try {
                const historyData = await getVehicleHistory(vinDoc.vin)

                // Process each listing in the history
                const listings = historyData.map((record: HistoryRecord) => ({
                    vin: vinDoc.vin,
                    title: `${vinDoc.year} ${vinDoc.make} ${vinDoc.model}`,
                    date: record.last_seen_at_date,
                    url: record.listing_url || null,
                    price: record.price,
                    miles: record.miles,
                    location: record.city && record.state ? `${record.city}, ${record.state}` : null,
                    source: record.source
                }))

                allListings.push(...listings)
            } catch (error) {
                console.error(`Error fetching history for VIN ${vinDoc.vin}:`, error)
                // Continue with other VINs even if one fails
                continue
            }
        }

        // Sort all listings by date (newest first)
        allListings.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        return NextResponse.json(allListings)
    } catch (error) {
        console.error('Error searching listings:', error)
        return NextResponse.json(
            { error: 'Failed to search listings' },
            { status: 500 }
        )
    }
} 