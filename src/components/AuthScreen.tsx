'use client'

import SignInWithGoogle from './SignInWithGoogle'

export default function AuthScreen() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-start justify-center">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center mt-32">
                <div className="mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-900">
                        <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                            <path fillRule="evenodd" clipRule="evenodd" d="M24 4H42V17.3333V30.6667H24V44H6V30.6667V17.3333H24V4Z" fill="currentColor" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome to AutoTrack</h1>
                    <p className="text-gray-500">Sign in to start tracking your vehicles</p>
                </div>

                <SignInWithGoogle />
            </div>
        </div>
    )
} 