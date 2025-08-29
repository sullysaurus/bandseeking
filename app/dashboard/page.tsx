'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ensureUserRecord } from '@/lib/auth-helpers'
import { calculateProfileCompletion } from '@/lib/profile-utils'
import Navigation from '@/components/layout/Navigation'
import NotificationsCard from '@/components/NotificationsCard'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [savedVenuesCount, setSavedVenuesCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [recentMusicians, setRecentMusicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await ensureUserRecord()
      setUser(userData)

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      setProfile(profileData)

      const { count: savedProfilesCount } = await supabase
        .from('saved_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setSavedCount(savedProfilesCount || 0)

      const { count: savedVenuesCountData } = await supabase
        .from('saved_venues')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userData.id)

      setSavedVenuesCount(savedVenuesCountData || 0)

      const { count: unreadCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('receiver_id', userData.id)
        .eq('read', false)

      setMessageCount(unreadCount || 0)

      // Fetch recent musicians
      const { data: recentData } = await supabase
        .from('profiles')
        .select(`
          *,
          user:users(*)
        `)
        .eq('is_published', true)
        .neq('user_id', userData.id)
        .order('created_at', { ascending: false })
        .limit(6)

      setRecentMusicians(recentData || [])
    } catch (error) {
      console.error('Error loading dashboard:', error)
      router.push('/auth/login')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-lime-300 flex items-center justify-center">
          <div className="font-black text-2xl" role="status" aria-label="Loading">
            LOADING...
          </div>
        </div>
      </>
    )
  }

  if (!user) return null

  return (
    <>
      <Navigation />
      <main className="min-h-screen bg-lime-300">
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                  Welcome back, {profile?.full_name || 'Rockstar'}
                </h1>
                <p className="font-bold text-lg text-gray-700">
                  {new Date().getHours() < 12 ? 'Good morning' : 
                   new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                </p>
              </div>
              {profile?.profile_image_url && (
                <Link href="/dashboard/profile" className="block">
                  <Image
                    src={profile.profile_image_url}
                    alt={`${profile.full_name}'s profile picture`}
                    width={80}
                    height={80}
                    className="w-16 h-16 md:w-20 md:h-20 border-4 border-black object-cover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer"
                  />
                </Link>
              )}
            </div>

            {/* Profile Status */}
            {profile && (() => {
              const completion = calculateProfileCompletion(profile)
              if (completion.percentage === 100 && profile.is_published) {
                return (
                  <div className="bg-green-100 border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                    <div className="flex items-center gap-3">
                      <span className="w-4 h-4 rounded-full bg-green-500"></span>
                      <div>
                        <p className="font-black text-lg">Profile is Live! 🎸</p>
                        <p className="font-bold text-sm text-gray-700">Musicians can find and message you</p>
                      </div>
                    </div>
                  </div>
                )
              }
              return (
                <Link href="/dashboard/profile" className="block">
                  <div className="bg-yellow-100 border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="w-4 h-4 rounded-full bg-yellow-500"></span>
                        <div>
                          <p className="font-black text-lg">Profile {completion.percentage}% Complete</p>
                          <p className="font-bold text-sm text-gray-700">
                            {profile.is_published ? 'Update your info to stand out' : 'Finish setup to go live'}
                          </p>
                        </div>
                      </div>
                      <div className="text-2xl font-black text-yellow-600">{completion.percentage}%</div>
                    </div>
                  </div>
                </Link>
              )
            })()}

            {user.email === 'dsully15@gmail.com' && (
              <Link 
                href="/admin" 
                className="inline-block mb-4 px-4 py-2 bg-red-500 border-4 border-black font-black text-white hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                Admin Panel
              </Link>
            )}
          </header>

          {/* Main Actions Grid */}
          <section className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {/* Browse Musicians */}
              <Link href="/search" className="block group">
                <div className="bg-blue-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-xl font-black mb-2">BROWSE</h3>
                  <p className="font-bold text-sm mb-3">Find musicians to collaborate with</p>
                  <div className="text-lg font-black">🎵</div>
                </div>
              </Link>

              {/* Venues */}
              <Link href="/venues" className="block group">
                <div className="bg-purple-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-xl font-black mb-2">VENUES</h3>
                  <p className="font-bold text-sm mb-3">Discover places to perform</p>
                  <div className="text-lg font-black">🎤</div>
                </div>
              </Link>

              {/* Messages */}
              <Link href="/dashboard/messages" className="block group relative">
                <div className="bg-yellow-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-xl font-black mb-2">MESSAGES</h3>
                  <p className="font-bold text-sm mb-3">Chat with other musicians</p>
                  <div className="text-lg font-black">💬</div>
                  {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 border-2 border-black min-w-6 text-center">
                      {messageCount}
                    </span>
                  )}
                </div>
              </Link>

              {/* Saved Musicians */}
              <Link href="/dashboard/saved" className="block group">
                <div className="bg-pink-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-xl font-black mb-2">SAVED</h3>
                  <p className="font-bold text-sm mb-3">{savedCount} musicians saved</p>
                  <div className="text-lg font-black">♥</div>
                </div>
              </Link>

              {/* Saved Venues */}
              <Link href="/dashboard/saved-venues" className="block group">
                <div className="bg-orange-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h3 className="text-xl font-black mb-2">VENUES</h3>
                  <p className="font-bold text-sm mb-3">{savedVenuesCount} venues saved</p>
                  <div className="text-lg font-black">📍</div>
                </div>
              </Link>

              {/* My Profile */}
              {profile?.is_published ? (
                <Link href={`/profile/${profile.username}`} className="block group">
                  <div className="bg-cyan-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <h3 className="text-xl font-black mb-2">MY PROFILE</h3>
                    <p className="font-bold text-sm mb-3">View your public profile</p>
                    <div className="text-lg font-black">👤</div>
                  </div>
                </Link>
              ) : (
                <Link href="/dashboard/profile" className="block group">
                  <div className="bg-lime-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
                    <h3 className="text-xl font-black mb-2">PROFILE</h3>
                    <p className="font-bold text-sm mb-3">Complete your setup</p>
                    <div className="text-lg font-black">⚙️</div>
                  </div>
                </Link>
              )}
            </div>
          </section>

          {/* Get Started Tip */}
          {profile?.is_published && savedCount === 0 && (
            <div className="bg-gradient-to-r from-blue-200 to-purple-200 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h3 className="font-black text-xl mb-2">Ready to Connect? 🚀</h3>
              <p className="font-bold mb-4">
                Your profile is live! Start browsing musicians and save the ones you'd like to collaborate with.
              </p>
              <Link 
                href="/search" 
                className="inline-block px-6 py-3 bg-black text-white border-2 border-black font-black hover:bg-white hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                Browse Musicians →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  )
}