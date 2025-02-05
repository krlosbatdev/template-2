'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/hooks/useAuth';
import SignInWithGoogle from './SignInWithGoogle';

export default function Navbar() {
    const { user, signOut } = useAuth();

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
                {user ? (
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => signOut()}
                            className="text-sm font-medium text-gray-900 hover:text-gray-700"
                        >
                            Sign Out
                        </button>
                        <div
                            className="w-10 h-10 rounded-full bg-cover bg-center bg-no-repeat"
                            style={{ backgroundImage: `url(${user.photoURL || 'https://via.placeholder.com/40'})` }}
                            title={user.displayName || 'User'}
                        />
                    </div>
                ) : (
                    <SignInWithGoogle />
                )}
            </nav>
        </header>
    );
} 