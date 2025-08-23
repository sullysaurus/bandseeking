import { Construction, Clock, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-orange-400 flex items-center justify-center px-4">
      <div className="text-center">
        <div className="bg-white border-8 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-300 border-4 border-black mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <Construction className="w-10 h-10 text-black" />
            </div>
            <h1 className="text-6xl md:text-8xl font-black mb-4">MAINTENANCE!</h1>
            <p className="font-bold text-xl mb-6">
              BANDSEEKING IS GETTING A TUNE-UP!
            </p>
          </div>

          <div className="bg-lime-300 border-4 border-black p-6 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-black mr-3" />
              <span className="font-black text-lg">EXPECTED DURATION</span>
            </div>
            <p className="text-4xl font-black mb-2">30 MINUTES</p>
            <p className="font-bold">
              WE&apos;LL BE BACK ONLINE SHORTLY. THANKS FOR YOUR PATIENCE!
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-cyan-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-lg mb-4">WHAT WE&apos;RE WORKING ON:</p>
              <ul className="text-left space-y-2 font-bold">
                <li>→ PERFORMANCE IMPROVEMENTS</li>
                <li>→ DATABASE OPTIMIZATIONS</li>
                <li>→ NEW FEATURE DEPLOYMENT</li>
                <li>→ SECURITY UPDATES</li>
              </ul>
            </div>

            <Link href="/" className="inline-block">
              <button className="flex items-center px-6 py-3 bg-pink-400 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-500 transition-all">
                <ArrowLeft className="w-5 h-5 mr-2" />
                BACK TO HOME
              </button>
            </Link>
          </div>

          <div className="mt-8 bg-purple-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <p className="font-black mb-2">FOLLOW US FOR UPDATES:</p>
            <div className="space-x-6">
              <span className="font-bold hover:text-pink-600 cursor-pointer">TWITTER</span>
              <span className="font-bold hover:text-pink-600 cursor-pointer">INSTAGRAM</span>
              <span className="font-bold hover:text-pink-600 cursor-pointer">STATUS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}