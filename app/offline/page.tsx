'use client'

import { WifiOff, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'

export default function OfflinePage() {
  const handleRefresh = () => {
    window.location.reload()
  }

  return (
    <div className="min-h-screen bg-red-400 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="bg-white border-8 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-300 border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <WifiOff className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-4">OFFLINE!</h1>
            <p className="font-bold text-xl mb-6">
              THE SIGNAL DROPPED OUT!
            </p>
          </div>

          <div className="bg-yellow-300 border-4 border-black p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-lg mb-4">WHILE YOU&apos;RE OFFLINE:</h3>
            <ul className="text-left space-y-3 font-bold">
              <li>→ SOME FEATURES WON&apos;T WORK</li>
              <li>→ DATA WILL SYNC WHEN RECONNECTED</li>
              <li>→ MESSAGES WON&apos;T SEND YET</li>
            </ul>
          </div>

          <div className="space-y-6">
            <button 
              onClick={handleRefresh} 
              className="flex items-center mx-auto px-6 py-3 bg-lime-300 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-lime-400 transition-all"
            >
              <RefreshCw className="w-5 h-5 mr-2" />
              TRY AGAIN
            </button>

            <Link href="/" className="block">
              <button className="flex items-center mx-auto px-6 py-3 bg-cyan-300 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-cyan-400 transition-all">
                <Home className="w-5 h-5 mr-2" />
                BACK TO HOME
              </button>
            </Link>
          </div>

          <div className="mt-8 bg-purple-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-bold">CONNECTION WILL RESTORE AUTOMATICALLY WHEN YOUR NETWORK IS BACK.</p>
          </div>
        </div>
      </div>
    </div>
  )
}