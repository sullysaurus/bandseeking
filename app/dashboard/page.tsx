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
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header Section */}
          <header className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl md:text-4xl font-black mb-2">
                  Welcome back, {user.full_name}
                </h1>
                <p className="font-bold text-lg text-gray-700">
                  {new Date().getHours() < 12 ? 'Good morning' : 
                   new Date().getHours() < 17 ? 'Good afternoon' : 'Good evening'}
                </p>
              </div>
              {profile?.profile_image_url && (
                <Image
                  src={profile.profile_image_url}
                  alt={`${user.full_name}'s profile picture`}
                  width={80}
                  height={80}
                  className="w-16 h-16 md:w-20 md:h-20 border-4 border-black object-cover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              )}
            </div>
            
            {/* Profile Completion Progress Bar */}
            {profile && (() => {
              const completion = calculateProfileCompletion(profile)
              return (
                <div className="bg-gradient-to-r from-lime-200 to-yellow-200 border-4 border-black p-6 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-black">PROFILE COMPLETION</h2>
                    <div className="text-2xl font-black">{completion.percentage}%</div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-300 border-4 border-black h-8 mb-4 relative overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 border-r-4 border-black transition-all duration-500 ease-out"
                      style={{ width: `${completion.percentage}%` }}
                    />
                  </div>
                  
                  {/* Encouraging Messages */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">⚡</span>
                      <p className="font-bold text-sm">
                        {completion.percentage === 100 
                          ? "Your profile is complete and looks amazing!"
                          : "Customize your defaults to get noticed by other musicians!"
                        }
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-lg">✅</span>
                      <p className="font-bold text-sm text-purple-700">Make your profile pop! 🎸</p>
                    </div>
                  </div>

                  {completion.percentage < 100 && (
                    <Link 
                      href="/dashboard/profile" 
                      className="inline-block mt-4 px-6 py-3 bg-black text-white border-4 border-black font-black text-sm hover:bg-yellow-300 hover:text-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      COMPLETE PROFILE →
                    </Link>
                  )}
                </div>
              )
            })()}
            
            {user.email === 'dsully15@gmail.com' && (
              <Link 
                href="/admin" 
                className="inline-block mt-4 px-4 py-2 bg-red-500 border-4 border-black font-black text-white hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              >
                Admin Panel
              </Link>
            )}
          </header>

          {/* Quick Stats */}
          <section className="mb-8">
            <h2 className="text-2xl font-black mb-4">Your Overview</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black text-sm mb-2">Profile Status</h3>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full ${profile?.is_published ? 'bg-green-500' : 'bg-yellow-500'}`} aria-hidden="true"></span>
                  <p className={`text-lg font-black ${profile?.is_published ? 'text-green-600' : 'text-yellow-600'}`}>
                    {profile?.is_published ? 'Live' : 'Draft'}
                  </p>
                </div>
              </div>

              <Link href="/dashboard/saved" className="block group" aria-label={`View ${savedCount} saved musicians`}>
                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
                  <h3 className="font-black text-sm mb-2">Saved Musicians</h3>
                  <p className="text-2xl font-black text-cyan-600">{savedCount}</p>
                </div>
              </Link>

              <Link href="/dashboard/saved-venues" className="block group" aria-label={`View ${savedVenuesCount} saved venues`}>
                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
                  <h3 className="font-black text-sm mb-2">Saved Venues</h3>
                  <p className="text-2xl font-black text-orange-600">{savedVenuesCount}</p>
                </div>
              </Link>

              <Link href="/dashboard/messages" className="block group relative" aria-label={`View messages${messageCount > 0 ? `, ${messageCount} unread` : ''}`}>
                <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
                  <h3 className="font-black text-sm mb-2">Messages</h3>
                  <p className="text-2xl font-black text-purple-600">{messageCount}</p>
                  {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 border-2 border-black min-w-6 text-center" aria-label={`${messageCount} unread messages`}>
                      {messageCount}
                    </span>
                  )}
                </div>
              </Link>

              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black text-sm mb-2">Your Instrument</h3>
                <p className="text-lg font-black text-pink-600">
                  {profile?.main_instrument || 'Not set'}
                </p>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  {profile?.experience_level || 'Set your level'}
                </p>
              </div>
            </div>
          </section>

          {/* Notifications */}
          <section className="mb-8">
            <NotificationsCard />
          </section>

          {/* Recent Musicians */}
          {recentMusicians.length > 0 && (
            <section className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black">Recent Musicians</h2>
                  <p className="font-bold text-sm text-gray-700">
                    {recentMusicians.length} musicians recently joined
                  </p>
                </div>
                <Link 
                  href="/search" 
                  className="px-4 py-2 bg-black text-white border-2 border-black font-black text-sm hover:bg-white hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Browse All
                </Link>
              </div>
              
              {/* Mobile: Horizontal Scroll */}
              <div className="md:hidden overflow-x-auto pb-2">
                <div className="flex gap-3 w-max">
                  {recentMusicians.map((musician) => (
                    <Link
                      key={musician.id}
                      href={`/profile/${musician.user.username}`}
                      className="block w-48 flex-shrink-0"
                    >
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
                          </div>
                        </div>
                        <div className="space-y-1">
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
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Desktop: Grid */}
              <div className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-4">
                {recentMusicians.map((musician) => (
                  <Link
                    key={musician.id}
                    href={`/profile/${musician.user.username}`}
                    className="block"
                  >
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
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1">
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
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Main Actions */}
          <section className="mb-8">
            <h2 className="text-2xl font-black mb-4">Quick Actions</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {/* Browse Musicians */}
              <Link href="/search" className="block group" aria-label="Browse and discover musicians in your area">
                <div className="bg-black text-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all h-full">
                  <h3 className="text-2xl font-black mb-4 text-yellow-300">Browse Musicians</h3>
                  <p className="font-bold mb-4">Connect with local talent and find your perfect collaborator.</p>
                  <div className="bg-white text-black px-4 py-2 font-black text-center group-hover:bg-yellow-300 border-2 border-white transition-colors">
                    Start Browsing
                  </div>
                </div>
              </Link>

              {/* Profile Management */}
              <Link href="/dashboard/profile" className="block group" aria-label={profile?.is_published ? "Update your profile" : "Complete your profile setup"}>
                <div className="bg-pink-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
                  <h3 className="text-2xl font-black mb-4">
                    {profile?.is_published ? 'Update Profile' : 'Complete Profile'}
                  </h3>
                  <p className="font-bold mb-4">
                    {profile?.is_published 
                      ? 'Keep your profile fresh and up-to-date.'
                      : 'Finish setting up to start connecting with musicians.'
                    }
                  </p>
                  <div className="bg-black text-white px-4 py-2 font-black text-center group-hover:bg-white group-hover:text-black border-2 border-black transition-colors">
                    {profile?.is_published ? 'Update' : 'Complete'}
                  </div>
                </div>
              </Link>
            </div>
          </section>

          {/* Secondary Actions */}
          <section>
            <h2 className="text-2xl font-black mb-4">Your Activity</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Link href="/dashboard/messages" className="block group" aria-label={`View messages${messageCount > 0 ? `, ${messageCount} unread` : ''}`}>
                <div className="bg-cyan-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full relative">
                  <h3 className="text-lg font-black mb-2">Messages</h3>
                  <p className="font-bold text-sm mb-3">Chat with other musicians</p>
                  {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 border-2 border-black min-w-6 text-center">
                      {messageCount}
                    </span>
                  )}
                  <div className="text-sm font-black">View Messages</div>
                </div>
              </Link>

              <Link href="/dashboard/saved" className="block group" aria-label={`View ${savedCount} saved musicians`}>
                <div className="bg-yellow-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
                  <h3 className="text-lg font-black mb-2">Saved Musicians</h3>
                  <p className="font-bold text-sm mb-3">Musicians you&apos;ve bookmarked</p>
                  <div className="text-sm font-black">View Collection ({savedCount})</div>
                </div>
              </Link>

              <Link href="/dashboard/saved-venues" className="block group" aria-label={`View ${savedVenuesCount} saved venues`}>
                <div className="bg-orange-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
                  <h3 className="text-lg font-black mb-2">Saved Venues</h3>
                  <p className="font-bold text-sm mb-3">Venues you&apos;ve bookmarked</p>
                  <div className="text-sm font-black">View Collection ({savedVenuesCount})</div>
                </div>
              </Link>

              {profile?.is_published && (
                <Link href={`/profile/${user.username}`} className="block group" aria-label="View your public profile as others see it">
                  <div className="bg-lime-400 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all h-full">
                    <h3 className="text-lg font-black mb-2">Your Profile</h3>
                    <p className="font-bold text-sm mb-3">See your public profile</p>
                    <div className="text-sm font-black">View Profile</div>
                  </div>
                </Link>
              )}
            </div>
          </section>
          
          {/* Helpful tip for published users with no saved musicians */}
          {profile?.is_published && savedCount === 0 && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-300 to-purple-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]" role="complementary">
                <h3 className="font-black text-lg mb-2">Get Started Connecting</h3>
                <p className="font-bold text-sm mb-3">
                  Your profile is live! Start browsing musicians and save the ones you&apos;d like to collaborate with.
                </p>
                <Link 
                  href="/search" 
                  className="inline-block px-4 py-2 bg-black text-white border-2 border-black font-black text-sm hover:bg-white hover:text-black transition-colors focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
                >
                  Browse Musicians
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}