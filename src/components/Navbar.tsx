'use client';

import Link from 'next/link';

export default function Navbar() {
    return (
        <header className="flex items-center justify-between border-b border-slate-100 px-8 py-4">
            <Link href="/" className="flex items-center gap-3">
                <div className="w-6 h-6 text-gray-900">
                    <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                        <path fillRule="evenodd" clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" />
                    </svg>
                </div>
                <span className="text-xl font-bold text-gray-900">AutoTrack</span>
            </Link>
            <nav className="flex items-center gap-8">
                <div className="flex items-center gap-8">
                    <Link href="/dashboard" className="text-sm font-medium text-gray-900">Dashboard</Link>
                    <Link href="/vins" className="text-sm font-medium text-gray-900">VINs</Link>
                    <Link href="/settings" className="text-sm font-medium text-gray-900">Settings</Link>
                </div>
                <button className="flex items-center justify-center rounded-xl bg-slate-50 p-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" viewBox="0 0 256 256">
                        <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z" />
                    </svg>
                </button>
                <div className="w-10 h-10 rounded-full bg-cover bg-center bg-no-repeat" style={{ backgroundImage: 'url("https://via.placeholder.com/40")' }} />
            </nav>
        </header>
    );
} 