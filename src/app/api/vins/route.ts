import { NextResponse } from 'next/server';
import { VIN } from '@/types/vin';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, addDoc, deleteDoc, doc } from 'firebase/firestore';

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

        const vinsRef = collection(db, 'vins');
        const q = query(vinsRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        const vins = querySnapshot.docs.map(doc => ({
            ...doc.data(),
            id: doc.id
        })) as VIN[];

        return NextResponse.json(vins);
    } catch (error) {
        console.error('Error fetching VINs:', error);
        return NextResponse.json(
            { error: 'Failed to fetch VINs' },
            { status: 500 }
        );
    }
}

export async function POST(request: Request) {
    try {
        const headersList = headers()
        const userId = headersList.get('x-user-id')

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const data = await request.json()

        if (!data.vin) {
            return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
        }

        const timestamp = new Date().toISOString()
        const vinData = {
            userId,
            vin: data.vin,
            createdAt: timestamp,
            updatedAt: timestamp,
            savedAt: timestamp,
            year: data.year || '',
            make: data.make || '',
            model: data.model || '',
            color: data.color || ''
        }

        // Add to Firestore
        const vinsRef = collection(db, 'vins');
        const docRef = await addDoc(vinsRef, vinData);

        const newVin: VIN = {
            ...vinData,
            id: docRef.id
        }

        return NextResponse.json(newVin);
    } catch (error) {
        console.error('Error adding VIN:', error)
        return NextResponse.json(
            { error: 'Failed to add VIN' },
            { status: 500 }
        )
    }
}

export async function DELETE(request: Request) {
    try {
        const headersList = headers()
        const userId = headersList.get('x-user-id')

        if (!userId) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            )
        }

        const { searchParams } = new URL(request.url);
        const vinId = searchParams.get('id');

        if (!vinId) {
            return NextResponse.json({ error: 'VIN ID is required' }, { status: 400 });
        }

        // Delete from Firestore
        const vinRef = doc(db, 'vins', vinId);
        await deleteDoc(vinRef);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting VIN:', error);
        return NextResponse.json(
            { error: 'Failed to delete VIN' },
            { status: 500 }
        );
    }
} 