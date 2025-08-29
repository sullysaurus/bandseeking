'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import SearchProfileCard from '@/components/SearchProfileCard'
import { Search } from 'lucide-react'

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

    if (isSaved) {
      await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('saved_profile_id', profileId)
      
      setSavedProfiles(prev => {
        const newSet = new Set(prev)
        newSet.delete(profileId)
        return newSet
      })
    } else {
      await supabase
        .from('saved_profiles')
        .insert({
          user_id: currentUser.id,
          saved_profile_id: profileId
        })
      
      setSavedProfiles(prev => new Set(prev).add(profileId))
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
          
          {/* Search Bar - Both Mobile and Desktop */}
          <div className="bg-white border-4 border-black p-4 mb-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            {/* Mobile Search Toggle */}
            <div className="sm:hidden mb-3">
              <button
                onClick={() => setSearchExpanded(!searchExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-yellow-100 border-2 border-black font-black"
              >
                <span className="flex items-center gap-2">
                  <Search className="w-5 h-5" />
                  {searchExpanded ? 'HIDE SEARCH' : 'SEARCH MUSICIANS'}
                </span>
                <span className="text-xl">{searchExpanded ? '−' : '+'}</span>
              </button>
            </div>

            {/* Universal Search */}
            <div className={`${searchExpanded ? 'block' : 'hidden sm:block'}`}>
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