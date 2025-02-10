import { NextResponse } from 'next/server'
import { db } from '@/lib/firebase/firebase'
import { collection, query, getDocs, doc, setDoc, getDoc, DocumentData, where, deleteDoc } from 'firebase/firestore'
import { headers } from 'next/headers'

interface ListingHistory {
    id: string
    price: number
    miles: number
    vdp_url: string
    last_seen_at_date: string
    source: string
    seller_name: string
    city: string
    state: string
    zip: string
}

interface ProcessedListing {
    id: string
    vin: string
    title: string
    date: string
    url: string
    price: number
    miles: number
    location: string
    source: string
    seller: string
}

interface ListingsDocument extends DocumentData {
    listings: ProcessedListing[]
    lastUpdated: string
}

function cleanListingData(listing: ListingHistory, vinData: any): ProcessedListing {
    return {
        id: listing.id || `${vinData.vin}-${Date.now()}`,
        vin: vinData.vin,
        title: `${vinData.year || 'N/A'} ${vinData.make || 'N/A'} ${vinData.model || 'N/A'}`.trim(),
        date: listing.last_seen_at_date,
        url: listing.vdp_url || '',
        price: listing.price || 0,
        miles: listing.miles || 0,
        location: listing.city && listing.state ?
            `${listing.city}, ${listing.state}${listing.zip ? ` ${listing.zip}` : ''}` :
            'Location not available',
        source: listing.source || 'Unknown source',
        seller: listing.seller_name || 'Unknown seller'
    }
}

async function getVehicleHistory(vin: string): Promise<ListingHistory[]> {
    const API_KEY = process.env.MARKETCHECK_API_KEY

    if (!API_KEY) {
        throw new Error('Marketcheck API key is not configured')
    }

    // Calculate date 2 months ago
    const twoMonthsAgo = new Date()
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2)
    const minDate = Math.floor(twoMonthsAgo.getTime() / 1000)

    const historyUrl = `https://mc-api.marketcheck.com/v2/history/car/${vin}?api_key=${API_KEY}&sort_order=desc`
    const historyResponse = await fetch(historyUrl)

    if (!historyResponse.ok) {
        throw new Error(`Vehicle history request failed for VIN ${vin}: ${historyResponse.statusText}`)
    }

    const historyData = await historyResponse.json()

    // Ensure historyData is an array
    if (!Array.isArray(historyData)) {
        console.error(`Invalid history data for VIN ${vin}:`, historyData)
        return []
    }

    // Filter listings from the last 2 months and validate data structure
    return historyData.filter((listing: ListingHistory) => {
        if (!listing || !listing.last_seen_at_date) return false
        const listingDate = new Date(listing.last_seen_at_date).getTime() / 1000
        return listingDate >= minDate
    })
}

export async function GET(request: Request) {
    try {
        const headersList = headers()
        const userId = headersList.get('x-user-id')

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url)
        const refresh = searchParams.get('refresh') === 'true'

        // Get only the VINs belonging to the current user
        const vinsRef = collection(db, 'vins')
        const vinsQuery = query(vinsRef, where('userId', '==', userId))
        const vinsSnapshot = await getDocs(vinsQuery)
        const userVinDocs = vinsSnapshot.docs

        if (userVinDocs.length === 0) {
            return NextResponse.json([])
        }

        const listingsRef = collection(db, 'listings')
        const allListings: ProcessedListing[] = []

        // If refreshing, fetch new data for each VIN
        if (refresh) {
            for (const vinDoc of userVinDocs) {
                const vinData = vinDoc.data()
                const vinListingsRef = doc(listingsRef, vinData.vin)

                try {
                    // Delete existing listings
                    await deleteDoc(vinListingsRef)

                    // Fetch new listings from Marketcheck
                    const historyData = await getVehicleHistory(vinData.vin)
                    console.log(`Fetched ${historyData.length} history records for VIN ${vinData.vin}`)

                    // Process and save new listings
                    const listings = historyData
                        .filter(listing => listing && typeof listing === 'object')
                        .map(listing => cleanListingData(listing, vinData))
                        .filter(listing => listing.id && listing.date)

                    if (listings.length > 0) {
                        await setDoc(vinListingsRef, {
                            listings,
                            lastUpdated: new Date().toISOString()
                        })
                        allListings.push(...listings)
                    }
                } catch (error) {
                    console.error(`Error processing VIN ${vinData.vin}:`, error)
                    continue
                }
            }
        } else {
            // Just load existing listings
            for (const vinDoc of userVinDocs) {
                const vinData = vinDoc.data()
                const listingDoc = await getDoc(doc(listingsRef, vinData.vin))
                if (listingDoc.exists()) {
                    const data = listingDoc.data() as ListingsDocument
                    if (Array.isArray(data.listings)) {
                        allListings.push(...data.listings)
                    }
                }
            }
        }

        // Sort all listings by date (newest first)
        const sortedListings = allListings.sort((a, b) =>
            new Date(b.date).getTime() - new Date(a.date).getTime()
        )

        return NextResponse.json(sortedListings)
    } catch (error) {
        console.error('Error searching listings:', error)
        return NextResponse.json(
            { error: 'Failed to search listings' },
            { status: 500 }
        )
    }
} 