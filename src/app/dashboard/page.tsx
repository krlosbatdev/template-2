import { Metadata } from 'next'
import DashboardTable from '@/components/DashboardTable'
import Navbar from '@/components/Navbar'

export const metadata: Metadata = {
    title: 'Dashboard - AutoTrack',
    description: 'View all tracked vehicle listings across different platforms',
}

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-slate-100">
            <div className="max-w-[1200px] mx-auto p-4">
                <div className="bg-white rounded-2xl">
                    <Navbar />

                    {/* Content */}
                    <div className="p-6">
                        <div className="mb-6">
                            <h1 className="text-[32px] font-bold text-gray-900">Vehicle Listings</h1>
                            <p className="text-sm text-gray-500">Track and monitor vehicle listings across multiple platforms</p>
                        </div>
                        <DashboardTable />
                    </div>
                </div>
            </div>
        </div>
    )
} 