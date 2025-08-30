'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getLastActiveStatus } from '@/lib/auth-helpers'
import { useLocationDisplay } from '@/hooks/useLocationDisplay'
import Navigation from '@/components/layout/Navigation'
import { Search, Music, MapPin, Eye, MessageSquare, Heart, Users } from 'lucide-react'

// Component to handle location display with hook
function ProfileRow({ profile, index, currentUser, savedProfiles, handleSave, handleMessage }: any) {
  const locationDisplay = useLocationDisplay(profile.zip_code)
  const isEven = index % 2 === 0
  
  return (
    <div 
      className={`flex items-center justify-between p-3 sm:p-4 border-b-2 border-gray-200 last:border-b-0 ${
        isEven ? 'bg-green-50' : 'bg-white'
      } hover:bg-yellow-50 transition-colors`}
    >
      {/* Desktop Layout - Grid with columns */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-12 gap-4 items-center">
          {/* Musician Info - 4 columns */}
          <div className="col-span-4 flex items-center gap-4">
            {/* Profile Photo */}
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.username}
                width={48}
                height={48}
                className="w-12 h-12 border-2 border-black object-cover rounded"
              />
            ) : (
              <div className="w-12 h-12 border-2 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center rounded">
                <span className="text-sm font-black text-white">
                  {(profile.username || 'M').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <div className="min-w-0">
              <div className="font-black text-base truncate">@{profile.username || 'musician'}</div>
              {profile.last_active && (() => {
                const activeStatus = getLastActiveStatus(profile.last_active)
                return (
                  <div className="flex items-center gap-1 mt-1">
                    <span className={`w-2 h-2 rounded-full inline-block ${
                      activeStatus.status === 'online' ? 'bg-green-400' :
                      activeStatus.status === 'recent' ? 'bg-yellow-400' :
                      activeStatus.status === 'hours' ? 'bg-orange-400' :
                      activeStatus.status === 'days' ? 'bg-red-400' :
                      'bg-gray-400'
                    }`}></span>
                    <span className="text-xs text-gray-600">{activeStatus.text}</span>
                  </div>
                )
              })()}
            </div>
          </div>

          {/* Instrument - 2 columns */}
          <div className="col-span-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <Music className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-sm">{profile.main_instrument || 'Musician'}</span>
            </div>
          </div>

          {/* Location - 2 columns */}
          <div className="col-span-2 text-center">
            <div className="flex items-center justify-center gap-1">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="font-bold text-sm">{locationDisplay || 'Planet Earth'}</span>
            </div>
          </div>

          {/* Genres - 2 columns */}
          <div className="col-span-2 text-center">
            {profile.genres && profile.genres.length > 0 ? (
              <div className="flex justify-center gap-1">
                <span className="px-2 py-1 bg-cyan-300 border border-black text-xs font-bold rounded">
                  {profile.genres[0]}
                </span>
                {profile.genres.length > 1 && (
                  <span className="text-xs text-gray-500 font-bold">+{profile.genres.length - 1}</span>
                )}
              </div>
            ) : (
              <span className="text-xs text-gray-500">No genres</span>
            )}
          </div>

          {/* Actions - 2 columns */}
          <div className="col-span-2 flex gap-2 justify-center">
            <Link
              href={`/profile/${profile.username}`}
              className="px-2 py-2 bg-blue-400 border-2 border-black font-black text-xs hover:bg-blue-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
            >
              <Eye className="w-4 h-4" />
            </Link>
            {currentUser && currentUser.id !== profile.user_id && (
              <button
                onClick={() => handleMessage(profile.user_id)}
                className="px-2 py-2 bg-yellow-400 border-2 border-black font-black text-xs hover:bg-yellow-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
            )}
            {currentUser && (
              <button
                onClick={() => handleSave(profile.id)}
                className={`px-2 py-2 border-2 border-black font-black text-xs transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                  savedProfiles.has(profile.id)
                    ? 'bg-pink-400 hover:bg-pink-500'
                    : 'bg-white hover:bg-lime-300'
                }`}
              >
                <Heart className={`w-4 h-4 ${savedProfiles.has(profile.id) ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="flex sm:hidden items-center w-full gap-4">
        {/* Profile Photo - Bigger on mobile too */}
        <div className="flex-shrink-0">
          {profile.profile_image_url ? (
            <Image
              src={profile.profile_image_url}
              alt={profile.username}
              width={48}
              height={48}
              className="w-12 h-12 border-2 border-black object-cover rounded"
            />
          ) : (
            <div className="w-12 h-12 border-2 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center rounded">
              <span className="text-sm font-black text-white">
                {(profile.username || 'M').charAt(0).toUpperCase()}
              </span>
            </div>
          )}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="font-black text-sm mb-1">@{profile.username || 'musician'}</div>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            <div className="flex items-center gap-1">
              <Music className="w-3 h-3" />
              <span className="font-bold">{profile.main_instrument || 'Musician'}</span>
            </div>
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="font-bold">{locationDisplay || 'Planet Earth'}</span>
            </div>
          </div>
        </div>

        {/* Mobile Actions - Only View and Save */}
        <div className="flex gap-1 flex-shrink-0">
          <Link
            href={`/profile/${profile.username}`}
            className="px-2 py-2 bg-blue-400 border-2 border-black hover:bg-blue-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
          >
            <Eye className="w-4 h-4" />
          </Link>
          {currentUser && (
            <button
              onClick={() => handleSave(profile.id)}
              className={`px-2 py-2 border-2 border-black transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                savedProfiles.has(profile.id)
                  ? 'bg-pink-400 hover:bg-pink-500'
                  : 'bg-white hover:bg-lime-300'
              }`}
            >
              <Heart className={`w-4 h-4 ${savedProfiles.has(profile.id) ? 'fill-current' : ''}`} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function NeoBrutalistSearchClient() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [savedProfiles, setSavedProfiles] = useState<Set<string>>(new Set())
  const [searchExpanded, setSearchExpanded] = useState(false)

  useEffect(() => {
    getCurrentUser().then(() => {
      fetchProfiles()
    })
  }, [])

  // Auto-search when search text changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const hasSearch = searchText.trim()
      
      if (hasSearch) {
        handleSearch()
      } else {
        // If search is empty, reset to all profiles
        fetchProfiles()
        setHasSearched(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchText])

  const fetchProfiles = async () => {
    try {
      let query = supabase
        .from('profiles')
        .select('*')
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
      
      // Get profiles that user has saved
      const { data: savedProfiles } = await supabase
        .from('saved_profiles')
        .select('saved_profile_id, profile:profiles!saved_profile_id(user_id)')
        .eq('user_id', userId)
      
      // Add all connected user IDs
      sentMessages?.forEach(msg => connectedIds.add(msg.receiver_id))
      receivedMessages?.forEach(msg => connectedIds.add(msg.sender_id))
      savedProfiles?.forEach((save: any) => save.profile && connectedIds.add(save.profile.user_id))
      
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
        .select('saved_profile_id')
        .eq('user_id', authUser.id)
      
      if (data) {
        setSavedProfiles(new Set(data.map(item => item.saved_profile_id)))
      }
    }
  }

  const handleSave = async (profileId: string) => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    const isSaved = savedProfiles.has(profileId)

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_profiles')
          .delete()
          .eq('user_id', currentUser.id)
          .eq('saved_profile_id', profileId)
        
        if (error) {
          console.error('Error removing saved profile:', error)
          return
        }
        
        setSavedProfiles(prev => {
          const newSet = new Set(prev)
          newSet.delete(profileId)
          return newSet
        })
        console.log('Profile unsaved successfully')
      } else {
        const { error } = await supabase
          .from('saved_profiles')
          .insert({
            user_id: currentUser.id,
            saved_profile_id: profileId
          })
        
        if (error) {
          console.error('Error saving profile:', error)
          return
        }
        
        setSavedProfiles(prev => new Set(prev).add(profileId))
        console.log('Profile saved successfully')
      }
    } catch (error) {
      console.error('Error in handleSave:', error)
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
    
    console.log('Searching for:', searchText)
    
    try {
      let query = supabase
        .from('profiles')
        .select('*')
        .eq('is_published', true)
      
      // Exclude current user's own profile
      if (currentUser) {
        query = query.neq('user_id', currentUser.id)
      }
      
      // Build full-text search query
      const hasSearch = searchText.trim()
      
      if (hasSearch) {
        // Format search query for PostgreSQL full-text search
        // Replace spaces with & for AND queries for better location matching
        const formattedQuery = searchText.trim().split(/\s+/).join(' & ')
        
        console.log('FTS query:', formattedQuery)
        
        // Use full-text search
        query = query.textSearch('fts', formattedQuery)
      }

      const { data, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      
      console.log('Search results:', data?.length || 0, 'profiles found')
      
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




  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl md:text-5xl font-black">FIND MUSICIANS</h1>
          </div>
          
          {/* Search Bar - Always Visible */}
          <div className="bg-white border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search by name, instrument, genre, location, etc..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="flex-1 px-3 py-2 border-2 border-black font-bold focus:outline-none focus:bg-yellow-100 text-sm"
              />
              <div className="flex items-center px-2">
                <Search className="w-6 h-6 text-gray-600" />
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

          {/* Results Table */}
          {profiles.length > 0 && (
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              {/* Table Header - Desktop Only */}
              <div className="hidden sm:block">
                <div className="grid grid-cols-12 gap-4 p-4 border-b-4 border-black bg-gray-100">
                  <div className="col-span-4">
                    <span className="font-black text-sm">MUSICIAN INFO</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-black text-sm">INSTRUMENT</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-black text-sm">LOCATION</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-black text-sm">GENRES</span>
                  </div>
                  <div className="col-span-2 text-center">
                    <span className="font-black text-sm">ACTIONS</span>
                  </div>
                </div>
              </div>

              {/* Table Rows */}
              <div>
                {profiles.map((profile, index) => (
                  <ProfileRow
                    key={profile.id}
                    profile={profile}
                    index={index}
                    currentUser={currentUser}
                    savedProfiles={savedProfiles}
                    handleSave={handleSave}
                    handleMessage={handleMessage}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}