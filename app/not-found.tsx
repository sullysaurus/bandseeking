'use client'

import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Home, Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="mb-8">
          <div className="text-8xl font-bold text-gray-200 mb-4">404</div>
          <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
          <p className="text-gray-600">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/">
              <Button className="flex items-center">
                <Home className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <Link href="/search">
              <Button variant="secondary" className="flex items-center">
                <Search className="w-4 h-4 mr-2" />
                Find Musicians
              </Button>
            </Link>
          </div>
          
          <button 
            onClick={() => window.history.back()} 
            className="text-gray-600 hover:text-black text-sm flex items-center mx-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Go Back
          </button>
        </div>

        <div className="mt-12 text-sm text-gray-500">
          <p>Looking for something specific?</p>
          <div className="mt-2 space-x-4">
            <Link href="/auth/login" className="hover:text-black">Sign In</Link>
            <Link href="/auth/register" className="hover:text-black">Create Account</Link>
            <Link href="/dashboard" className="hover:text-black">Dashboard</Link>
          </div>
        </div>
      </div>
    </div>
  )
}