'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { matchesLocationSearch } from '@/lib/zipcode-utils'
import Navigation from '@/components/layout/Navigation'
import SearchProfileCard from '@/components/SearchProfileCard'

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

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-black mb-6">FIND MUSICIANS</h1>
          
          {/* Search Form */}
          <div className="bg-white border-4 border-black p-4 mb-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <form onSubmit={handleFormSubmit} className="flex flex-col md:flex-row gap-3">
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
                  type="submit"
                  disabled={loading}
                  className="w-full md:w-auto px-6 py-2 bg-pink-400 border-3 border-black font-black hover:bg-pink-500 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 whitespace-nowrap"
                >
                  {loading ? 'SEARCHING...' : 'SEARCH NOW →'}
                </button>
              </div>
            </form>
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