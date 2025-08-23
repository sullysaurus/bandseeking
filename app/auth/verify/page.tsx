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
    <div className="min-h-screen bg-lime-300 flex items-center justify-center px-4 py-8 md:py-12">
      <div className="w-full max-w-md">
        <div className="bg-white border-4 md:border-8 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 md:w-20 md:h-20 bg-cyan-300 border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
              <Mail className="w-8 h-8 md:w-10 md:h-10 text-black" />
            </div>
            
            <h1 className="text-3xl md:text-4xl font-black mb-2 md:mb-4">CHECK YOUR EMAIL!</h1>
            <div className="p-4 bg-yellow-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] mb-6">
              <p className="font-bold text-sm md:text-base">
                WE&apos;VE SENT A VERIFICATION LINK TO
              </p>
              <p className="font-black text-base md:text-lg text-pink-600 mt-1">
                {email || 'YOUR EMAIL'}
              </p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="p-3 md:p-4 bg-pink-100 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-bold text-xs md:text-sm text-black">
                  CLICK THE LINK IN THE EMAIL TO VERIFY YOUR ACCOUNT AND COMPLETE YOUR PROFILE SETUP!
                </p>
              </div>

              <Link 
                href="/auth/login"
                className="block w-full px-4 md:px-6 py-3 bg-black text-white border-4 border-black font-black text-base md:text-lg hover:bg-cyan-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
              >
                ← BACK TO SIGN IN
              </Link>
            </div>
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