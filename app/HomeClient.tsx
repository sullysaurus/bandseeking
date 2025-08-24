'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

interface HomeClientProps {
  initialProfiles: any[]
}

export default function HomeClient({ initialProfiles }: HomeClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    handleAuthCallback()
  }, [])

  const handleAuthCallback = async () => {
    try {
      // Check if this is an auth callback (email confirmation)
      const urlParams = new URLSearchParams(window.location.search)
      const code = urlParams.get('code')
      
      if (code) {
        // Clear the URL parameters immediately to prevent double processing
        window.history.replaceState({}, '', '/')
        
        try {
          // Exchange the code for a session
          const { data, error } = await supabase.auth.exchangeCodeForSession(code)
          
          if (error) {
            console.log('Code exchange error (likely already used):', error.message)
          }
          
          // Wait a moment for the session to be established
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch (exchangeError) {
          console.log('Code exchange failed, checking existing session...')
        }
      }
      
      // Now check auth status and redirect
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Redirect to onboarding, let it decide what to do next
        router.push('/onboarding')
        return
      }
    } catch (error) {
      console.error('Error in auth callback:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-yellow-300 flex items-center justify-center">
        <div className="bg-white border-4 md:border-8 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 md:h-12 md:w-12 border-b-4 border-black mx-auto mb-4"></div>
            <p className="text-xl md:text-2xl font-black">LOADING...</p>
            <p className="text-sm md:text-base font-bold text-gray-600 mt-2">CHECKING YOUR ACCOUNT</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-yellow-300">
      {/* Header */}
      <header className="border-b-8 border-black bg-white p-4 md:p-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl md:text-4xl font-black tracking-tight">BANDSEEKING</h1>
          <div className="flex gap-2 sm:gap-4">
            <Link href="/auth/login" className="px-4 py-2 bg-white border-4 border-black font-black text-sm md:text-base hover:bg-black hover:text-white transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              SIGN IN
            </Link>
            <Link href="/auth/register" className="px-4 py-2 bg-pink-400 border-4 border-black font-black text-sm md:text-base hover:bg-pink-500 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              JOIN NOW
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white border-8 border-black p-6 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8">
            <h2 className="text-4xl md:text-6xl font-black mb-4 leading-none">
              FIND YOUR<br />
              <span className="text-pink-400">PERFECT</span><br />
              BAND
            </h2>
            <p className="text-lg md:text-xl font-bold mb-8 max-w-2xl">
              Connect with musicians who get your vibe. Make real connections.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register" className="inline-block px-6 py-3 bg-black text-white border-4 border-black font-black text-lg hover:bg-pink-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                START JAMMING →
              </Link>
              <Link href="/search" className="inline-block px-6 py-3 bg-white border-4 border-black font-black text-lg hover:bg-cyan-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                BROWSE MUSICIANS
              </Link>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
            <div className="bg-pink-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <h3 className="text-2xl font-black mb-2">REAL MUSICIANS</h3>
              <p className="font-bold">No fake profiles. Just real people who actually play.</p>
            </div>
            <div className="bg-cyan-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <h3 className="text-2xl font-black mb-2">LOCAL SCENE</h3>
              <p className="font-bold">Find musicians in your area. Real connections, real jams.</p>
            </div>
            <div className="bg-lime-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <h3 className="text-2xl font-black mb-2">NO FEES</h3>
              <p className="font-bold">100% free. Forever. We&apos;re here for the music.</p>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-black text-white border-4 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="text-2xl md:text-3xl font-black mb-6 text-yellow-300">QUICK LINKS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <Link href="/search?instrument=guitar" className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors">
                → FIND GUITARISTS
              </Link>
              <Link href="/search?instrument=drums" className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors">
                → FIND DRUMMERS
              </Link>
              <Link href="/search?instrument=bass" className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors">
                → FIND BASSISTS
              </Link>
              <Link href="/search?instrument=vocals" className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors">
                → FIND VOCALISTS
              </Link>
              <Link href="/search?instrument=keyboard" className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors">
                → FIND KEYBOARDISTS
              </Link>
              <Link href="/search" className="block p-3 bg-pink-400 text-black border-2 border-white font-black hover:bg-pink-500 transition-colors">
                → VIEW ALL
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-8 border-black bg-white p-4 md:p-6 mt-8">
        <div className="max-w-6xl mx-auto text-center">
          <p className="font-black text-lg">© BANDSEEKING 2025</p>
          <p className="font-bold">Made for musicians, by musicians.</p>
        </div>
      </footer>
    </div>
  )
}