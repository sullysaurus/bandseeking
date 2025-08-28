'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getLastActiveStatus } from '@/lib/auth-helpers'
import { formatLocationDisplay } from '@/lib/zipcode-utils'
import { getYouTubeEmbedUrl } from '@/lib/youtube-utils'
import Navigation from '@/components/layout/Navigation'
import { useRouter } from 'next/navigation'

export default function ProfileClient() {
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  const [profile, setProfile] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    checkCurrentUser()
  }, [username])

  const fetchProfile = async () => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single()

      if (error) throw error
      setProfile(profileData)
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    setCurrentUser(user)
    
    if (user && profile) {
      const { data } = await supabase
        .from('saved_profiles')
        .select('*')
        .eq('user_id', user.id)
        .eq('saved_profile_id', profile.id)
        .single()
      
      setIsSaved(!!data)
    }
  }

  const handleSave = async () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    if (!profile) return

    if (isSaved) {
      await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('saved_profile_id', profile.id)
    } else {
      await supabase
        .from('saved_profiles')
        .insert({
          user_id: currentUser.id,
          saved_profile_id: profile.id
        })
    }
    setIsSaved(!isSaved)
  }

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    
    if (!profile) return
    
    router.push(`/dashboard/messages/${profile.user_id}`)
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-pink-300 flex items-center justify-center">
          <div className="font-black text-2xl">LOADING PROFILE...</div>
        </div>
      </>
    )
  }

  if (!profile) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-pink-300 flex items-center justify-center">
          <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <h1 className="text-2xl font-black mb-4">PROFILE NOT FOUND</h1>
            <p className="font-bold mb-6">This musician doesn&apos;t exist or has been removed.</p>
            <Link href="/search" className="inline-block px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-yellow-300 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              FIND MUSICIANS →
            </Link>
          </div>
        </div>
      </>
    )
  }

  // Check if this is the user's own profile
  const isOwnProfile = currentUser?.id === profile.user_id

  // Show draft warning for unpublished profiles
  const showDraftWarning = !profile.is_published && isOwnProfile

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-pink-300">
        <div className="max-w-4xl mx-auto px-4 py-8">
          
          {/* Draft Warning */}
          {showDraftWarning && (
            <div className="bg-yellow-300 border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-black text-lg mb-1">⚠️ PROFILE IN DRAFT MODE</h3>
                  <p className="font-bold text-sm">Complete your profile to make it visible to other musicians!</p>
                </div>
                <Link 
                  href="/dashboard/profile"
                  className="px-4 py-2 bg-black text-white border-2 border-black font-black text-sm hover:bg-white hover:text-black transition-colors"
                >
                  EDIT PROFILE →
                </Link>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <div className="flex flex-col md:flex-row gap-6">
              
              {/* Profile Picture */}
              <div className="flex-shrink-0">
                <div className="relative">
                  <Image
                    src={profile.profile_image_url || '/logo.png'}
                    alt={profile.username}
                    width={200}
                    height={200}
                    className="border-4 border-black object-cover w-48 h-48"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <h1 className="text-4xl font-black mb-2">@{profile.username}</h1>
                  <p className="font-bold text-xl text-gray-600">@{profile.username}</p>
                </div>

                {/* Status Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.last_active && (() => {
                    const activeStatus = getLastActiveStatus(profile.last_active)
                    return (
                      <span className={`px-3 py-1 border-2 border-black font-black text-sm ${
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
                  
                  <span className="px-3 py-1 bg-pink-400 border-2 border-black font-black text-sm">
                    {profile.main_instrument?.toUpperCase() || 'MUSICIAN'}
                  </span>
                  
                  {profile.experience_level && (
                    <span className={`px-3 py-1 border-2 border-black font-black text-sm ${
                      profile.experience_level === 'beginner' ? 'bg-green-300' :
                      profile.experience_level === 'intermediate' ? 'bg-yellow-300' :
                      profile.experience_level === 'advanced' ? 'bg-orange-400' :
                      profile.experience_level === 'professional' ? 'bg-red-400 text-white' :
                      'bg-gray-300'
                    }`}>
                      {profile.experience_level.toUpperCase()}
                    </span>
                  )}

                  {profile.zip_code && (
                    <span className="px-3 py-1 bg-cyan-300 border-2 border-black font-black text-sm">
                      📍 {formatLocationDisplay(profile.zip_code)}
                    </span>
                  )}
                </div>

                {/* Action Buttons */}
                {!isOwnProfile && currentUser && (
                  <div className="flex gap-3">
                    <button
                      onClick={handleMessage}
                      className="px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-yellow-300 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    >
                      SEND MESSAGE →
                    </button>
                    
                    <button
                      onClick={handleSave}
                      className={`px-4 py-3 border-4 border-black font-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                        isSaved 
                          ? 'bg-pink-400 hover:bg-pink-500' 
                          : 'bg-white hover:bg-lime-300'
                      }`}
                    >
                      {isSaved ? '♥ SAVED' : '♡ SAVE'}
                    </button>
                  </div>
                )}

                {isOwnProfile && (
                  <Link 
                    href="/dashboard/profile"
                    className="inline-block px-6 py-3 bg-yellow-300 border-4 border-black font-black hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    EDIT PROFILE →
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Bio Section */}
          {profile.bio && (
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
              <h2 className="text-2xl font-black mb-4">ABOUT</h2>
              <p className="font-bold text-lg leading-relaxed">{profile.bio}</p>
            </div>
          )}

          {/* Music Details Grid */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            
            {/* Instruments */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">🎸 INSTRUMENTS</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-black text-sm">PRIMARY:</span>
                  <div className="mt-1">
                    <span className="inline-block px-3 py-1 bg-pink-400 border-2 border-black font-black text-sm">
                      {profile.main_instrument?.toUpperCase() || 'NOT SPECIFIED'}
                    </span>
                  </div>
                </div>
                
                {profile.secondary_instruments && profile.secondary_instruments.length > 0 && (
                  <div>
                    <span className="font-black text-sm">ALSO PLAYS:</span>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {profile.secondary_instruments.map((instrument: string, index: number) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-purple-300 border-2 border-black font-black text-xs"
                        >
                          {instrument.toUpperCase()}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* What They're Looking For */}
            {profile.seeking && profile.seeking.length > 0 && (
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">🎯 LOOKING FOR</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.seeking.map((item: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-lime-300 border-2 border-black font-black text-sm"
                    >
                      {item.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* YouTube Video */}
          {profile.social_links?.youtube && (() => {
            const embedUrl = getYouTubeEmbedUrl(profile.social_links.youtube)
            if (!embedUrl) return null
            return (
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
                <h2 className="text-2xl font-black mb-4">🎬 FEATURED VIDEO</h2>
                <div className="relative" style={{ paddingBottom: '56.25%', height: 0 }}>
                  <iframe
                    src={embedUrl}
                    title="YouTube video"
                    className="absolute top-0 left-0 w-full h-full border-4 border-black"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )
          })()}

          {/* Social Links */}
          {profile.social_links && Object.values(profile.social_links).some(Boolean) && (
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
              <h2 className="text-2xl font-black mb-4">🔗 LISTEN & FOLLOW</h2>
              <div className="flex flex-wrap gap-3">
                {profile.social_links.youtube && (
                  <a
                    href={profile.social_links.youtube}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-red-500 text-white border-2 border-black font-black text-sm hover:bg-red-600 transition-colors"
                  >
                    YOUTUBE →
                  </a>
                )}
                {profile.social_links.spotify && (
                  <a
                    href={profile.social_links.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-green-500 text-white border-2 border-black font-black text-sm hover:bg-green-600 transition-colors"
                  >
                    SPOTIFY →
                  </a>
                )}
                {profile.social_links.instagram && (
                  <a
                    href={profile.social_links.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white border-2 border-black font-black text-sm hover:from-purple-600 hover:to-pink-600 transition-colors"
                  >
                    INSTAGRAM →
                  </a>
                )}
                {profile.social_links.soundcloud && (
                  <a
                    href={profile.social_links.soundcloud}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-orange-500 text-white border-2 border-black font-black text-sm hover:bg-orange-600 transition-colors"
                  >
                    SOUNDCLOUD →
                  </a>
                )}
                {profile.social_links.bandcamp && (
                  <a
                    href={profile.social_links.bandcamp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-cyan-500 text-white border-2 border-black font-black text-sm hover:bg-cyan-600 transition-colors"
                  >
                    BANDCAMP →
                  </a>
                )}
                {profile.social_links.appleMusic && (
                  <a
                    href={profile.social_links.appleMusic}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800 text-white border-2 border-black font-black text-sm hover:bg-gray-900 transition-colors"
                  >
                    APPLE MUSIC →
                  </a>
                )}
              </div>
            </div>
          )}

          {/* Additional Details Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Genres */}
            {profile.genres && profile.genres.length > 0 && (
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">🎵 GENRES</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-300 border-2 border-black font-black text-sm"
                    >
                      {genre.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Influences */}
            {profile.influences && (
              <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">✨ INFLUENCES</h2>
                <p className="font-bold">{profile.influences}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}