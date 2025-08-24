'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { matchesLocationSearch } from '@/lib/zipcode-utils'
import Navigation from '@/components/layout/Navigation'
import SearchProfileCard from '@/components/SearchProfileCard'
import { Search, Filter, MapPin, X } from 'lucide-react'

export default function NeoBrutalistSearchClient() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [location, setLocation] = useState('')
  const [radius, setRadius] = useState(25)
  const [instrument, setInstrument] = useState('')
  const [experience, setExperience] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [savedProfiles, setSavedProfiles] = useState<Set<string>>(new Set())
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true)
  const [isGettingLocation, setIsGettingLocation] = useState(false)

  useEffect(() => {
    fetchProfiles()
    getCurrentUser()
  }, [])

  // Auto-filter when search criteria change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (hasSearched || location || instrument || experience) {
        handleSearch()
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [location, radius, instrument, experience])

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
      
      // Filter by location if provided (supports zip code, city, or city/state)
      if (location.trim()) {
        const locationMatches = await Promise.all(
          filteredData.map(profile => matchesLocationSearch(profile, location, radius))
        )
        filteredData = filteredData.filter((_, index) => locationMatches[index])
      }

      setProfiles(filteredData)
    } catch (error) {
      console.error('Error searching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const findMyLocation = async () => {
    setIsGettingLocation(true)
    try {
      if (!navigator.geolocation) {
        alert('Geolocation is not supported by this browser')
        return
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000
        })
      })

      // Convert coordinates to zip code using reverse geocoding
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${position.coords.latitude}&longitude=${position.coords.longitude}&localityLanguage=en`
      )
      const data = await response.json()
      
      if (data.postcode) {
        setLocation(data.postcode)
      } else if (data.city && data.principalSubdivision) {
        setLocation(`${data.city}, ${data.principalSubdivision}`)
      } else {
        alert('Could not determine your location. Please enter manually.')
      }
    } catch (error) {
      console.error('Error getting location:', error)
      alert('Could not access your location. Please enter manually.')
    } finally {
      setIsGettingLocation(false)
    }
  }

  const clearAllFilters = () => {
    setLocation('')
    setRadius(25)
    setInstrument('')
    setExperience('')
    setHasSearched(false)
    fetchProfiles() // Reset to show all profiles
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-5xl font-black">FIND MUSICIANS</h1>
            
            {/* Mobile Filter Toggle */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="md:hidden px-4 py-2 bg-pink-400 border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              FILTERS
            </button>
          </div>
          
          {/* Desktop Search Form */}
          <div className="hidden md:block bg-white border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex flex-row gap-3 mb-4">
              <div className="flex-1">
                <label className="block font-black mb-1 text-sm">LOCATION</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="ZIP CODE, CITY, OR CITY, STATE"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
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
                  <button
                    type="button"
                    onClick={findMyLocation}
                    disabled={isGettingLocation}
                    className="px-2 py-1 md:px-3 md:py-2 bg-cyan-400 border-2 md:border-3 border-black font-black text-xs md:text-sm hover:bg-cyan-500 transition-colors flex items-center gap-1 disabled:opacity-50 shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <MapPin className="w-3 h-3 md:w-4 md:h-4" />
                    {isGettingLocation ? '...' : 'MY LOCATION'}
                  </button>
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
            </div>

            {/* Clear Filters Button */}
            {(location || instrument || experience) && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="px-4 py-2 bg-yellow-300 border-3 border-black font-black hover:bg-yellow-400 transition-colors text-sm"
                >
                  CLEAR ALL FILTERS
                </button>
              </div>
            )}
          </div>

          {/* Mobile Collapsed Search */}
          <div className="md:hidden mb-4">
            <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter location to search..."
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="flex-1 px-3 py-2 border-2 border-black font-bold focus:outline-none focus:bg-yellow-100 text-sm"
                />
                <button
                  type="button"
                  onClick={findMyLocation}
                  disabled={isGettingLocation}
                  className="px-3 py-2 bg-cyan-400 border-2 border-black font-black text-sm flex items-center gap-1 disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                </button>
              </div>
              
              {/* Active Filters Preview */}
              {(instrument || experience) && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {instrument && (
                    <span className="px-2 py-1 bg-pink-400 border-2 border-black font-black text-xs">
                      {instrument.toUpperCase()}
                    </span>
                  )}
                  {experience && (
                    <span className="px-2 py-1 bg-purple-400 border-2 border-black font-black text-xs">
                      {experience.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Filter Modal */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-lime-300 z-50 md:hidden">
              <div className="flex flex-col h-full">
                {/* Modal Header */}
                <div className="bg-white border-b-4 border-black p-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black">FILTERS</h2>
                    <button
                      onClick={() => setShowMobileFilters(false)}
                      className="p-2 bg-gray-200 border-2 border-black font-black"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Modal Content */}
                <div className="flex-1 p-4 space-y-6 overflow-y-auto">
                  {/* Location */}
                  <div>
                    <label className="block font-black mb-2 text-lg">LOCATION</label>
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="ZIP CODE, CITY, OR CITY, STATE"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                      />
                      <div className="flex gap-2">
                        <select 
                          value={radius} 
                          onChange={(e) => setRadius(Number(e.target.value))}
                          className="flex-1 px-4 py-3 border-4 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                        >
                          <option value={5}>5 MILES</option>
                          <option value={10}>10 MILES</option>
                          <option value={25}>25 MILES</option>
                          <option value={50}>50 MILES</option>
                        </select>
                        <button
                          type="button"
                          onClick={findMyLocation}
                          disabled={isGettingLocation}
                          className="px-4 py-3 bg-cyan-400 border-4 border-black font-black hover:bg-cyan-500 transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          <MapPin className="w-5 h-5" />
                          {isGettingLocation ? 'FINDING...' : 'FIND ME'}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Instrument */}
                  <div>
                    <label className="block font-black mb-2 text-lg">INSTRUMENT</label>
                    <select
                      value={instrument}
                      onChange={(e) => setInstrument(e.target.value)}
                      className="w-full px-4 py-3 border-4 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                    >
                      <option value="">ALL INSTRUMENTS</option>
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

                  {/* Experience */}
                  <div>
                    <label className="block font-black mb-2 text-lg">EXPERIENCE</label>
                    <select
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      className="w-full px-4 py-3 border-4 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                    >
                      <option value="">ALL LEVELS</option>
                      <option value="beginner">BEGINNER</option>
                      <option value="intermediate">INTERMEDIATE</option>
                      <option value="advanced">ADVANCED</option>
                      <option value="professional">PROFESSIONAL</option>
                    </select>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="bg-white border-t-4 border-black p-4 space-y-3">
                  {(location || instrument || experience) && (
                    <button
                      type="button"
                      onClick={() => {
                        clearAllFilters()
                        setShowMobileFilters(false)
                      }}
                      className="w-full px-4 py-3 bg-yellow-300 border-4 border-black font-black hover:bg-yellow-400 transition-colors"
                    >
                      CLEAR ALL FILTERS
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowMobileFilters(false)}
                    className="w-full px-4 py-3 bg-pink-400 border-4 border-black font-black hover:bg-pink-500 transition-colors"
                  >
                    APPLY FILTERS
                  </button>
                </div>
              </div>
            </div>
          )}

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
                <SearchProfileCard
                  key={profile.id}
                  profile={profile}
                  currentUser={currentUser}
                  savedProfiles={savedProfiles}
                  onSave={handleSave}
                  onMessage={handleMessage}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}