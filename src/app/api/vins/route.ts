import { NextResponse } from 'next/server';
import { VIN } from '@/types/vin';

// In a real app, this would be a database
let savedVins: VIN[] = [];

export async function GET() {
    return NextResponse.json(savedVins);
}

export async function POST(request: Request) {
    const data = await request.json();

    if (!data.vin) {
        return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
    }

    const newVin: VIN = {
        vin: data.vin,
        savedAt: new Date().toISOString(),
        year: data.year,
        make: data.make,
        model: data.model,
        color: data.color
    };

    // Check if VIN already exists
    const existingVinIndex = savedVins.findIndex(v => v.vin === data.vin);
    if (existingVinIndex !== -1) {
        savedVins[existingVinIndex] = newVin;
    } else {
        savedVins.push(newVin);
    }

    return NextResponse.json(newVin);
}

export async function DELETE(request: Request) {
    const { searchParams } = new URL(request.url);
    const vin = searchParams.get('vin');

    if (!vin) {
        return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
    }

    const vinIndex = savedVins.findIndex(v => v.vin === vin);
    if (vinIndex === -1) {
        return NextResponse.json({ error: 'VIN not found' }, { status: 404 });
    }

    savedVins = savedVins.filter(v => v.vin !== vin);
    return NextResponse.json({ success: true });
} 