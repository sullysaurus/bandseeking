'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

// Helper function to format last active time
const getActiveStatus = (lastActive: string | null) => {
  if (!lastActive) return { text: 'LAST SEEN: UNKNOWN', status: 'unknown' }
  
  const now = new Date()
  const lastActiveDate = new Date(lastActive)
  const diffMinutes = Math.floor((now.getTime() - lastActiveDate.getTime()) / (1000 * 60))
  
  if (diffMinutes < 5) return { text: 'ONLINE', status: 'online' }
  if (diffMinutes < 30) return { text: `${diffMinutes}M AGO`, status: 'recent' }
  if (diffMinutes < 60) return { text: 'ACTIVE RECENTLY', status: 'recent' }
  
  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return { text: `${diffHours}H AGO`, status: 'hours' }
  
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return { text: `${diffDays}D AGO`, status: 'days' }
  
  return { text: 'INACTIVE', status: 'inactive' }
}

interface HomeClientProps {
  initialProfiles: any[]
}

export default function HomeClient({ initialProfiles }: HomeClientProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [recentMusicians, setRecentMusicians] = useState<any[]>(initialProfiles || [])

  useEffect(() => {
    checkAuthStatus()
  }, [])

  const checkAuthStatus = async () => {
    try {
      // Check if user is already logged in
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Redirect to onboarding, let it decide what to do next
        router.push('/onboarding')
        return
      }
    } catch (error) {
      console.error('Error checking auth status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-lime-300 flex items-center justify-center">
        <div className="bg-white border-4 md:border-8 border-black p-8 md:p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 md:h-16 md:w-16 border-b-4 border-black mx-auto mb-6"></div>
            <h1 className="text-2xl md:text-3xl font-black mb-2">
              LOADING...
            </h1>
            <p className="text-sm md:text-lg font-bold text-gray-600">
              CHECKING YOUR ACCOUNT
            </p>
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
              Connect with musicians in your area. Always free.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register" className="inline-block px-6 py-3 bg-black text-white border-4 border-black font-black text-lg hover:bg-pink-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                START JAMMING →
              </Link>
              <button 
                onClick={() => router.push('/auth/register')}
                className="inline-block px-6 py-3 bg-white text-black border-4 border-black font-black text-lg hover:bg-cyan-300 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                BROWSE MUSICIANS
              </button>
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

          {/* Recent Musicians */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black">NEW MUSICIANS</h2>
              <Link href="/auth/register" className="px-4 py-2 bg-pink-400 border-2 border-black font-black text-sm hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                JOIN TO VIEW ALL →
              </Link>
            </div>
            
            {recentMusicians.length > 0 ? (
              <>
                {/* Mobile: Horizontal Scroll */}
                <div className="md:hidden overflow-x-auto pb-2 mb-4">
                  <div className="flex gap-3 w-max">
                    {recentMusicians.map((musician) => (
                      <div key={musician.id} className="w-48 flex-shrink-0">
                        <div className="bg-white border-2 border-black p-3 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                          <div className="flex items-center gap-2 mb-2">
                            {musician.profile_image_url ? (
                              <Image
                                src={musician.profile_image_url}
                                alt={musician.user.full_name}
                                width={40}
                                height={40}
                                className="w-10 h-10 border-2 border-black object-cover"
                              />
                            ) : (
                              <div className="w-10 h-10 border-2 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                                <div className="text-xs font-black text-white">
                                  {musician.user.full_name.charAt(0).toUpperCase()}
                                </div>
                              </div>
                            )}
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-sm truncate">{musician.user.full_name.toUpperCase()}</p>
                              <p className="text-xs text-gray-600 font-bold truncate">@{musician.user.username}</p>
                              {musician.user.city && musician.user.state && (
                                <p className="text-xs text-gray-500 font-bold truncate">
                                  {musician.user.city.toUpperCase()}, {musician.user.state.toUpperCase()}
                                </p>
                              )}
                              <div className={`text-xs font-bold ${
                                getActiveStatus(musician.user.last_active).status === 'online' ? 'text-green-600' :
                                getActiveStatus(musician.user.last_active).status === 'recent' ? 'text-yellow-600' :
                                getActiveStatus(musician.user.last_active).status === 'hours' ? 'text-orange-600' :
                                getActiveStatus(musician.user.last_active).status === 'days' ? 'text-red-600' :
                                'text-gray-500'
                              }`}>
                                {getActiveStatus(musician.user.last_active).text}
                              </div>
                            </div>
                          </div>
                          <div className="space-y-2 mb-3">
                            <span className="inline-block px-2 py-0.5 bg-pink-400 border border-black font-black text-xs">
                              {musician.main_instrument?.toUpperCase() || 'MUSICIAN'}
                            </span>
                            {musician.experience_level && (
                              <span className={`inline-block px-2 py-0.5 border border-black font-black text-xs ml-1 ${
                                musician.experience_level === 'beginner' ? 'bg-green-300' :
                                musician.experience_level === 'intermediate' ? 'bg-yellow-300' :
                                musician.experience_level === 'advanced' ? 'bg-orange-400' :
                                musician.experience_level === 'professional' ? 'bg-red-400 text-white' :
                                'bg-gray-300'
                              }`}>
                                {musician.experience_level.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div className="flex gap-1">
                            <button
                              onClick={() => router.push('/auth/register')}
                              className="flex-1 px-2 py-1 bg-black text-white border border-black font-black text-xs hover:bg-cyan-400 hover:text-black transition-colors"
                            >
                              VIEW
                            </button>
                            <button
                              onClick={() => router.push('/auth/register')}
                              className="flex-1 px-2 py-1 bg-yellow-300 border border-black font-black text-xs hover:bg-yellow-400 transition-colors"
                            >
                              MESSAGE
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Desktop: Grid */}
                <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                  {recentMusicians.map((musician) => (
                    <div key={musician.id} className="block">
                      <div className="bg-white border-2 border-black p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          {musician.profile_image_url ? (
                            <Image
                              src={musician.profile_image_url}
                              alt={musician.user.full_name}
                              width={48}
                              height={48}
                              className="w-12 h-12 border-2 border-black object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 border-2 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                              <div className="text-sm font-black text-white">
                                {musician.user.full_name.charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-black text-sm truncate">{musician.user.full_name.toUpperCase()}</p>
                            <p className="text-xs text-gray-600 font-bold truncate">@{musician.user.username}</p>
                            {musician.user.city && musician.user.state && (
                              <p className="text-xs text-gray-500 font-bold truncate">
                                {musician.user.city.toUpperCase()}, {musician.user.state.toUpperCase()}
                              </p>
                            )}
                            <div className={`text-xs font-bold ${
                              getActiveStatus(musician.user.last_active).status === 'online' ? 'text-green-600' :
                              getActiveStatus(musician.user.last_active).status === 'recent' ? 'text-yellow-600' :
                              getActiveStatus(musician.user.last_active).status === 'hours' ? 'text-orange-600' :
                              getActiveStatus(musician.user.last_active).status === 'days' ? 'text-red-600' :
                              'text-gray-500'
                            }`}>
                              {getActiveStatus(musician.user.last_active).text}
                            </div>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-1 mb-3">
                          <span className="px-2 py-1 bg-pink-400 border border-black font-black text-xs">
                            {musician.main_instrument?.toUpperCase() || 'MUSICIAN'}
                          </span>
                          {musician.experience_level && (
                            <span className={`px-2 py-1 border border-black font-black text-xs ${
                              musician.experience_level === 'beginner' ? 'bg-green-300' :
                              musician.experience_level === 'intermediate' ? 'bg-yellow-300' :
                              musician.experience_level === 'advanced' ? 'bg-orange-400' :
                              musician.experience_level === 'professional' ? 'bg-red-400 text-white' :
                              'bg-gray-300'
                            }`}>
                              {musician.experience_level.toUpperCase()}
                            </span>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => router.push('/auth/register')}
                            className="flex-1 px-3 py-2 bg-black text-white border-2 border-black font-black text-sm hover:bg-cyan-400 hover:text-black transition-colors"
                          >
                            VIEW →
                          </button>
                          <button
                            onClick={() => router.push('/auth/register')}
                            className="flex-1 px-3 py-2 bg-yellow-300 border-2 border-black font-black text-sm hover:bg-yellow-400 transition-colors"
                          >
                            MESSAGE →
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              /* No musicians fallback */
              <div className="text-center p-8 bg-white border-2 border-black">
                <h3 className="text-xl font-black mb-2">NO MUSICIANS YET</h3>
                <p className="font-bold text-gray-600 mb-4">Be the first to join our community!</p>
                <Link href="/auth/register" className="inline-block px-6 py-2 bg-pink-400 border-2 border-black font-black text-sm hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  JOIN NOW →
                </Link>
              </div>
            )}

            {/* Call to Action */}
            {recentMusicians.length > 0 && (
              <div className="text-center p-4 bg-pink-100 border-2 border-black">
                <p className="font-black text-sm mb-2">WANT TO SEE MORE MUSICIANS?</p>
                <Link href="/auth/register" className="inline-block px-6 py-2 bg-pink-400 border-2 border-black font-black text-sm hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                  JOIN BANDSEEKING FREE →
                </Link>
              </div>
            )}
          </div>

          {/* Coming Soon Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl md:text-3xl font-black mb-2">COMING SOON</h2>
              <p className="font-bold text-lg">Big features in development to make your music journey even better</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all opacity-75">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-purple-400 border-2 border-black flex items-center justify-center">
                    <span className="text-2xl font-black">🎵</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">CREATE & MANAGE BANDS</h3>
                    <span className="px-2 py-1 bg-orange-400 border border-black font-black text-xs">COMING SOON</span>
                  </div>
                </div>
                <p className="font-bold text-gray-700">
                  Form official bands, manage members, share files, and coordinate rehearsals all in one place.
                </p>
              </div>

              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all opacity-75">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-green-400 border-2 border-black flex items-center justify-center">
                    <span className="text-2xl font-black">🏟️</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">VENUE DATABASE</h3>
                    <span className="px-2 py-1 bg-orange-400 border border-black font-black text-xs">COMING SOON</span>
                  </div>
                </div>
                <p className="font-bold text-gray-700">
                  Discover local venues, check availability, and book gigs directly through the platform.
                </p>
              </div>

              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all opacity-75">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-yellow-400 border-2 border-black flex items-center justify-center">
                    <span className="text-2xl font-black">💼</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">GIG OPPORTUNITIES</h3>
                    <span className="px-2 py-1 bg-orange-400 border border-black font-black text-xs">COMING SOON</span>
                  </div>
                </div>
                <p className="font-bold text-gray-700">
                  Find paying gigs, session work, and performance opportunities posted by venues and artists.
                </p>
              </div>
            </div>

            <div className="text-center mt-6 p-4 bg-gray-100 border-2 border-black">
              <p className="font-black text-sm mb-2">WANT TO BE NOTIFIED WHEN THESE LAUNCH?</p>
              <button 
                onClick={() => router.push('/auth/register')}
                className="px-6 py-2 bg-black text-white border-2 border-black font-black text-sm hover:bg-gray-800 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                JOIN THE WAITLIST →
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-black text-white border-4 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="text-2xl md:text-3xl font-black mb-6 text-yellow-300">QUICK LINKS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <button 
                onClick={() => router.push('/auth/register')}
                className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors w-full text-left"
              >
                → FIND GUITARISTS
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors w-full text-left"
              >
                → FIND DRUMMERS
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors w-full text-left"
              >
                → FIND BASSISTS
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors w-full text-left"
              >
                → FIND VOCALISTS
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="block p-3 bg-white text-black border-2 border-white font-black hover:bg-yellow-300 transition-colors w-full text-left"
              >
                → FIND KEYBOARDISTS
              </button>
              <button 
                onClick={() => router.push('/auth/register')}
                className="block p-3 bg-pink-400 text-black border-2 border-white font-black hover:bg-pink-500 transition-colors w-full text-left"
              >
                → VIEW ALL
              </button>
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