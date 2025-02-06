'use client'

import { useState, useEffect } from 'react'
import { Spinner } from '@/app/components/Spinner'
import { useAuth } from '@/lib/hooks/useAuth'
import { db } from '@/lib/firebase/firebase'
import { collection, query, getDocs } from 'firebase/firestore'

interface ListingInfo {
    id: string
    vin: string
    title: string
    date: string
    url: string
    price: number
    miles: number
    location: string
    seller: string
}

export default function DashboardTable() {
    const { user } = useAuth()
    const [isLoading, setIsLoading] = useState(false)
    const [listings, setListings] = useState<ListingInfo[]>([])
    const [searchQuery, setSearchQuery] = useState('')
    const [error, setError] = useState<string | null>(null)
    const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

    // Load cached data from Firebase when component mounts
    useEffect(() => {
        if (user) {
            loadCachedListings()
        }
    }, [user])

    const loadCachedListings = async () => {
        if (!user) {
            setError('You must be logged in to view listings')
            return
        }

        try {
            setIsLoading(true)
            setError(null)

            // Get all listings documents from Firebase
            const listingsRef = collection(db, 'listings')
            const listingsSnapshot = await getDocs(listingsRef)

            const allListings: ListingInfo[] = []
            let latestUpdate: Date | null = null

            // Combine listings from all documents
            listingsSnapshot.forEach(doc => {
                const data = doc.data()
                if (Array.isArray(data.listings)) {
                    allListings.push(...data.listings)
                }

                // Track the most recent update
                if (data.lastUpdated) {
                    const updateDate = new Date(data.lastUpdated)
                    if (!latestUpdate || updateDate > latestUpdate) {
                        latestUpdate = updateDate
                    }
                }
            })

            // Sort listings by VIN and date
            const sortedListings = allListings.sort((a, b) => {
                const vinCompare = a.vin.localeCompare(b.vin)
                if (vinCompare !== 0) return vinCompare
                return new Date(b.date).getTime() - new Date(a.date).getTime()
            })

            setListings(sortedListings)
            setLastUpdated(latestUpdate)
        } catch (error) {
            console.error('Error loading listings:', error)
            setError('Failed to load listings. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const refreshListings = async () => {
        if (!user) {
            setError('You must be logged in to refresh listings')
            return
        }

        try {
            setIsLoading(true)
            setError(null)
            const response = await fetch('/api/listings/search?refresh=true', {
                headers: {
                    'x-user-id': user.uid
                }
            })

            if (!response.ok) {
                throw new Error('Failed to refresh listings')
            }

            // After refresh, load the updated data from Firebase
            await loadCachedListings()
        } catch (error) {
            console.error('Error refreshing listings:', error)
            setError('Failed to refresh listings. Please try again.')
        } finally {
            setIsLoading(false)
        }
    }

    const filteredListings = listings.filter(listing => {
        const searchLower = searchQuery.toLowerCase()
        return listing.vin.toLowerCase().includes(searchLower) ||
            listing.title.toLowerCase().includes(searchLower) ||
            listing.seller.toLowerCase().includes(searchLower)
    })

    // Group listings by VIN for alternate row coloring
    const getRowClassName = (listing: ListingInfo, index: number) => {
        if (index === 0) return 'hover:bg-slate-50'
        const prevListing = filteredListings[index - 1]
        const isNewVinGroup = prevListing.vin !== listing.vin
        if (isNewVinGroup) return 'hover:bg-slate-50 border-t-2 border-gray-100'
        return 'hover:bg-slate-50'
    }

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0
        }).format(price)
    }

    const formatMiles = (miles: number) => {
        return new Intl.NumberFormat('en-US').format(miles) + ' mi'
    }

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        return new Intl.DateTimeFormat('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(date)
    }

    return (
        <div>
            <div className="flex items-center justify-between gap-4 mb-4">
                <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                    </div>
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full rounded-lg border-0 bg-slate-50 py-3 pl-10 pr-4 text-gray-900 ring-1 ring-inset ring-gray-100 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                        placeholder="Search all listings"
                    />
                </div>
                {lastUpdated && (
                    <div className="text-sm text-gray-500">
                        Last updated: {lastUpdated.toLocaleString()}
                    </div>
                )}
                <button
                    onClick={refreshListings}
                    disabled={isLoading}
                    className="flex items-center justify-center h-10 w-10 rounded-lg bg-slate-50 text-gray-900 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed ring-1 ring-inset ring-gray-100"
                    title="Refresh listings"
                >
                    {isLoading ? (
                        <Spinner className="w-5 h-5" />
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                            <path d="M197.67,186.37a8,8,0,0,1,0,11.29C196.58,198.73,170.82,224,128,224c-37.39,0-64.53-22.4-80-39.85V208a8,8,0,0,1-16,0V160a8,8,0,0,1,8-8H88a8,8,0,0,1,0,16H55.44C67.76,183.35,93,208,128,208c36,0,58.14-21.46,58.36-21.68A8,8,0,0,1,197.67,186.37ZM216,40a8,8,0,0,0-8,8V71.85C192.53,54.4,165.39,32,128,32,85.18,32,59.42,57.27,58.34,58.34a8,8,0,0,0,11.3,11.34C69.86,69.46,92,48,128,48c35,0,60.24,24.65,72.56,40H168a8,8,0,0,0,0,16h48a8,8,0,0,0,8-8V48A8,8,0,0,0,216,40Z" />
                        </svg>
                    )}
                </button>
            </div>

            {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 text-red-500 text-sm">
                    {error}
                </div>
            )}

            <div className="rounded-xl border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    VIN
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Vehicle
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Miles
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Location
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Seller
                                </th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                    Last Seen
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredListings.map((listing, index) => (
                                <tr key={listing.id} className={getRowClassName(listing, index)}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                        {listing.vin}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {listing.title}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatPrice(listing.price)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatMiles(listing.miles)}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {listing.location}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        <a
                                            href={listing.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:text-blue-800 hover:underline"
                                        >
                                            {listing.seller}
                                        </a>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                        {formatDate(listing.date)}
                                    </td>
                                </tr>
                            ))}
                            {(filteredListings.length === 0 && !isLoading) && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-sm text-gray-500">
                                        {listings.length === 0
                                            ? "No listings found. Click the refresh button to find vehicle listings."
                                            : "No listings match your search criteria."}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
} 