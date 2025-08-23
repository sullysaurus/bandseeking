'use client'

import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import GoogleAuthButton from '@/components/auth/GoogleAuthButton'

export default function RegisterClient() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-pink-300 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-black mb-2">JOIN THE BAND!</h1>
              <p className="font-bold text-lg">START YOUR MUSIC JOURNEY</p>
            </div>

            <div className="space-y-4">
              <GoogleAuthButton text="SIGN UP WITH GOOGLE" />
              
              <p className="text-center font-bold text-sm text-gray-600 mt-4">
                WE'LL COLLECT YOUR DETAILS AFTER SIGN UP
              </p>
            </div>

            <div className="mt-8 pt-6 border-t-4 border-black">
              <p className="text-center font-bold">
                ALREADY A MEMBER?
              </p>
              <Link 
                href="/auth/login" 
                className="block mt-2 px-6 py-3 bg-cyan-300 border-4 border-black font-black text-center hover:bg-cyan-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                SIGN IN →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}