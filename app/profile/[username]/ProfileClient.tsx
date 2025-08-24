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
  const [user, setUser] = useState<any>(null)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    checkCurrentUser()
  }, [username])

  const fetchProfile = async () => {
    try {
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('username', username)
        .single()

      if (userError) throw userError
      setUser(userData)

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userData.id)
        .single()

      if (profileError) throw profileError
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
        .eq('saved_user_id', profile.user_id)
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
        .eq('saved_user_id', profile.user_id)
    } else {
      await supabase
        .from('saved_profiles')
        .insert({
          user_id: currentUser.id,
          saved_user_id: profile.user_id
        })
    }
    setIsSaved(!isSaved)
  }

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    router.push(`/dashboard/messages/${profile.user_id}`)
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-cyan-300 flex items-center justify-center">
          <div className="font-black text-2xl">LOADING PROFILE...</div>
        </div>
      </>
    )
  }

  if (!profile || !user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-red-300 flex items-center justify-center">
          <div className="bg-white border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">PROFILE NOT FOUND</h2>
            <p className="font-bold mb-6">This musician profile could not be found.</p>
            <Link 
              href="/"
              className="inline-block px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-cyan-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
            >
              BACK TO HOME →
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-cyan-300">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Profile Info */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <div className="bg-white border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                  <div className="aspect-square relative bg-gray-100 border-b-4 border-black">
                    {profile.profile_image_url ? (
                      <Image
                        src={profile.profile_image_url}
                        alt={user.full_name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                        <div className="text-6xl font-black text-white">
                          {user.full_name.charAt(0).toUpperCase()}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <h1 className="text-2xl font-black mb-1">{user.full_name.toUpperCase()}</h1>
                    <p className="font-bold text-gray-600 mb-4">@{user.username}</p>
                  
                  {/* Edit button for own profile */}
                  {currentUser && currentUser.id === user.id && (
                    <div className="mb-4">
                      <Link 
                        href="/dashboard/profile"
                        className="block w-full px-4 py-3 bg-black text-white border-4 border-black font-black text-center hover:bg-yellow-300 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        EDIT PROFILE →
                      </Link>
                    </div>
                  )}
                  
                  {/* Action buttons for other users */}
                  {currentUser && currentUser.id !== user.id && (
                    <div className="flex gap-2 mb-4">
                      <button 
                        onClick={handleMessage}
                        className="flex-1 px-4 py-3 bg-yellow-300 border-4 border-black font-black hover:bg-yellow-400 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        MESSAGE →
                      </button>
                      <button
                        onClick={handleSave}
                        className={`px-4 py-3 border-4 border-black font-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] ${
                          isSaved 
                            ? 'bg-pink-400 hover:bg-pink-500' 
                            : 'bg-white hover:bg-lime-300'
                        }`}
                      >
                        {isSaved ? '♥' : '♡'}
                      </button>
                    </div>
                  )}
                  
                  {/* Login prompt for non-users */}
                  {!currentUser && (
                    <div className="flex gap-2 mb-4">
                      <Link 
                        href="/auth/login"
                        className="flex-1 px-4 py-3 bg-black text-white border-4 border-black font-black text-center hover:bg-cyan-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                      >
                        LOGIN TO MESSAGE →
                      </Link>
                    </div>
                  )}

                  {/* Quick Info Tags */}
                  <div className="space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <span className="px-3 py-1 bg-pink-400 border-2 border-black font-black text-xs">
                        {profile.main_instrument?.toUpperCase() || 'MUSICIAN'}
                      </span>
                      {profile.experience_level && (
                        <span className={`px-3 py-1 border-2 border-black font-black text-xs ${
                          profile.experience_level === 'beginner' ? 'bg-green-300' :
                          profile.experience_level === 'intermediate' ? 'bg-yellow-300' :
                          profile.experience_level === 'advanced' ? 'bg-orange-400' :
                          profile.experience_level === 'professional' ? 'bg-red-400 text-white' :
                          'bg-gray-300'
                        }`}>
                          {profile.experience_level.toUpperCase()}
                        </span>
                      )}
                      {user.zip_code && (
                        <span className="px-3 py-1 bg-cyan-300 border-2 border-black font-black text-xs">
                          📍 {formatLocationDisplay(user.zip_code)}
                        </span>
                      )}
                    </div>
                    
                    {/* Additional Info */}
                    <div className="space-y-2 pt-3">
                      {user.last_active && (() => {
                        const activeStatus = getLastActiveStatus(user.last_active)
                        return (
                          <div className={`font-bold text-sm ${
                            activeStatus.status === 'online' ? 'text-green-600' :
                            activeStatus.status === 'recent' ? 'text-yellow-600' :
                            activeStatus.status === 'hours' ? 'text-orange-600' :
                            activeStatus.status === 'days' ? 'text-red-600' :
                            'text-gray-500'
                          }`}>
                            {activeStatus.text}
                          </div>
                        )
                      })()}
                      {profile.availability && (
                        <div className="font-bold text-sm">
                          AVAILABILITY: {profile.availability.toUpperCase()}
                        </div>
                      )}
                      {profile.has_transportation && (
                        <div className="font-bold text-sm text-green-600">
                          HAS TRANSPORTATION
                        </div>
                      )}
                      {profile.has_own_equipment && (
                        <div className="font-bold text-sm text-blue-600">
                          HAS OWN EQUIPMENT
                        </div>
                      )}
                      <div className="font-bold text-sm">
                        WILL TRAVEL: {profile.willing_to_travel_miles} MILES
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">ABOUT</h2>
                <p className="font-bold text-gray-700 whitespace-pre-wrap leading-relaxed">{profile.bio}</p>
              </div>
            )}

            {/* Looking For */}
            {profile.seeking && profile.seeking.length > 0 && (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">LOOKING FOR</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.seeking.map((item: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-purple-400 border-2 border-black font-black text-sm"
                    >
                      {item.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {profile.genres && profile.genres.length > 0 && (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">GENRES</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-blue-300 border-2 border-black font-black text-sm"
                    >
                      {genre.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Influences */}
            {profile.influences && (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">INFLUENCES</h2>
                <p className="font-bold text-gray-700 leading-relaxed">{profile.influences}</p>
              </div>
            )}

            {/* Music Links */}
            {profile.social_links && (profile.social_links.youtube || profile.social_links.spotify || profile.social_links.bandcamp || profile.social_links.apple_music) && (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">MUSIC</h2>
                
                {/* YouTube Video */}
                {profile.social_links.youtube && (() => {
                  const embedUrl = getYouTubeEmbedUrl(profile.social_links.youtube)
                  return embedUrl ? (
                    <div className="aspect-video mb-4">
                      <iframe
                        width="100%"
                        height="100%"
                        src={embedUrl}
                        title="YouTube video player"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                        className="border-4 border-black"
                      ></iframe>
                    </div>
                  ) : null
                })()}

                {/* Music Platform Links */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.social_links.youtube && (
                    <a 
                      href={profile.social_links.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-red-500 border-2 border-black font-black text-white hover:bg-red-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="w-6 h-6 bg-white flex items-center justify-center">
                        <span className="text-red-500 text-xs font-black">▶</span>
                      </div>
                      <span className="text-sm">YOUTUBE</span>
                    </a>
                  )}
                  
                  {profile.social_links.spotify && (
                    <a 
                      href={profile.social_links.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-green-500 border-2 border-black font-black text-white hover:bg-green-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                        <span className="text-green-500 text-xs font-black">♫</span>
                      </div>
                      <span className="text-sm">SPOTIFY</span>
                    </a>
                  )}
                  
                  {profile.social_links.bandcamp && (
                    <a 
                      href={profile.social_links.bandcamp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-cyan-500 border-2 border-black font-black text-white hover:bg-cyan-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="w-6 h-6 bg-white flex items-center justify-center">
                        <span className="text-cyan-500 text-xs font-black">BC</span>
                      </div>
                      <span className="text-sm">BANDCAMP</span>
                    </a>
                  )}
                  
                  {profile.social_links.apple_music && (
                    <a 
                      href={profile.social_links.apple_music}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-800 border-2 border-black font-black text-white hover:bg-gray-900 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                    >
                      <div className="w-6 h-6 bg-white flex items-center justify-center">
                        <span className="text-gray-800 text-xs font-black">🍎</span>
                      </div>
                      <span className="text-sm">APPLE MUSIC</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Secondary Instruments */}
            {profile.secondary_instruments && profile.secondary_instruments.length > 0 && (
              <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h2 className="text-2xl font-black mb-4">ALSO PLAYS</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.secondary_instruments.map((instrument: string, index: number) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-lime-300 border-2 border-black font-black text-sm"
                    >
                      {instrument.toUpperCase()}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Distance */}
            <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-2xl font-black mb-4">TRAVEL RANGE</h2>
              <p className="font-bold text-gray-700">
                WILLING TO TRAVEL UP TO {profile.willing_to_travel_miles} MILES
              </p>
            </div>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}