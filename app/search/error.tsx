'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Search, RefreshCw, Home, Database } from 'lucide-react'

export default function SearchError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Search error:', error)
  }, [error])

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
            <Database className="w-8 h-8 text-blue-500" />
          </div>
          <h2 className="text-2xl font-bold mb-2">Search Unavailable</h2>
          <p className="text-gray-600 mb-4">
            We&apos;re having trouble loading the search results. This could be a temporary issue with our database connection.
          </p>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <h3 className="font-medium mb-2 text-sm">Try these solutions:</h3>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• Refresh the page</li>
            <li>• Check your internet connection</li>
            <li>• Try a simpler search query</li>
            <li>• Browse from the homepage instead</li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <Button onClick={reset} className="flex items-center justify-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="secondary" className="flex items-center justify-center">
                <Home className="w-4 h-4 mr-2" />
                Browse Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-6 text-xs text-gray-500">
          <p>Error persisting? Our team has been notified and is working on a fix.</p>
        </div>
      </div>
    </div>
  )
}