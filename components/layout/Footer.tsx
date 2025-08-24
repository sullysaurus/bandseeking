'use client'

import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-8 border-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Logo/Brand */}
          <div className="text-center md:text-left">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-4">
              <div className="flex-shrink-0">
                <Image
                  src="/logo.png"
                  alt="BandSeeking Logo"
                  width={80}
                  height={80}
                  className="w-16 h-16 md:w-20 md:h-20 bg-white border-4 border-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]"
                />
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-2xl font-black mb-2">BANDSEEKING</h3>
                <p className="font-bold text-gray-300 mb-2">Find musicians. Make music.</p>
                <p className="font-bold text-gray-400 text-sm">
                  Connect • Collaborate • Create
                </p>
              </div>
            </div>
          </div>
          
          {/* Quick Links */}
          <div className="text-center md:text-left">
            <h4 className="text-lg font-black mb-4 text-yellow-300">QUICK LINKS</h4>
            <div className="space-y-2">
              <Link href="/search" className="block font-bold text-gray-300 hover:text-white transition-colors">
                Browse Musicians
              </Link>
              <Link href="/auth/register" className="block font-bold text-gray-300 hover:text-white transition-colors">
                Join BandSeeking
              </Link>
              <Link href="/auth/login" className="block font-bold text-gray-300 hover:text-white transition-colors">
                Sign In
              </Link>
            </div>
          </div>
          
          {/* Help Section */}
          <div className="text-center md:text-right">
            <h4 className="text-lg font-black mb-4 text-cyan-300">GET SUPPORT</h4>
            <p className="font-bold text-gray-300 mb-4">Questions? We&apos;re here to help!</p>
            <a
              href="https://instagram.com/bandseeking"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-4 py-2 bg-pink-500 border-4 border-white text-white font-black text-sm hover:bg-pink-600 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            >
              📱 INSTAGRAM SUPPORT
            </a>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t-2 border-gray-600 mt-8 pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="BandSeeking"
                width={32}
                height={32}
                className="w-8 h-8 bg-white border-2 border-gray-400"
              />
              <p className="font-bold text-gray-400 text-sm">
                © 2024 BANDSEEKING. ALL RIGHTS RESERVED.
              </p>
            </div>
            <p className="font-bold text-gray-500 text-xs">
              Made with 🎵 for musicians everywhere
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}