import { NextResponse } from 'next/server';
import https from 'https';

const MARKETCHECK_API_KEY = process.env.MARKETCHECK_API_KEY;
const MARKETCHECK_API_URL = 'https://mc-api.marketcheck.com/v2';

// Create an HTTPS agent that allows self-signed certificates
const httpsAgent = new https.Agent({
    rejectUnauthorized: false
});

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    // Debug: Log environment and request info
    console.log('=== Debug Info ===');
    console.log('API Key exists:', !!MARKETCHECK_API_KEY);
    console.log('API Key length:', MARKETCHECK_API_KEY?.length);
    console.log('Requested VIN:', vin);

    if (!vin) {
        console.log('Error: No VIN provided');
        return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
    }

    if (!MARKETCHECK_API_KEY) {
        console.error('Error: MarketCheck API key is not configured');
        return NextResponse.json({
            error: 'Vehicle information service is not configured. Please contact support.'
        }, { status: 500 });
    }

    try {
        // Make the API request to decode the VIN
        const decodeUrl = `${MARKETCHECK_API_URL}/decode/car/${vin}/specs?api_key=${MARKETCHECK_API_KEY}`;
        console.log('API URL:', decodeUrl.replace(MARKETCHECK_API_KEY, '****'));

        const response = await fetch(decodeUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            // @ts-ignore - agent type is not recognized by TypeScript
            agent: httpsAgent,
            cache: 'no-store'
        });

        console.log('=== Response Info ===');
        console.log('Response status:', response.status);
        console.log('Response status text:', response.statusText);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('API Error Details:', {
                status: response.status,
                statusText: response.statusText,
                error: errorText
            });
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('API Response data:', JSON.stringify(data, null, 2));

        // Extract the relevant information from the response
        const vehicleInfo = {
            year: data.year?.toString() || '',
            make: data.make || '',
            model: data.model || '',
            exterior_color: data.exterior_color || ''
        };

        // Then get the history data for additional information
        const historyUrl = `${MARKETCHECK_API_URL}/history/car/${vin}?api_key=${MARKETCHECK_API_KEY}&sort_order=desc`;
        console.log('History API URL:', historyUrl.replace(MARKETCHECK_API_KEY, '****'));

        const historyResponse = await fetch(historyUrl, {
            method: 'GET',
            headers: {
                'Accept': 'application/json'
            },
            cache: 'no-store'
        });

        if (historyResponse.ok) {
            const historyData = await historyResponse.json();
            console.log('=== History Data ===');
            console.log('History data length:', Array.isArray(historyData) ? historyData.length : 'Not an array');

            // If we got history data and don't have color from decode, try to get it from history
            if (Array.isArray(historyData) && historyData.length > 0 && !vehicleInfo.exterior_color) {
                const firstRecord = historyData[0];
                vehicleInfo.exterior_color = firstRecord.exterior_color || firstRecord.color || '';
            }
        }

        console.log('=== Final Output ===');
        console.log('Processed vehicle info:', vehicleInfo);

        return NextResponse.json(vehicleInfo);
    } catch (err) {
        console.error('=== Error Details ===');
        const error = err as Error;
        console.error('Error type:', error?.constructor?.name || 'Unknown');
        console.error('Error message:', error?.message || 'Unknown error');
        console.error('Error stack:', error?.stack || 'No stack trace');

        return NextResponse.json({
            error: 'Unable to fetch vehicle information. Please try again or enter details manually.',
            details: error?.message || 'Unknown error'
        }, { status: 500 });
    }
} 