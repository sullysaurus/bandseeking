'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { AlertCircle, Home, RefreshCw, LogOut } from 'lucide-react'
import { supabase } from '@/lib/supabase'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Dashboard error:', error)
  }, [error])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Dashboard Error</h1>
          <p className="text-gray-600 mb-4">
            We encountered an error loading your dashboard. This might be due to authentication or data loading issues.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col gap-3">
            <Button onClick={reset} className="flex items-center justify-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button 
              variant="secondary" 
              onClick={handleSignOut} 
              className="flex items-center justify-center"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Try Again
            </Button>
            <Link href="/">
              <Button variant="ghost" className="flex items-center justify-center w-full">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
          <p className="font-medium mb-2">Common solutions:</p>
          <ul className="text-left space-y-1">
            <li>• Check your internet connection</li>
            <li>• Clear browser cache and cookies</li>
            <li>• Sign out and sign back in</li>
          </ul>
        </div>
      </div>
    </div>
  )
}