import { useState, useEffect } from 'react';
import { VIN } from '@/types/vin';
import { Spinner } from './Spinner';

export default function VINList() {
    const [vins, setVins] = useState<VIN[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchVins();
    }, []);

    const fetchVins = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await fetch('/api/vins');
            if (!response.ok) {
                throw new Error('Failed to fetch VINs');
            }
            const data = await response.json();
            setVins(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to fetch VINs');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (vin: string) => {
        try {
            const response = await fetch(`/api/vins?vin=${vin}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error('Failed to delete VIN');
            }
            setVins(vins.filter(v => v.vin !== vin));
        } catch (err) {
            console.error('Error deleting VIN:', err);
            alert('Failed to delete VIN. Please try again.');
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner />
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center text-red-500 p-4">
                {error}
            </div>
        );
    }

    if (vins.length === 0) {
        return (
            <div className="text-center text-gray-500 p-4">
                No VINs saved yet.
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {vins.map((vin) => (
                <div key={vin.vin} className="bg-white p-4 rounded-lg shadow">
                    <div className="flex justify-between items-start">
                        <div>
                            <h3 className="text-lg font-semibold">{vin.vin}</h3>
                            <p className="text-sm text-gray-500">
                                Saved on {new Date(vin.savedAt).toLocaleDateString()}
                            </p>
                            {(vin.year || vin.make || vin.model) && (
                                <p className="mt-2">
                                    {[vin.year, vin.make, vin.model].filter(Boolean).join(' ')}
                                </p>
                            )}
                            {vin.color && (
                                <p className="text-sm text-gray-600">
                                    Color: {vin.color}
                                </p>
                            )}
                        </div>
                        <button
                            onClick={() => handleDelete(vin.vin)}
                            className="text-red-500 hover:text-red-700"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
} 