'use client'

import Link from 'next/link'
import Navigation from '@/components/layout/Navigation'

export default function NotFound() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-red-400 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="bg-white border-8 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-6xl md:text-8xl font-black mb-4">404</h1>
            <h2 className="text-2xl md:text-3xl font-black mb-4">PAGE NOT FOUND!</h2>
            <p className="font-bold text-lg mb-8 max-w-md">
              LOOKS LIKE THIS PAGE WENT ON TOUR AND NEVER CAME BACK.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                href="/" 
                className="px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-yellow-300 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                GO HOME →
              </Link>
              <Link 
                href="/search" 
                className="px-6 py-3 bg-cyan-300 border-4 border-black font-black hover:bg-cyan-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                FIND MUSICIANS →
              </Link>
            </div>
            <button 
              onClick={() => window.history.back()} 
              className="mt-6 font-black text-sm hover:text-pink-400 transition-colors"
            >
              ← GO BACK
            </button>
          </div>
        </div>
      </div>
    </>
  )
}