'use client'

import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'
import { AlertCircle } from 'lucide-react'

export default function AuthErrorPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-red-300 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-red-400 border-4 border-black rounded-full mb-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <AlertCircle className="w-10 h-10" />
              </div>
              
              <h1 className="text-4xl font-black mb-2">OOPS!</h1>
              <p className="font-bold text-lg">AUTHENTICATION ERROR</p>
            </div>

            <div className="mb-6 p-4 bg-yellow-100 border-4 border-black">
              <p className="font-bold text-center mb-3">THIS COULD BE BECAUSE:</p>
              <div className="space-y-2 font-bold text-sm">
                <div className="flex items-start">
                  <span className="block w-3 h-3 bg-black mt-1 mr-3 flex-shrink-0"></span>
                  <span>THE LINK HAS EXPIRED</span>
                </div>
                <div className="flex items-start">
                  <span className="block w-3 h-3 bg-black mt-1 mr-3 flex-shrink-0"></span>
                  <span>YOU&apos;RE ALREADY VERIFIED</span>
                </div>
                <div className="flex items-start">
                  <span className="block w-3 h-3 bg-black mt-1 mr-3 flex-shrink-0"></span>
                  <span>NETWORK CONNECTION ISSUES</span>
                </div>
                <div className="flex items-start">
                  <span className="block w-3 h-3 bg-black mt-1 mr-3 flex-shrink-0"></span>
                  <span>NOT ADDED AS TEST USER (IF IN TESTING MODE)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Link 
                href="/auth/login" 
                className="block px-6 py-3 bg-black text-white border-4 border-black font-black text-center hover:bg-pink-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                TRY SIGNING IN →
              </Link>
              
              <Link 
                href="/auth/register" 
                className="block px-6 py-3 bg-yellow-300 border-4 border-black font-black text-center hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                CREATE NEW ACCOUNT →
              </Link>
              
              <Link 
                href="/"
                className="block px-6 py-3 bg-white border-4 border-black font-black text-center hover:bg-cyan-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                ← BACK TO HOME
              </Link>
            </div>

            <div className="mt-6 pt-6 border-t-4 border-black">
              <p className="font-black text-center text-sm mb-2">NEED HELP?</p>
              <p className="font-bold text-center text-xs">
                TRY CLEARING YOUR BROWSER CACHE OR CONTACT SUPPORT
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}