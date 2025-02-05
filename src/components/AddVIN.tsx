'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { VINFormData } from '@/types/vin';

export default function AddVIN() {
    const router = useRouter();
    const [formData, setFormData] = useState<VINFormData>({
        vin: '',
        year: '',
        make: '',
        model: '',
        color: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showAdditionalFields, setShowAdditionalFields] = useState(false);

    const handleVinChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const vin = e.target.value;
        setFormData(prev => ({ ...prev, vin }));

        // If VIN is 17 characters, try to fetch vehicle info
        if (vin.length === 17) {
            setLoading(true);
            setError(null);
            try {
                const response = await fetch(`/api/vehicle-info?vin=${vin}`);
                if (!response.ok) throw new Error('Failed to fetch vehicle information');

                const data = await response.json();
                setFormData(prev => ({
                    ...prev,
                    year: data.year || '',
                    make: data.make || '',
                    model: data.model || '',
                    color: data.exterior_color || ''
                }));
                setShowAdditionalFields(true);
            } catch (err) {
                setError('Could not fetch vehicle information. Please enter details manually.');
                setShowAdditionalFields(true);
            } finally {
                setLoading(false);
            }
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/vins', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Failed to save VIN');
            }

            // Redirect to VINs list page after successful save
            router.push('/vins');
        } catch (err) {
            setError('Failed to save VIN. Please try again.');
            console.error('Error saving VIN:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6">
            <div className="max-w-[512px]">
                <h3 className="text-[32px] font-bold text-gray-900 mb-2">
                    Add a VIN to your watchlist
                </h3>
                <p className="text-gray-500 text-base mb-6">
                    Enter the 17-character VIN of the vehicle you would like to add to your watchlist.
                    {!showAdditionalFields && " The vehicle information will be automatically populated when you enter a valid VIN."}
                </p>

                {error && (
                    <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-500 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block">
                            <span className="text-gray-900 text-base font-medium mb-2 block">VIN</span>
                            <div className="relative">
                                <input
                                    name="vin"
                                    value={formData.vin}
                                    onChange={handleVinChange}
                                    placeholder="1HGBH41JXMN109186"
                                    className="w-full rounded-xl border border-gray-200 bg-slate-50 h-14 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    required
                                    pattern="^[A-HJ-NPR-Z0-9]{17}$"
                                    title="Please enter a valid 17-character VIN"
                                />
                                {loading && (
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                                    </div>
                                )}
                            </div>
                        </label>
                    </div>

                    {showAdditionalFields && (
                        <>
                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-gray-900 text-base font-medium mb-2 block">Year</span>
                                    <input
                                        name="year"
                                        value={formData.year}
                                        onChange={handleChange}
                                        placeholder="2021"
                                        className="w-full rounded-xl border border-gray-200 bg-slate-50 h-14 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        pattern="^(19|20)\d{2}$"
                                        title="Please enter a valid year (1900-2099)"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-gray-900 text-base font-medium mb-2 block">Make</span>
                                    <input
                                        name="make"
                                        value={formData.make}
                                        onChange={handleChange}
                                        placeholder="Toyota"
                                        className="w-full rounded-xl border border-gray-200 bg-slate-50 h-14 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <label className="block">
                                    <span className="text-gray-900 text-base font-medium mb-2 block">Model</span>
                                    <input
                                        name="model"
                                        value={formData.model}
                                        onChange={handleChange}
                                        placeholder="Camry"
                                        className="w-full rounded-xl border border-gray-200 bg-slate-50 h-14 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                                <label className="block">
                                    <span className="text-gray-900 text-base font-medium mb-2 block">Color</span>
                                    <input
                                        name="color"
                                        value={formData.color}
                                        onChange={handleChange}
                                        placeholder="White"
                                        className="w-full rounded-xl border border-gray-200 bg-slate-50 h-14 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                </label>
                            </div>
                        </>
                    )}

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/vins')}
                            className="rounded-xl px-4 h-10 bg-slate-50 text-gray-900 text-sm font-medium hover:bg-slate-100"
                            disabled={loading}
                        >
                            Cancel
                        </button>
                        {showAdditionalFields && (
                            <button
                                type="submit"
                                className="rounded-xl px-4 h-10 bg-blue-500 text-white text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </div>
                                ) : (
                                    'Save VIN'
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
} 