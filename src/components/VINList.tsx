'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { VIN } from '@/types/vin';
import { db } from '@/lib/firebase/firebase';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { useAuth } from '@/lib/hooks/useAuth';

export default function VINList() {
    const [vins, setVins] = useState<VIN[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user } = useAuth();

    useEffect(() => {
        const fetchVins = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const vinsRef = collection(db, 'vins');
                const q = query(vinsRef, where('userId', '==', user.uid));
                const querySnapshot = await getDocs(q);

                const vinData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as VIN[];

                setVins(vinData);
            } catch (err) {
                console.error('Error fetching VINs:', err);
                setError(err instanceof Error ? err.message : 'Failed to load VINs');
            } finally {
                setLoading(false);
            }
        };

        fetchVins();
    }, [user]);

    const handleDelete = async (vinId: string) => {
        if (!user) return;

        try {
            const vinRef = doc(db, 'vins', vinId);
            await deleteDoc(vinRef);
            setVins(prevVins => prevVins.filter(v => v.id !== vinId));
        } catch (err) {
            console.error('Error deleting VIN:', err);
            alert('Failed to delete VIN. Please try again.');
        }
    };

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-[32px] font-bold text-gray-900">Your VINs</h1>
                <p className="text-sm text-gray-500">Vehicle Identification Numbers</p>
            </div>

            {loading ? (
                <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-center py-8">{error}</div>
            ) : vins.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                    No VINs saved yet. Add your first VIN to get started.
                </div>
            ) : (
                <div className="space-y-2">
                    {vins.map((vin) => (
                        <div key={vin.id} className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50">
                            <div>
                                <p className="text-base font-medium text-gray-900">{vin.vin}</p>
                                <p className="text-sm text-gray-500">
                                    {vin.year} {vin.make} {vin.model}
                                </p>
                            </div>
                            <div className="flex items-center gap-4">
                                <Link
                                    href={`/vins/edit/${vin.id}`}
                                    className="text-gray-600 hover:text-gray-900"
                                >
                                    Edit
                                </Link>
                                <button
                                    onClick={() => handleDelete(vin.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <Link
                    href="/vins/add"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-slate-50 px-4 py-3 text-gray-900 hover:bg-slate-100"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M224,128a8,8,0,0,1-8,8H136v80a8,8,0,0,1-16,0V136H40a8,8,0,0,1,0-16h80V40a8,8,0,0,1,16,0v80h80A8,8,0,0,1,224,128Z" />
                    </svg>
                    Add VIN
                </Link>
            </div>
        </div>
    );
} 