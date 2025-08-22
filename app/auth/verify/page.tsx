'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Button from '@/components/ui/Button'
import { Mail } from 'lucide-react'
import { Suspense } from 'react'

function VerifyContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-6">
          <Mail className="w-8 h-8" />
        </div>
        
        <h1 className="text-3xl font-bold mb-2">Check Your Email</h1>
        <p className="text-gray-600 mb-6">
          We&apos;ve sent a verification link to{' '}
          <span className="font-medium text-black">{email || 'your email'}</span>
        </p>

        <div className="space-y-4">
          <p className="text-sm text-gray-500">
            Please click the link in the email to verify your account and complete your profile setup.
          </p>

          <div className="pt-4">
            <Link href="/auth/login">
              <Button variant="secondary" className="w-full">
                Return to Sign In
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyContent />
    </Suspense>
  )
}