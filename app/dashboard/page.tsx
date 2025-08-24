'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { ensureUserRecord } from '@/lib/auth-helpers'
import Navigation from '@/components/layout/Navigation'

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [savedCount, setSavedCount] = useState(0)
  const [messageCount, setMessageCount] = useState(0)
  const [recentMusicians, setRecentMusicians] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const userData = await ensureUserRecord()
      
      // Allow access to dashboard even without completed profile

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
        .neq('user_id', userData.id) // Don't show current user
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
          <div className="font-black text-2xl">LOADING...</div>
        </div>
      </>
    )
  }

  if (!user) return null

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2">
                  {new Date().getHours() < 12 ? 'GOOD MORNING!' : 
                   new Date().getHours() < 17 ? 'GOOD AFTERNOON!' : 'GOOD EVENING!'}
                </h1>
                <p className="font-bold text-xl">{user.full_name.toUpperCase()}</p>
              </div>
              {profile?.profile_image_url && (
                <Image
                  src={profile.profile_image_url}
                  alt={user.full_name}
                  width={80}
                  height={80}
                  className="w-16 h-16 md:w-20 md:h-20 border-4 border-black object-cover shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                />
              )}
            </div>
            
            {/* Quick Tips for new users */}
            {!profile?.is_published && (
              <div className="bg-gradient-to-r from-yellow-300 to-orange-300 border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">🚀</div>
                  <div>
                    <h3 className="font-black text-lg mb-2">COMPLETE YOUR PROFILE TO GET DISCOVERED!</h3>
                    <p className="font-bold text-sm mb-3">Your profile is in draft mode. Publish it to start connecting with musicians!</p>
                    <Link href="/dashboard/profile" className="inline-block px-3 py-1 bg-black text-white border-2 border-black font-black text-sm hover:bg-white hover:text-black transition-colors">
                      COMPLETE PROFILE →
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {user.email === 'dsully15@gmail.com' && (
              <Link href="/admin" className="inline-block mt-4 px-4 py-2 bg-red-500 border-4 border-black font-black text-white hover:bg-red-600 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                ADMIN PANEL →
              </Link>
            )}
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Link href="/dashboard/profile" className="block">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">{profile?.is_published ? '🟢' : '🟡'}</span>
                  <p className="font-black text-sm">STATUS</p>
                </div>
                <p className={`text-2xl font-black ${profile?.is_published ? 'text-green-500' : 'text-yellow-500'}`}>
                  {profile?.is_published ? 'LIVE' : 'DRAFT'}
                </p>
                {!profile?.is_published && (
                  <p className="text-xs font-bold text-gray-600 mt-1">Click to publish</p>
                )}
              </div>
            </Link>

            <Link href="/dashboard/saved" className="block">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">❤️</span>
                  <p className="font-black text-sm">SAVED</p>
                </div>
                <p className="text-2xl font-black text-cyan-500">{savedCount}</p>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  {savedCount === 0 ? 'Find musicians' : 'View collection'}
                </p>
              </div>
            </Link>

            <Link href="/dashboard/messages" className="block">
              <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all cursor-pointer relative">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-lg">💬</span>
                  <p className="font-black text-sm">MESSAGES</p>
                  {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-black px-2 py-1 border-2 border-black">
                      {messageCount}
                    </span>
                  )}
                </div>
                <p className="text-2xl font-black text-yellow-500">{messageCount}</p>
                <p className="text-xs font-bold text-gray-600 mt-1">
                  {messageCount === 0 ? 'No new messages' : `${messageCount} unread`}
                </p>
              </div>
            </Link>

            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">🎵</span>
                <p className="font-black text-sm">YOUR VIBE</p>
              </div>
              <p className="text-lg font-black text-purple-500">
                {profile?.main_instrument?.toUpperCase() || 'MUSICIAN'}
              </p>
              <p className="text-xs font-bold text-gray-600 mt-1">
                {profile?.experience_level || 'Set your level'}
              </p>
            </div>
          </div>

          {/* Recent Musicians */}
          {recentMusicians.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-black flex items-center gap-2">
                    ✨ FRESH TALENT
                  </h2>
                  <p className="font-bold text-sm text-gray-700">
                    {recentMusicians.length} newest musicians just joined!
                  </p>
                </div>
                <Link href="/search" className="px-3 py-1 bg-black text-white border-2 border-black font-black text-sm hover:bg-white hover:text-black transition-colors">
                  DISCOVER MORE →
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
            </div>
          )}

          {/* Quick Actions Bar */}
          <div className="bg-white border-4 border-black p-4 mb-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h3 className="font-black text-lg mb-3 flex items-center gap-2">
              ⚡ QUICK ACTIONS
            </h3>
            <div className="flex flex-wrap gap-2">
              <Link href="/search" className="px-3 py-1 bg-black text-white border-2 border-black font-black text-xs hover:bg-cyan-400 hover:text-black transition-colors">
                🔍 FIND MUSICIANS
              </Link>
              <Link href="/dashboard/profile" className="px-3 py-1 bg-pink-400 text-black border-2 border-black font-black text-xs hover:bg-pink-500 transition-colors">
                ✏️ EDIT PROFILE
              </Link>
              <Link href="/dashboard/messages" className="px-3 py-1 bg-cyan-300 text-black border-2 border-black font-black text-xs hover:bg-cyan-400 transition-colors">
                💬 MESSAGES {messageCount > 0 && `(${messageCount})`}
              </Link>
              {profile?.is_published && (
                <Link href={`/profile/${user.username}`} className="px-3 py-1 bg-lime-300 text-black border-2 border-black font-black text-xs hover:bg-lime-400 transition-colors">
                  👀 VIEW YOUR PROFILE
                </Link>
              )}
            </div>
          </div>

          {/* Main Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Browse Musicians */}
            <Link href="/search" className="block">
              <div className="bg-black text-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(255,255,255,1)] hover:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] transition-all">
                <h2 className="text-2xl font-black mb-4 text-yellow-300 flex items-center gap-2">
                  🎸 BROWSE MUSICIANS
                </h2>
                <p className="font-bold mb-4">
                  Connect with local talent. Find your perfect bandmate or collaborator!
                </p>
                <div className="bg-white text-black px-4 py-2 font-black text-center hover:bg-yellow-300 border-2 border-white transition-colors">
                  START SEARCHING →
                </div>
              </div>
            </Link>

            {/* Profile Card */}
            <Link href="/dashboard/profile" className="block">
              <div className="bg-pink-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h2 className="text-2xl font-black mb-4 flex items-center gap-2">
                  ✨ {profile?.is_published ? 'UPDATE PROFILE' : 'COMPLETE PROFILE'}
                </h2>
                <p className="font-bold mb-4">
                  {profile?.is_published 
                    ? 'Keep your profile fresh and up-to-date!'
                    : 'Finish setting up to start connecting with musicians!'
                  }
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  {profile?.is_published ? 'UPDATE →' : 'COMPLETE →'}
                </div>
              </div>
            </Link>

            {/* Messages Card */}
            <Link href="/dashboard/messages" className="block">
              <div className="bg-cyan-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-black">MESSAGES</h2>
                  {messageCount > 0 && (
                    <span className="px-2 py-1 bg-red-500 text-white font-black text-xs">
                      {messageCount}
                    </span>
                  )}
                </div>
                <p className="font-bold mb-4">
                  Chat with other musicians.
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  VIEW →
                </div>
              </div>
            </Link>

            {/* Saved Musicians Card */}
            <Link href="/dashboard/saved" className="block">
              <div className="bg-yellow-300 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h2 className="text-2xl font-black mb-4">SAVED</h2>
                <p className="font-bold mb-4">
                  Musicians you&apos;ve bookmarked.
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  VIEW ({savedCount}) →
                </div>
              </div>
            </Link>

            {/* Settings Card */}
            <Link href="/dashboard/profile" className="block">
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                <h2 className="text-2xl font-black mb-4">SETTINGS</h2>
                <p className="font-bold mb-4">
                  Account and privacy settings.
                </p>
                <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                  MANAGE →
                </div>
              </div>
            </Link>

            {/* View Public Profile */}
            {user && (
              <Link href={`/profile/${user.username}`} className="block">
                <div className="bg-lime-400 border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                  <h2 className="text-2xl font-black mb-4">YOUR PROFILE</h2>
                  <p className="font-bold mb-4">
                    See your public profile.
                  </p>
                  <div className="bg-black text-white px-4 py-2 font-black text-center hover:bg-white hover:text-black border-2 border-black transition-colors">
                    VIEW →
                  </div>
                </div>
              </Link>
            )}
          </div>
          
          {/* Pro Tips for published users */}
          {profile?.is_published && savedCount === 0 && (
            <div className="mt-8">
              <div className="bg-gradient-to-r from-blue-300 to-purple-300 border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">💡</div>
                  <div>
                    <h3 className="font-black text-lg mb-2">GET STARTED CONNECTING!</h3>
                    <p className="font-bold text-sm mb-3">Your profile is live! Start browsing musicians and save the ones you&apos;d like to collaborate with.</p>
                    <Link href="/search" className="inline-block px-3 py-1 bg-black text-white border-2 border-black font-black text-sm hover:bg-white hover:text-black transition-colors">
                      BROWSE MUSICIANS →
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}