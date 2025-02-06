'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { VINFormData } from '@/types/vin'
import { db } from '@/lib/firebase/firebase'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { useAuth } from '@/lib/hooks/useAuth'

export default function EditVINPage({ params }: { params: { vin: string } }) {
    const router = useRouter()
    const { user } = useAuth()
    const [formData, setFormData] = useState<VINFormData>({
        vin: '',
        year: '',
        make: '',
        model: '',
        color: ''
    })
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [docId, setDocId] = useState<string>('')

    useEffect(() => {
        const fetchVIN = async () => {
            if (!user) return

            try {
                const vinDoc = await getDoc(doc(db, 'vins', params.vin))
                if (vinDoc.exists()) {
                    const data = vinDoc.data() as VINFormData
                    setFormData(data)
                    setDocId(vinDoc.id)
                } else {
                    setError('VIN not found')
                }
            } catch (err) {
                console.error('Error fetching VIN:', err)
                setError('Failed to load VIN data')
            } finally {
                setLoading(false)
            }
        }

        fetchVIN()
    }, [params.vin, user])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({
            ...prev,
            [name]: value
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            setError('You must be logged in to update a VIN')
            return
        }

        setLoading(true)
        setError(null)

        try {
            const vinRef = doc(db, 'vins', docId)
            await updateDoc(vinRef, {
                ...formData,
                updatedAt: new Date().toISOString()
            })

            router.push('/vins')
        } catch (err) {
            console.error('Error updating VIN:', err)
            setError('Failed to update VIN. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-6">
                <div className="text-red-500">{error}</div>
            </div>
        )
    }

    return (
        <div className="p-6">
            <div className="max-w-[512px]">
                <h3 className="text-[32px] font-bold text-gray-900 mb-2">
                    Edit VIN Details
                </h3>
                <p className="text-gray-500 text-base mb-6">
                    Update the information for this vehicle.
                </p>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block">
                            <span className="text-gray-900 text-base font-medium mb-2 block">VIN</span>
                            <input
                                name="vin"
                                value={formData.vin}
                                onChange={handleChange}
                                className="w-full rounded-xl border border-gray-200 bg-slate-50 h-14 px-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                                pattern="^[A-HJ-NPR-Z0-9]{17}$"
                                title="Please enter a valid 17-character VIN"
                            />
                        </label>
                    </div>

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

                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={() => router.push('/vins')}
                            className="rounded-xl px-4 h-10 bg-slate-50 text-gray-900 text-sm font-medium hover:bg-slate-100"
                            disabled={loading}
                        >
                            Cancel
                        </button>
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
                                'Save Changes'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
} 