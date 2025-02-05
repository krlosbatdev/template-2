'use client';

import { useState } from 'react';
import Link from 'next/link';
import { VIN } from '@/types/vin';
import Navbar from './Navbar';

export default function VINList() {
    const [vins, setVins] = useState<VIN[]>([
        {
            vin: '5YJ3E1EA7KF470984',
            savedAt: '2024-03-15',
            year: '2019',
            make: 'Tesla',
            model: 'Model 3'
        },
        {
            vin: '2HGFC2F59LH500001',
            savedAt: '2024-03-15',
            year: '2020',
            make: 'Honda',
            model: 'Civic'
        }
    ]);

    const handleDelete = (vinToDelete: string) => {
        setVins(prevVins => prevVins.filter(v => v.vin !== vinToDelete));
    };

    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-[1200px] mx-auto p-4">
                <div className="bg-white rounded-2xl">
                    <Navbar />

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <h1 className="text-[32px] font-bold text-gray-900">Your VINs</h1>
                            <p className="text-sm text-gray-500">Vehicle Identification Numbers</p>
                        </div>

                        {vins.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">
                                No VINs saved yet. Add your first VIN to get started.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {vins.map((vin) => (
                                    <div key={vin.vin} className="flex items-center justify-between px-4 py-3">
                                        <div>
                                            <p className="text-base font-medium text-gray-900">{vin.vin}</p>
                                            <p className="text-sm text-gray-500">
                                                {vin.year} {vin.make} {vin.model}
                                            </p>
                                        </div>
                                        <button className="text-gray-600">
                                            Edit
                                        </button>
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
                </div>
            </div>
        </div>
    );
} 