'use client'

import SignInWithGoogle from './SignInWithGoogle'

export default function AuthScreen() {
    return (
        <div className="min-h-screen bg-slate-100 flex items-start justify-center">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md text-center mt-32">
                <div className="mb-8">
                    <div className="w-16 h-16 mx-auto mb-4 text-gray-900">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-full h-full">
                            <path d="M19 20H5V21C5 21.5523 4.55228 22 4 22H3C2.44772 22 2 21.5523 2 21V12.5631C2 12.1906 2.14819 11.8371 2.41012 11.5752L3.70711 10.2782C3.89464 10.0907 4 9.83276 4 9.564V6C4 3.79086 5.79086 2 8 2H16C18.2091 2 20 3.79086 20 6V9.564C20 9.83276 20.1054 10.0907 20.2929 10.2782L21.5899 11.5752C21.8518 11.8371 22 12.1906 22 12.5631V21C22 21.5523 21.5523 22 21 22H20C19.4477 22 19 21.5523 19 21V20ZM7 6C6.44772 6 6 6.44772 6 7V8C6 8.55228 6.44772 9 7 9H17C17.5523 9 18 8.55228 18 8V7C18 6.44772 17.5523 6 17 6H7Z" />
                            <path d="M6 14C7.10457 14 8 14.8954 8 16C8 17.1046 7.10457 18 6 18C4.89543 18 4 17.1046 4 16C4 14.8954 4.89543 14 6 14Z" />
                            <path d="M18 14C19.1046 14 20 14.8954 20 16C20 17.1046 19.1046 18 18 18C16.8954 18 16 17.1046 16 16C16 14.8954 16.8954 14 18 14Z" />
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