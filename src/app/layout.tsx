'use client'

import "./globals.css";
import { AuthProvider } from '@/lib/contexts/AuthContext'
import { useAuth } from '@/lib/hooks/useAuth'
import Navbar from '@/components/Navbar'
import AuthScreen from '@/components/AuthScreen'

function RootLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    )
  }

  if (!user) {
    return <AuthScreen />
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-[1200px] mx-auto p-4">
        <div className="bg-white rounded-2xl">
          <Navbar />
          {children}
        </div>
      </div>
    </div>
  )
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <RootLayoutContent>{children}</RootLayoutContent>
        </AuthProvider>
      </body>
    </html>
  );
}
