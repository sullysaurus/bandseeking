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
        // Get the user's profile to redirect to their profile page
        const { data: profile } = await supabase
          .from('profiles')
          .select('username')
          .eq('user_id', user.id)
          .single()

        if (profile?.username) {
          // Redirect to their profile page
          router.push(`/profile/${profile.username}`)
        } else {
          // Fallback to dashboard if no profile found
          router.push('/dashboard')
        }
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
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "BandSeeking",
            "url": "https://www.bandseeking.com",
            "description": "Find and connect with musicians in your area for bands, collaborations, and music projects",
            "potentialAction": {
              "@type": "SearchAction",
              "target": "https://www.bandseeking.com/search?q={search_term_string}",
              "query-input": "required name=search_term_string"
            },
            "sameAs": [
              "https://instagram.com/bandseeking"
            ]
          })
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "BandSeeking",
            "url": "https://www.bandseeking.com",
            "logo": "https://www.bandseeking.com/logo.png",
            "description": "A platform connecting musicians for bands, collaborations, and music projects",
            "foundingDate": "2025",
            "sameAs": [
              "https://instagram.com/bandseeking"
            ],
            "contactPoint": {
              "@type": "ContactPoint",
              "contactType": "customer service",
              "url": "https://instagram.com/bandseeking"
            }
          })
        }}
      />
      
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
              A BETTER WAY<br />
              <span className="text-pink-400">TO FIND</span><br />
              MUSICIANS
            </h2>
            <p className="text-lg md:text-xl font-bold mb-8 max-w-2xl">
              Connect instantly with musicians in your area. See who&apos;s online, message for free, and start making music together today!
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
              <h3 className="text-2xl font-black mb-2">INSTANT MESSAGING</h3>
              <p className="font-bold">Chat directly with musicians. See who&apos;s online and start conversations instantly!</p>
            </div>
            <div className="bg-cyan-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <h3 className="text-2xl font-black mb-2">LIVE ACTIVITY</h3>
              <p className="font-bold">See when musicians were last active. Connect with people who are actually available to jam!</p>
            </div>
            <div className="bg-lime-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
              <h3 className="text-2xl font-black mb-2">ALWAYS FREE</h3>
              <p className="font-bold">100% free forever. No hidden fees, no premium tiers. Just musicians helping musicians!</p>
            </div>
          </div>

          {/* Recent Musicians */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl md:text-3xl font-black">FRESH TALENT</h2>
              <Link href="/auth/register" className="px-4 py-2 bg-pink-400 border-2 border-black font-black text-sm hover:bg-pink-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                JOIN TO VIEW ALL →
              </Link>
            </div>
            
            {recentMusicians.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                {recentMusicians.slice(0, 4).map((musician) => (
                  <div key={musician.id} className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                    
                    {/* Musician Header */}
                    <div className="mb-4">
                      <div className="flex items-start gap-4 mb-3">
                        {/* Profile Photo */}
                        <div className="flex-shrink-0">
                          {musician.profile_image_url ? (
                            <Image
                              src={musician.profile_image_url}
                              alt={musician.full_name}
                              width={64}
                              height={64}
                              className="w-16 h-16 border-4 border-black object-cover"
                            />
                          ) : (
                            <div className="w-16 h-16 border-4 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                              <div className="text-xl font-black text-white">
                                {(musician.full_name || 'Musician').charAt(0).toUpperCase()}
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Name and Username */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-black text-xl mb-1 leading-tight">{(musician.full_name || 'Musician').toUpperCase()}</h3>
                          <p className="font-bold text-sm text-gray-600">@{musician.username || 'user'}</p>
                        </div>
                      </div>

                      {/* Key Tags Row */}
                      <div className="flex flex-wrap gap-2">
                        {/* Last Active Status */}
                        {(() => {
                          const activeStatus = getActiveStatus(musician.last_active)
                          return (
                            <span className={`px-2 py-1 border-2 border-black font-black text-xs ${
                              activeStatus.status === 'online' ? 'bg-green-400' :
                              activeStatus.status === 'recent' ? 'bg-yellow-400' :
                              activeStatus.status === 'hours' ? 'bg-orange-400' :
                              activeStatus.status === 'days' ? 'bg-red-400' :
                              'bg-gray-400'
                            }`}>
                              {activeStatus.text}
                            </span>
                          )
                        })()}
                        
                        {/* Primary Instrument */}
                        <span className="px-2 py-1 bg-pink-400 border-2 border-black font-black text-xs">
                          {musician.main_instrument?.toUpperCase() || 'MUSICIAN'}
                        </span>
                        
                        {/* Experience Level */}
                        {musician.experience_level && (
                          <span className={`px-2 py-1 border-2 border-black font-black text-xs ${
                            musician.experience_level === 'beginner' ? 'bg-green-300' :
                            musician.experience_level === 'intermediate' ? 'bg-yellow-300' :
                            musician.experience_level === 'advanced' ? 'bg-orange-400' :
                            musician.experience_level === 'professional' ? 'bg-red-400 text-white' :
                            'bg-gray-300'
                          }`}>
                            {musician.experience_level.toUpperCase()}
                          </span>
                        )}

                        {/* Location */}
                        {(musician.city || musician.state) && (
                          <span className="px-2 py-1 bg-cyan-300 border-2 border-black font-black text-xs">
                            📍 {(musician.city || '').toUpperCase()}{musician.city && musician.state ? ', ' : ''}{(musician.state || '').toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bio in highlighted box */}
                    {musician.bio && (
                      <div className="mb-4 p-3 bg-gray-50 border-2 border-black">
                        <p className="font-bold text-sm line-clamp-3">
                          &quot;{musician.bio}&quot;
                        </p>
                      </div>
                    )}

                    {/* Instruments Section */}
                    {musician.secondary_instruments && musician.secondary_instruments.length > 0 && (
                      <div className="mb-4">
                        <p className="font-black text-sm mb-2">ALSO PLAYS:</p>
                        <div className="flex flex-wrap gap-1">
                          {musician.secondary_instruments.slice(0, 3).map((instrument: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-300 border-2 border-black font-black text-xs"
                            >
                              {instrument.toUpperCase()}
                            </span>
                          ))}
                          {musician.secondary_instruments.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                              +{musician.secondary_instruments.length - 3} MORE
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Looking For */}
                    {musician.seeking && musician.seeking.length > 0 && (
                      <div className="mb-4">
                        <p className="font-black text-sm mb-2">LOOKING FOR:</p>
                        <div className="flex flex-wrap gap-1">
                          {musician.seeking.slice(0, 3).map((item: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-lime-300 border-2 border-black font-black text-xs"
                            >
                              {item.toUpperCase()}
                            </span>
                          ))}
                          {musician.seeking.length > 3 && (
                            <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                              +{musician.seeking.length - 3} MORE
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2 border-t-2 border-black">
                      <button 
                        onClick={() => router.push('/auth/register')}
                        className="flex-1 px-3 py-1 bg-black text-white border-2 border-black font-black text-sm text-center hover:bg-cyan-400 hover:text-black transition-colors"
                      >
                        VIEW →
                      </button>
                      <button 
                        onClick={() => router.push('/auth/register')}
                        className="flex-1 px-3 py-1 bg-yellow-300 border-2 border-black font-black text-sm text-center hover:bg-yellow-400 transition-colors"
                      >
                        MESSAGE →
                      </button>
                      <button 
                        onClick={() => router.push('/auth/register')}
                        className="px-3 py-1 border-2 border-black font-black text-sm transition-colors bg-white hover:bg-lime-300"
                      >
                        ♡
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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


          {/* Quick Links */}
          <div className="bg-black text-white border-4 border-black p-6 md:p-8 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]">
            <h3 className="text-2xl md:text-3xl font-black mb-6 text-yellow-300">QUICK LINKS</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
                onClick={() => router.push('/venues')}
                className="block p-3 bg-orange-400 text-black border-2 border-white font-black hover:bg-orange-500 transition-colors w-full text-left"
              >
                → FIND VENUES
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
              <button 
                onClick={() => router.push('/auth/register')}
                className="block p-3 bg-cyan-400 text-black border-2 border-white font-black hover:bg-cyan-500 transition-colors w-full text-left"
              >
                → JOIN NOW
              </button>
            </div>
          </div>
        </div>
      </section>
      </div>
    </>
  )
}