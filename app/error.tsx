'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { AlertCircle, Home, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-2">Something went wrong</h1>
          <p className="text-gray-600 mb-4">
            We encountered an unexpected error. This has been logged and our team will look into it.
          </p>
          
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4 p-4 bg-gray-50 rounded-lg text-left">
              <summary className="cursor-pointer font-medium text-sm">
                Error Details (Development Only)
              </summary>
              <pre className="mt-2 text-xs text-gray-700 overflow-auto">
                {error.message}
                {error.digest && `\nDigest: ${error.digest}`}
              </pre>
            </details>
          )}
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={reset} className="flex items-center">
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Link href="/">
              <Button variant="secondary" className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500">
          <p>If this problem persists, please contact support.</p>
        </div>
      </div>
    </div>
  )
}