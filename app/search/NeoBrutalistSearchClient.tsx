'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getLastActiveStatus } from '@/lib/auth-helpers'
import { formatLocationDisplay } from '@/lib/zipcode-utils'
import Navigation from '@/components/layout/Navigation'

export default function NeoBrutalistSearchClient() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [zipCode, setZipCode] = useState('')
  const [radius, setRadius] = useState(25)
  const [instrument, setInstrument] = useState('')
  const [experience, setExperience] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [savedProfiles, setSavedProfiles] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchProfiles()
    getCurrentUser()
  }, [])

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          user:users(*)
        `)
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getCurrentUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    setCurrentUser(authUser)
    
    if (authUser) {
      const { data } = await supabase
        .from('saved_profiles')
        .select('saved_user_id')
        .eq('user_id', authUser.id)
      
      if (data) {
        setSavedProfiles(new Set(data.map(item => item.saved_user_id)))
      }
    }
  }

  const handleSave = async (profileUserId: string) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    const isSaved = savedProfiles.has(profileUserId)

    if (isSaved) {
      await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('saved_user_id', profileUserId)
      
      setSavedProfiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(profileUserId)
        return newSet
      })
    } else {
      await supabase
        .from('saved_profiles')
        .insert({
          user_id: currentUser.id,
          saved_user_id: profileUserId
        })
      
      setSavedProfiles(prev => new Set(prev).add(profileUserId))
    }
  }

  const handleMessage = (profileUserId: string) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    router.push(`/dashboard/messages/${profileUserId}`)
  }

  const handleSearch = async () => {
    setLoading(true)
    setHasSearched(true)
    
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user:users(*)
        `)
        .eq('is_published', true)

      if (instrument) {
        query = query.ilike('main_instrument', `%${instrument}%`)
      }

      if (experience) {
        query = query.eq('experience_level', experience)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      
      let filteredData = data || []
      
      // Filter by zip code and radius if provided
      if (zipCode.trim()) {
        const searchZip = zipCode.trim()
        filteredData = filteredData.filter(profile => {
          const profileZip = profile.user?.zip_code
          if (!profileZip) return false
          
          // Exact match for smaller radius, broader match for larger radius
          if (radius <= 10) {
            return profileZip === searchZip
          } else if (radius <= 25) {
            // Match first 4 digits for medium radius (same area)
            return profileZip.substring(0, 4) === searchZip.substring(0, 4)
          } else {
            // Match first 3 digits for large radius (broader region)
            return profileZip.substring(0, 3) === searchZip.substring(0, 3)
          }
        })
      }

      setProfiles(filteredData)
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6">FIND MUSICIANS</h1>
          
          {/* Search Form */}
          <div className="bg-white border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1">
                <label className="block font-black mb-1 text-sm">LOCATION</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ZIP CODE"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value)}
                    className="flex-1 px-3 py-2 border-3 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  />
                  <select 
                    value={radius} 
                    onChange={(e) => setRadius(Number(e.target.value))}
                    className="px-3 py-2 border-3 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                  >
                    <option value={5}>5 MI</option>
                    <option value={10}>10 MI</option>
                    <option value={25}>25 MI</option>
                    <option value={50}>50 MI</option>
                  </select>
                </div>
              </div>

              <div className="flex-1">
                <label className="block font-black mb-1 text-sm">INSTRUMENT</label>
                <select
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  className="w-full px-3 py-2 border-3 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                >
                  <option value="">ALL</option>
                  <option value="guitar">GUITAR</option>
                  <option value="bass">BASS</option>
                  <option value="drums">DRUMS</option>
                  <option value="vocals">VOCALS</option>
                  <option value="keyboard">KEYBOARD</option>
                  <option value="saxophone">SAXOPHONE</option>
                  <option value="trumpet">TRUMPET</option>
                  <option value="violin">VIOLIN</option>
                  <option value="other">OTHER</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block font-black mb-1 text-sm">EXPERIENCE</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full px-3 py-2 border-3 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                >
                  <option value="">ALL LEVELS</option>
                  <option value="beginner">BEGINNER</option>
                  <option value="intermediate">INTERMEDIATE</option>
                  <option value="advanced">ADVANCED</option>
                  <option value="professional">PROFESSIONAL</option>
                </select>
              </div>

              <div className="flex items-end">
                <button 
                  onClick={handleSearch}
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-pink-400 border-3 border-black font-black hover:bg-pink-500 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'SEARCHING...' : 'SEARCH NOW →'}
                </button>
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="mb-4">
            <p className="font-black text-xl">
              {loading ? 'LOADING...' : `${profiles.length} MUSICIAN${profiles.length !== 1 ? 'S' : ''} FOUND`}
            </p>
          </div>

          {/* No Results */}
          {!loading && profiles.length === 0 && hasSearched && (
            <div className="bg-white border-4 border-black p-8 text-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <p className="font-black text-2xl mb-2">NO MUSICIANS FOUND</p>
              <p className="font-bold">Try different search criteria.</p>
            </div>
          )}

          {/* Results Grid */}
          {profiles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {profiles.map((profile) => (
                <div key={profile.id} className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
                  
                  {/* Header - Name, Photo, Status */}
                  <div className="p-4 border-b-2 border-black">
                    <div className="flex items-center gap-3">
                      {/* Profile Photo */}
                      <div className="flex-shrink-0">
                        {profile.profile_image_url ? (
                          <Image
                            src={profile.profile_image_url}
                            alt={profile.user.full_name}
                            width={48}
                            height={48}
                            className="w-12 h-12 border-2 border-black object-cover"
                            onError={(e) => {
                              console.error('Profile image failed to load:', profile.profile_image_url)
                            }}
                          />
                        ) : (
                          <div className="w-12 h-12 border-2 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                            <div className="text-lg font-black text-white">
                              {profile.user.full_name.charAt(0).toUpperCase()}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Name & Core Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-black text-lg leading-tight mb-1">{profile.user.full_name.toUpperCase()}</h3>
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Instrument - Most Important */}
                          <span className="px-2 py-1 bg-pink-400 border-2 border-black font-black text-xs">
                            {profile.main_instrument?.toUpperCase() || 'MUSICIAN'}
                          </span>
                          
                          {/* Location - Secondary */}
                          {profile.user.zip_code && (
                            <span className="px-2 py-1 bg-cyan-300 border-2 border-black font-black text-xs">
                              📍 {formatLocationDisplay(profile.user.zip_code)}
                            </span>
                          )}
                          
                          {/* Status - Tertiary */}
                          {profile.user.last_active && (() => {
                            const activeStatus = getLastActiveStatus(profile.user.last_active)
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
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Content - What they offer/want */}
                  <div className="p-4">
                    {/* Experience Level - Important for matching */}
                    {profile.experience_level && (
                      <div className="mb-3">
                        <span className={`px-3 py-1 border-2 border-black font-black text-sm ${
                          profile.experience_level === 'beginner' ? 'bg-green-300' :
                          profile.experience_level === 'intermediate' ? 'bg-yellow-300' :
                          profile.experience_level === 'advanced' ? 'bg-orange-400' :
                          profile.experience_level === 'professional' ? 'bg-red-400 text-white' :
                          'bg-gray-300'
                        }`}>
                          {profile.experience_level.toUpperCase()}
                        </span>
                      </div>
                    )}

                    {/* Bio - Key selling point */}
                    {profile.bio && (
                      <div className="mb-3 p-3 bg-gray-50 border-2 border-black">
                        <p className="font-bold text-sm line-clamp-3">
                          &quot;{profile.bio}&quot;
                        </p>
                      </div>
                    )}

                    {/* What they're seeking - Most relevant for search */}
                    {profile.seeking && profile.seeking.length > 0 && (
                      <div className="mb-3">
                        <p className="font-black text-sm mb-2">LOOKING FOR:</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.seeking.slice(0, 4).map((item: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-purple-300 border-2 border-black font-black text-xs"
                            >
                              {item.toUpperCase()}
                            </span>
                          ))}
                          {profile.seeking.length > 4 && (
                            <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                              +{profile.seeking.length - 4} MORE
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Genres - Secondary info */}
                    {profile.genres && profile.genres.length > 0 && (
                      <div className="mb-4">
                        <p className="font-black text-sm mb-2">GENRES:</p>
                        <div className="flex flex-wrap gap-1">
                          {profile.genres.slice(0, 4).map((genre: string, index: number) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-blue-300 border-2 border-black font-black text-xs"
                            >
                              {genre.toUpperCase()}
                            </span>
                          ))}
                          {profile.genres.length > 4 && (
                            <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                              +{profile.genres.length - 4} MORE
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-3 border-t-2 border-black">
                      <Link 
                        href={`/profile/${profile.user.username}`} 
                        className="flex-1 px-4 py-2 bg-black text-white border-2 border-black font-black text-sm text-center hover:bg-cyan-400 hover:text-black transition-colors"
                      >
                        VIEW PROFILE
                      </Link>
                      {currentUser && currentUser.id !== profile.user_id && (
                        <button
                          onClick={() => handleMessage(profile.user_id)} 
                          className="flex-1 px-4 py-2 bg-yellow-300 border-2 border-black font-black text-sm text-center hover:bg-yellow-400 transition-colors"
                        >
                          MESSAGE
                        </button>
                      )}
                      {currentUser && (
                        <button
                          onClick={() => handleSave(profile.user_id)}
                          className={`px-4 py-2 border-2 border-black font-black text-lg transition-colors ${
                            savedProfiles.has(profile.user_id)
                              ? 'bg-pink-400 hover:bg-pink-500' 
                              : 'bg-white hover:bg-lime-300'
                          }`}
                        >
                          {savedProfiles.has(profile.user_id) ? '♥' : '♡'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}