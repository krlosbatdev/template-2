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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                        <path d="M19 20H5V21C5 21.5523 4.55228 22 4 22H3C2.44772 22 2 21.5523 2 21V12.5631C2 12.1906 2.14819 11.8371 2.41012 11.5752L3.70711 10.2782C3.89464 10.0907 4 9.83276 4 9.564V6C4 3.79086 5.79086 2 8 2H16C18.2091 2 20 3.79086 20 6V9.564C20 9.83276 20.1054 10.0907 20.2929 10.2782L21.5899 11.5752C21.8518 11.8371 22 12.1906 22 12.5631V21C22 21.5523 21.5523 22 21 22H20C19.4477 22 19 21.5523 19 21V20ZM7 6C6.44772 6 6 6.44772 6 7V8C6 8.55228 6.44772 9 7 9H17C17.5523 9 18 8.55228 18 8V7C18 6.44772 17.5523 6 17 6H7Z" />
                        <path d="M6 14C7.10457 14 8 14.8954 8 16C8 17.1046 7.10457 18 6 18C4.89543 18 4 17.1046 4 16C4 14.8954 4.89543 14 6 14Z" />
                        <path d="M18 14C19.1046 14 20 14.8954 20 16C20 17.1046 19.1046 18 18 18C16.8954 18 16 17.1046 16 16C16 14.8954 16.8954 14 18 14Z" />
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