'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-orange-400 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-white border-8 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-6xl md:text-8xl font-black mb-4">OOPS!</h1>
            <h2 className="text-2xl md:text-3xl font-black mb-4">SOMETHING WENT WRONG</h2>
            <p className="font-bold text-lg mb-8 max-w-md">
              THE AMP BLEW A FUSE. LET&apos;S TRY THAT AGAIN.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={reset}
                className="px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-lime-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                TRY AGAIN →
              </button>
              <Link 
                href="/" 
                className="px-6 py-3 bg-yellow-300 border-4 border-black font-black hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                GO HOME →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}