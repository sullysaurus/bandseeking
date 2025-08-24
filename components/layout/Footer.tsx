'use client'

import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-8 border-white mt-16">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo/Brand */}
          <div className="text-center md:text-left">
            <h3 className="text-2xl font-black mb-2">BANDSEEKING</h3>
            <p className="font-bold text-gray-300">Find musicians. Make music.</p>
          </div>
          
          {/* Help Section */}
          <div className="text-center">
            <p className="font-bold text-gray-300 mb-4">Need Help?</p>
            <a
              href="https://instagram.com/bandseeking"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block px-6 py-3 bg-pink-500 border-4 border-white text-white font-black hover:bg-pink-600 transition-colors shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,1)]"
            >
              DM US ON INSTAGRAM →
            </a>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="border-t-2 border-gray-600 mt-8 pt-6 text-center">
          <p className="font-bold text-gray-400 text-sm">
            © 2024 BANDSEEKING. ALL RIGHTS RESERVED.
          </p>
        </div>
      </div>
    </footer>
  )
}