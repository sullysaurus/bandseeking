'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import SearchProfileCard from '@/components/SearchProfileCard'
import { Search, Filter, X } from 'lucide-react'
import { instruments, genres, seekingOptions, experienceLevels, availabilityOptions } from '@/lib/utils'

export default function NeoBrutalistSearchClient() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [instrument, setInstrument] = useState('')
  const [experience, setExperience] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [selectedSeeking, setSelectedSeeking] = useState<string[]>([])
  const [selectedAvailability, setSelectedAvailability] = useState<string[]>([])
  const [hasTransportation, setHasTransportation] = useState(false)
  const [hasEquipment, setHasEquipment] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [savedProfiles, setSavedProfiles] = useState<Set<string>>(new Set())
  const [showMobileFilters, setShowMobileFilters] = useState(false)
  const [isSearchCollapsed, setIsSearchCollapsed] = useState(true)

  useEffect(() => {
    getCurrentUser().then(() => {
      fetchProfiles()
    })
  }, [])

  // Auto-filter when search criteria change (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const hasAnyFilter = searchText.trim() || instrument || experience || 
                          selectedGenres.length > 0 || selectedSeeking.length > 0 || 
                          selectedAvailability.length > 0 || hasTransportation || hasEquipment
      
      if (hasSearched || hasAnyFilter) {
        handleSearch()
      } else if (hasSearched && !hasAnyFilter) {
        // If we had searched before but now all filters are cleared, reset to all profiles
        fetchProfiles()
        setHasSearched(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchText, instrument, experience, selectedGenres, selectedSeeking, selectedAvailability, hasTransportation, hasEquipment, hasSearched])

  const fetchProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select(`
          *,
          user:users(*)
        `)
        .eq('is_published', true)
      
      // Allow users to see their own profile in search results
      // This helps with testing and lets users verify their profile appears correctly
      
      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) {
        console.error('fetchProfiles error:', error)
        throw error
      }
      
      let filteredData = data || []
      
      // Show all published profiles - users can see people they've interacted with
      // This is more user-friendly than hiding profiles
      
      setProfiles(filteredData)
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const getConnectedUserIds = async (userId: string): Promise<Set<string>> => {
    const connectedIds = new Set<string>()
    
    try {
      // Get users who have messaged each other (bidirectional)
      const { data: sentMessages } = await supabase
        .from('messages')
        .select('receiver_id')
        .eq('sender_id', userId)
      
      const { data: receivedMessages } = await supabase
        .from('messages')
        .select('sender_id')
        .eq('receiver_id', userId)
      
      // Get users who have saved each other (bidirectional)
      const { data: savedByUser } = await supabase
        .from('saved_profiles')
        .select('saved_user_id')
        .eq('user_id', userId)
      
      const { data: savedUser } = await supabase
        .from('saved_profiles')
        .select('user_id')
        .eq('saved_user_id', userId)
      
      // Add all connected user IDs
      sentMessages?.forEach(msg => connectedIds.add(msg.receiver_id))
      receivedMessages?.forEach(msg => connectedIds.add(msg.sender_id))
      savedByUser?.forEach(save => connectedIds.add(save.saved_user_id))
      savedUser?.forEach(save => connectedIds.add(save.user_id))
      
    } catch (error) {
      console.error('Error fetching connected users:', error)
    }
    
    return connectedIds
  }

  const getCurrentUser = async (): Promise<void> => {
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
      
      // Exclude current user's own profile
      if (currentUser) {
        query = query.neq('user_id', currentUser.id)
      }
      
      // Build comprehensive full-text search query
      const hasAnySearch = searchText.trim() || instrument
      
      if (hasAnySearch) {
        let searchTerms = []
        
        // Add general search text (can include location, instruments, etc.)
        if (searchText.trim()) {
          // Clean up the search text - remove punctuation and split on spaces
          const cleanedText = searchText.trim().replace(/[,.-]/g, ' ')
          const words = cleanedText.split(/\s+/).filter(word => word.length > 0)
          searchTerms.push(...words)
        }
        
        // Add instrument search from filter
        if (instrument) {
          searchTerms.push(instrument)
        }
        
        if (searchTerms.length > 0) {
          // Create full-text search query
          // For location searches like "Raleigh, NC", use & (AND) so both terms must match
          // For general searches, use | (OR) so any term can match
          const searchTermsStr = searchTerms.join(' ')
          const isLikelyLocation = /^[a-zA-Z\s]+,\s*[A-Z]{2}$/.test(searchTermsStr) || 
                                   searchTermsStr.includes(',') ||
                                   searchTerms.length === 2
          
          const ftsQuery = isLikelyLocation ? searchTerms.join(' & ') : searchTerms.join(' | ')
          
          // Use the correct textSearch syntax for the fts column
          query = query.textSearch('fts', ftsQuery)
        }
      }

      if (experience) {
        query = query.eq('experience_level', experience)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      
      let filteredData = data || []
      
      // All filtering is now done via full-text search in the database
      // This is much simpler and more reliable

      setProfiles(filteredData)
    } catch (error) {
      console.error('Error searching profiles:', error)
      console.error('Error details:', JSON.stringify(error, null, 2))
      // Show a fallback of all profiles if search fails
      fetchProfiles()
    } finally {
      setLoading(false)
    }
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handleSearch()
  }

  const clearAllFilters = () => {
    setSearchText('')
    setInstrument('')
    setExperience('')
    setSelectedGenres([])
    setSelectedSeeking([])
    setSelectedAvailability([])
    setHasTransportation(false)
    setHasEquipment(false)
    setHasSearched(false)
    // Reset to show all profiles
    fetchProfiles()
  }



  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl md:text-5xl font-black">FIND MUSICIANS</h1>
            
            {/* Filter Toggle Button - Both Mobile and Desktop */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="px-4 py-2 bg-pink-400 border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              FILTERS
            </button>
          </div>
          
          {/* Search Bar - Both Mobile and Desktop */}
          <div className="bg-white border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Universal Search */}
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="Search by name, instrument, genre, location, etc..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-black font-bold focus:outline-none focus:bg-yellow-100 text-sm"
              />
              <Search className="w-6 h-6 mt-2 text-gray-600" />
            </div>
            
            {/* Clear All Filters Button - Prominent when filters are active */}
            {(searchText.trim() || instrument || experience || selectedGenres.length > 0 || selectedSeeking.length > 0 || selectedAvailability.length > 0 || hasTransportation || hasEquipment) && (
              <div className="flex justify-center">
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2 bg-red-400 border-4 border-black font-black text-sm shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-red-500 transition-colors flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  CLEAR ALL FILTERS
                </button>
              </div>
            )}
            
            {/* Active Filters Preview */}
            {(instrument || experience || selectedGenres.length > 0 || selectedSeeking.length > 0 || selectedAvailability.length > 0 || hasTransportation || hasEquipment) && (
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
                {selectedGenres.map((genre) => (
                  <span key={genre} className="px-2 py-1 bg-blue-400 border-2 border-black font-black text-xs">
                    {genre.toUpperCase()}
                  </span>
                ))}
                {selectedSeeking.map((item) => (
                  <span key={item} className="px-2 py-1 bg-green-400 border-2 border-black font-black text-xs">
                    {item.toUpperCase()}
                  </span>
                ))}
                {selectedAvailability.map((item) => (
                  <span key={item} className="px-2 py-1 bg-yellow-400 border-2 border-black font-black text-xs">
                    {item.toUpperCase()}
                  </span>
                ))}
                {hasTransportation && (
                  <span className="px-2 py-1 bg-cyan-400 border-2 border-black font-black text-xs">
                    HAS TRANSPORTATION
                  </span>
                )}
                {hasEquipment && (
                  <span className="px-2 py-1 bg-orange-400 border-2 border-black font-black text-xs">
                    HAS EQUIPMENT
                  </span>
                )}
              </div>
            )}
          </div>


          {/* Filter Modal - Both Mobile and Desktop */}
          {showMobileFilters && (
            <div className="fixed inset-0 bg-lime-300 z-50">
              <div className="flex flex-col h-full max-w-4xl mx-auto md:my-8 md:rounded-lg md:border-4 md:border-black md:bg-white md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:h-auto md:max-h-[85vh]">
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
                <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
                  

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

                  {/* Genres */}
                  <div>
                    <label className="block font-black mb-2 text-lg">GENRES</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-1 md:gap-2 max-h-40 md:max-h-48 overflow-y-auto p-2 border-2 border-black bg-gray-50">
                      {genres.map((genreOption) => (
                        <label key={genreOption} className="flex items-center p-1 md:p-2 bg-white border border-gray-300 font-medium text-sm cursor-pointer hover:bg-blue-50 hover:border-blue-300">
                          <input
                            type="checkbox"
                            className="mr-2 w-3 h-3"
                            checked={selectedGenres.includes(genreOption)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedGenres([...selectedGenres, genreOption])
                              } else {
                                setSelectedGenres(selectedGenres.filter(g => g !== genreOption))
                              }
                            }}
                          />
                          <span className="text-xs md:text-sm">{genreOption}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Seeking */}
                  <div>
                    <label className="block font-black mb-2 text-lg">LOOKING FOR</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-1 md:gap-2 max-h-32 md:max-h-40 overflow-y-auto p-2 border-2 border-black bg-gray-50">
                      {seekingOptions.map((option) => (
                        <label key={option} className="flex items-center p-1 md:p-2 bg-white border border-gray-300 font-medium text-sm cursor-pointer hover:bg-green-50 hover:border-green-300">
                          <input
                            type="checkbox"
                            className="mr-2 w-3 h-3"
                            checked={selectedSeeking.includes(option)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedSeeking([...selectedSeeking, option])
                              } else {
                                setSelectedSeeking(selectedSeeking.filter(s => s !== option))
                              }
                            }}
                          />
                          <span className="text-xs md:text-sm">{option}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Availability */}
                  <div>
                    <label className="block font-black mb-2 text-lg">AVAILABILITY</label>
                    <div className="grid grid-cols-2 gap-1 md:gap-2 p-2 border-2 border-black bg-gray-50">
                      {availabilityOptions.map((option) => (
                        <label key={option.value} className="flex items-center p-1 md:p-2 bg-white border border-gray-300 font-medium text-sm cursor-pointer hover:bg-yellow-50 hover:border-yellow-300">
                          <input
                            type="checkbox"
                            className="mr-2 w-3 h-3"
                            checked={selectedAvailability.includes(option.value)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedAvailability([...selectedAvailability, option.value])
                              } else {
                                setSelectedAvailability(selectedAvailability.filter(a => a !== option.value))
                              }
                            }}
                          />
                          <span className="text-xs md:text-sm">{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Additional Filters */}
                  <div>
                    <label className="block font-black mb-2 text-lg">ADDITIONAL FILTERS</label>
                    <div className="space-y-1">
                      <label className="flex items-center p-2 bg-white border border-gray-300 font-medium cursor-pointer hover:bg-cyan-50 hover:border-cyan-300">
                        <input
                          type="checkbox"
                          className="mr-3 w-3 h-3"
                          checked={hasTransportation}
                          onChange={(e) => setHasTransportation(e.target.checked)}
                        />
                        <span className="text-sm">Has reliable transportation</span>
                      </label>
                      <label className="flex items-center p-2 bg-white border border-gray-300 font-medium cursor-pointer hover:bg-orange-50 hover:border-orange-300">
                        <input
                          type="checkbox"
                          className="mr-3 w-3 h-3"
                          checked={hasEquipment}
                          onChange={(e) => setHasEquipment(e.target.checked)}
                        />
                        <span className="text-sm">Has own equipment</span>
                      </label>
                    </div>
                  </div>
                </div>

                {/* Modal Actions */}
                <div className="bg-white border-t-4 border-black p-4 space-y-3">
                  {(location || instrument || experience || selectedGenres.length > 0 || selectedSeeking.length > 0 || selectedAvailability.length > 0 || hasTransportation || hasEquipment) && (
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