'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import Button from '@/components/ui/Button'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
            <WifiOff className="w-8 h-8 text-gray-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">You&apos;re Offline</h1>
          <p className="text-gray-600 mb-6">
            It looks like you&apos;ve lost your internet connection. Check your network and try again.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-6 mb-8">
          <h3 className="font-medium mb-4">While you&apos;re offline:</h3>
          <ul className="text-sm text-gray-600 text-left space-y-2">
            <li>• Some features may not work properly</li>
            <li>• Your saved data will sync when reconnected</li>
            <li>• Messages won&apos;t send until you&apos;re back online</li>
          </ul>
        </div>

        <div className="space-y-4">
          <Button onClick={handleRefresh} className="flex items-center mx-auto">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>

          <Link href="/">
            <Button variant="ghost" className="flex items-center mx-auto">
              <Home className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>Connection will be restored automatically when your network is back.</p>
        </div>
      </div>
    </div>
  )
}