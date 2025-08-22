import Link from 'next/link'
import Button from '@/components/ui/Button'
import { AlertCircle, ArrowLeft, Mail } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
          <AlertCircle className="w-8 h-8 text-red-500" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Authentication Error</h1>
        <p className="text-gray-600 mb-6">
          There was a problem with your authentication. This could be due to:
        </p>

        <div className="text-left mb-6 space-y-2 text-sm text-gray-600">
          <div className="flex items-start">
            <span className="block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Expired or invalid verification link</span>
          </div>
          <div className="flex items-start">
            <span className="block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Email address already verified</span>
          </div>
          <div className="flex items-start">
            <span className="block w-2 h-2 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
            <span>Network connectivity issues</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <Link href="/auth/login" className="flex-1">
              <Button className="w-full">
                Try Signing In
              </Button>
            </Link>
            <Link href="/auth/register" className="flex-1">
              <Button variant="secondary" className="w-full">
                Create New Account
              </Button>
            </Link>
          </div>

          <Link href="/">
            <Button variant="ghost" className="flex items-center mx-auto">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
          </Link>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-center mb-2">
            <Mail className="w-4 h-4 mr-2 text-gray-500" />
            <span className="text-sm font-medium">Need Help?</span>
          </div>
          <p className="text-xs text-gray-600">
            If you continue to experience issues, try clearing your browser cache or contact support.
          </p>
        </div>
      </div>
    </div>
  )
}