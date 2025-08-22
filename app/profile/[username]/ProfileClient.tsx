'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import { MapPin, Music, Star, Calendar, Car, Package, Globe, Instagram, Youtube, Heart, MessageSquare, Edit } from 'lucide-react'

export default function ProfileClient() {
  const params = useParams()
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
    if (!currentUser || !profile) return

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

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </>
    )
  }

  if (!profile || !user) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Profile not found</h2>
            <Link href="/">
              <Button>Back to Home</Button>
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="aspect-square relative bg-gray-100">
                  {profile.profile_image_url ? (
                    <Image
                      src={profile.profile_image_url}
                      alt={user.full_name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="text-6xl font-bold text-gray-400">
                        {user.full_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h1 className="text-2xl font-bold mb-1">{user.full_name}</h1>
                  <p className="text-gray-600 mb-4">@{user.username}</p>
                  
                  {/* Edit button for own profile */}
                  {currentUser && currentUser.id === user.id && (
                    <div className="mb-4">
                      <Link href="/dashboard/profile">
                        <Button className="w-full">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Profile
                        </Button>
                      </Link>
                    </div>
                  )}
                  
                  {/* Action buttons for other users */}
                  {currentUser && currentUser.id !== user.id && (
                    <div className="flex gap-2 mb-4">
                      <Button className="flex-1">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Message
                      </Button>
                      <Button
                        variant={isSaved ? 'secondary' : 'ghost'}
                        onClick={handleSave}
                      >
                        <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      </Button>
                    </div>
                  )}

                  <div className="space-y-3">
                    <div className="flex items-center text-sm">
                      <Music className="w-4 h-4 mr-2 text-gray-400" />
                      <span>{profile.main_instrument}</span>
                    </div>
                    {user.zip_code && (
                      <div className="flex items-center text-sm">
                        <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                        <span>{user.zip_code}</span>
                      </div>
                    )}
                    <div className="flex items-center text-sm">
                      <Star className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="capitalize">{profile.experience_level}</span>
                    </div>
                    {profile.availability && (
                      <div className="flex items-center text-sm">
                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="capitalize">{profile.availability}</span>
                      </div>
                    )}
                    {profile.has_transportation && (
                      <div className="flex items-center text-sm">
                        <Car className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Has transportation</span>
                      </div>
                    )}
                    {profile.has_own_equipment && (
                      <div className="flex items-center text-sm">
                        <Package className="w-4 h-4 mr-2 text-gray-400" />
                        <span>Has own equipment</span>
                      </div>
                    )}
                  </div>

                  {/* Social Links */}
                  {profile.social_links && Object.values(profile.social_links).some((v) => v) && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <h3 className="font-semibold mb-3">Social Links</h3>
                      <div className="flex gap-3">
                        {profile.social_links.instagram && (
                          <a
                            href={`https://instagram.com/${profile.social_links.instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-black"
                          >
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {profile.social_links.youtube && (
                          <a
                            href={profile.social_links.youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-black"
                          >
                            <Youtube className="w-5 h-5" />
                          </a>
                        )}
                        {profile.social_links.soundcloud && (
                          <a
                            href={profile.social_links.soundcloud}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-600 hover:text-black"
                          >
                            <Globe className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Bio */}
            {profile.bio && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-3">About</h2>
                <p className="text-gray-700 whitespace-pre-wrap">{profile.bio}</p>
              </div>
            )}

            {/* Looking For */}
            {profile.seeking && profile.seeking.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-3">Looking For</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.seeking.map((item: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-black text-white rounded-full text-sm"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Genres */}
            {profile.genres && profile.genres.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-3">Genres</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 border border-gray-300 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Influences */}
            {profile.influences && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-3">Influences</h2>
                <p className="text-gray-700">{profile.influences}</p>
              </div>
            )}

            {/* Secondary Instruments */}
            {profile.secondary_instruments && profile.secondary_instruments.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold mb-3">Also Plays</h2>
                <div className="flex flex-wrap gap-2">
                  {profile.secondary_instruments.map((instrument: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                    >
                      {instrument}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Travel Distance */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold mb-3">Travel Range</h2>
              <p className="text-gray-700">
                Willing to travel up to {profile.willing_to_travel_miles} miles
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}