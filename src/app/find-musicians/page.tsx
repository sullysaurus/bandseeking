'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/Sidebar'
import MusicianCard from '@/components/MusicianCard'
import ProtectedRoute from '@/components/ProtectedRoute'
import FilterPanel, { FilterOptions } from '@/components/FilterPanel'
import { profileService, Profile } from '@/lib/profiles'

/* const mockMusicians = [
  {
    id: '1',
    name: 'Sarah Chen',
    username: 'sarahchen',
    location: 'Los Angeles, CA',
    instruments: ['Guitar', 'Vocals', 'Piano'],
    genres: ['Alternative Rock', 'Indie', 'Pop'],
    experienceLevel: 'Advanced',
    bio: 'Passionate guitarist and vocalist with 8 years of experience. Love creating atmospheric indie rock with meaningful lyrics. Currently looking for a band to record an EP.',
    lookingFor: ['Band Members', 'Recording Projects', 'Live Performances'],
    yearsExperience: 8,
    availability: 'available' as const
  },
  {
    id: '2',
    name: 'Marcus Johnson',
    username: 'marcusjohnson',
    location: 'Nashville, TN',
    instruments: ['Drums', 'Percussion'],
    genres: ['Jazz', 'Fusion', 'Rock'],
    experienceLevel: 'Professional',
    bio: 'Professional drummer with 15+ years experience in jazz, rock, and fusion. Toured with several regional bands and looking for serious projects.',
    lookingFor: ['Professional Gigs', 'Recording Sessions', 'Tours'],
    yearsExperience: 15,
    availability: 'busy' as const
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    username: 'emilyrodriguez',
    location: 'Austin, TX',
    instruments: ['Bass Guitar', 'Upright Bass'],
    genres: ['Blues', 'Rock', 'Country'],
    experienceLevel: 'Intermediate',
    bio: 'Versatile bass player comfortable in multiple genres. Love the groove and rhythm section work. Available for both studio and live work.',
    lookingFor: ['Band Members', 'Jam Sessions', 'Studio Work'],
    yearsExperience: 6,
    availability: 'available' as const
  },
  {
    id: '4',
    name: 'David Park',
    username: 'davidpark',
    location: 'Seattle, WA',
    instruments: ['Piano', 'Synthesizer', 'Organ'],
    genres: ['Electronic', 'Ambient', 'Progressive'],
    experienceLevel: 'Advanced',
    bio: 'Classically trained pianist exploring electronic and ambient music. Producer and composer looking for collaborative projects.',
    lookingFor: ['Collaborations', 'Electronic Projects', 'Composition Work'],
    yearsExperience: 10,
    availability: 'available' as const
  },
  {
    id: '5',
    name: 'Alex Thompson',
    username: 'alexthompson',
    location: 'Boston, MA',
    instruments: ['Violin', 'Viola'],
    genres: ['Classical', 'Folk', 'Experimental'],
    experienceLevel: 'Professional',
    bio: 'Classically trained violinist with interest in folk and experimental music. Looking to bridge classical technique with modern genres.',
    lookingFor: ['Cross-genre Projects', 'String Arrangements', 'Recording'],
    yearsExperience: 12,
    availability: 'not-looking' as const
  },
  {
    id: '6',
    name: 'Jordan Williams',
    username: 'jordanwilliams',
    location: 'Chicago, IL',
    instruments: ['Vocals', 'Guitar'],
    genres: ['Soul', 'R&B', 'Gospel'],
    experienceLevel: 'Intermediate',
    bio: 'Soulful vocalist with gospel roots and R&B influences. Also play rhythm guitar. Looking for a band that values authentic, emotional music.',
    lookingFor: ['Soul/R&B Band', 'Vocal Collaborations', 'Songwriting'],
    yearsExperience: 7,
    availability: 'available' as const
  },
  {
    id: '7',
    name: 'Taylor Swift',
    username: 'taylorswift',
    location: 'Denver, CO',
    instruments: ['Producer', 'Mixing', 'Guitar'],
    genres: ['Hip Hop', 'Electronic', 'Pop'],
    experienceLevel: 'Advanced',
    bio: 'Music producer and engineer specializing in hip hop and electronic music. Have my own studio and looking for artists to work with.',
    lookingFor: ['Artists to Produce', 'Mixing Projects', 'Beat Making'],
    yearsExperience: 9,
    availability: 'available' as const
  },
  {
    id: '8',
    name: 'Sam Mitchell',
    username: 'sammitchell',
    location: 'Portland, OR',
    instruments: ['Acoustic Guitar', 'Harmonica', 'Vocals'],
    genres: ['Folk', 'Americana', 'Singer-Songwriter'],
    experienceLevel: 'Intermediate',
    bio: 'Folk songwriter with a love for storytelling and acoustic arrangements. Write original songs and looking for musicians to bring them to life.',
    lookingFor: ['Folk Band', 'Songwriting Partners', 'Acoustic Projects'],
    yearsExperience: 5,
    availability: 'available' as const
  }
] */

export default function FindMusicians() {
  const router = useRouter()
  const [musicians, setMusicians] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    instruments: [],
    genres: [],
    experienceLevel: [],
    lookingFor: [],
    location: '',
    availability: 'all'
  })
  
  useEffect(() => {
    loadMusicians()
  }, [])
  
  const loadMusicians = async () => {
    setLoading(true)
    try {
      console.log('Loading musicians...')
      const startTime = Date.now()
      
      // Set a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('Loading timeout - setting empty musicians list')
        setMusicians([])
        setLoading(false)
      }, 15000) // 15 second timeout
      
      const data = await profileService.getAllMusicians()
      clearTimeout(timeoutId) // Clear timeout if query succeeds
      
      const endTime = Date.now()
      console.log(`Loaded ${data.length} musicians in ${endTime - startTime}ms`)
      setMusicians(data)
    } catch (error) {
      console.error('Error loading musicians:', error)
      setMusicians([])
    } finally {
      setLoading(false)
    }
  }

  const handlePostOpportunity = () => {
    router.push('/opportunities/create')
  }
  
  const applyFilters = (musician: Profile): boolean => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        musician.full_name?.toLowerCase().includes(searchLower) ||
        musician.username.toLowerCase().includes(searchLower) ||
        musician.bio?.toLowerCase().includes(searchLower) ||
        musician.instruments?.some(i => i.toLowerCase().includes(searchLower)) ||
        musician.genres?.some(g => g.toLowerCase().includes(searchLower)) ||
        musician.location?.toLowerCase().includes(searchLower)
      )
      if (!matchesSearch) return false
    }

    // Location filter
    if (filters.location && filters.location.trim()) {
      if (!musician.location || !musician.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
    }

    // Instruments filter
    if (filters.instruments?.length) {
      const hasMatchingInstrument = filters.instruments.some(filterInstrument =>
        musician.instruments?.some(musicianInstrument =>
          musicianInstrument.toLowerCase().includes(filterInstrument.toLowerCase())
        )
      )
      if (!hasMatchingInstrument) return false
    }

    // Genres filter
    if (filters.genres?.length) {
      const hasMatchingGenre = filters.genres.some(filterGenre =>
        musician.genres?.some(musicianGenre =>
          musicianGenre.toLowerCase().includes(filterGenre.toLowerCase())
        )
      )
      if (!hasMatchingGenre) return false
    }

    // Experience level filter
    if (filters.experienceLevel?.length) {
      if (!musician.experience_level || !filters.experienceLevel.includes(musician.experience_level)) {
        return false
      }
    }

    // Looking for filter
    if (filters.lookingFor?.length) {
      const hasMatchingLookingFor = filters.lookingFor.some(filterLookingFor =>
        musician.looking_for?.some(musicianLookingFor =>
          musicianLookingFor.toLowerCase().includes(filterLookingFor.toLowerCase())
        )
      )
      if (!hasMatchingLookingFor) return false
    }

    // Availability filter
    if (filters.availability && filters.availability !== 'all') {
      const isAvailable = musician.looking_for && musician.looking_for.length > 0
      if (filters.availability === 'available' && !isAvailable) return false
      if (filters.availability === 'not-looking' && isAvailable) return false
    }

    return true
  }
  
  const filteredMusicians = musicians.filter(applyFilters)
  const totalMusicians = filteredMusicians.length
  const availableMusicians = filteredMusicians.filter(m => m.looking_for && m.looking_for.length > 0).length

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.instruments?.length) count += filters.instruments.length
    if (filters.genres?.length) count += filters.genres.length
    if (filters.experienceLevel?.length) count += filters.experienceLevel.length
    if (filters.lookingFor?.length) count += filters.lookingFor.length
    if (filters.location) count++
    if (filters.availability && filters.availability !== 'all') count++
    return count
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {/* Header */}
          <div className="mb-6 md:mb-8">
            <div className="flex flex-col gap-4 mb-4">
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Find Musicians</h1>
                  <p className="text-secondary text-base md:text-lg">Connect with talented musicians and build your next project</p>
                </div>
              
                {/* Desktop controls */}
                <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                  <button 
                    onClick={handlePostOpportunity}
                    className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-3 rounded-lg transition-colors whitespace-nowrap"
                  >
                    <Plus className="w-5 h-5" />
                    Post Opportunity
                  </button>
                </div>
              </div>
              
              {/* Desktop search and filters row */}
              <div className="hidden md:flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search musicians..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-card border-0 rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal w-full"
                  />
                </div>
                <button 
                  onClick={() => setIsFilterOpen(true)}
                  className="flex items-center gap-2 bg-card hover:bg-opacity-80 text-white px-4 py-3 rounded-lg transition-colors relative whitespace-nowrap"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                  {getActiveFilterCount() > 0 && (
                    <span className="absolute -top-2 -right-2 bg-accent-teal text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      {getActiveFilterCount()}
                    </span>
                  )}
                </button>
              </div>
              
              {/* Mobile search and filters */}
              <div className="md:hidden space-y-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search musicians..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-card border-0 rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal w-full"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center justify-center gap-2 bg-card hover:bg-opacity-80 text-white px-4 py-3 rounded-lg transition-colors relative flex-1 min-h-[48px]"
                  >
                    <Filter className="w-5 h-5" />
                    <span>Filters</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="absolute -top-2 -right-2 bg-accent-teal text-black text-xs rounded-full w-5 h-5 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={handlePostOpportunity}
                    className="flex items-center justify-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-6 py-3 rounded-lg transition-colors sm:whitespace-nowrap flex-1 sm:flex-initial min-h-[48px]"
                  >
                    <Plus className="w-5 h-5" />
                    <span>Post Opportunity</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 md:mb-8">
            <div className="bg-card rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">{totalMusicians}</div>
              <div className="text-sm text-medium">Total Musicians</div>
            </div>
            <div className="bg-card rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-success">{availableMusicians}</div>
              <div className="text-sm text-medium">Available Now</div>
            </div>
            <div className="bg-card rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent-teal">12</div>
              <div className="text-sm text-medium">Instruments</div>
            </div>
            <div className="bg-card rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-accent-purple">8</div>
              <div className="text-sm text-medium">Genres</div>
            </div>
          </div>

          {/* All Musicians Section */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-black" />
              </div>
              <h2 className="text-2xl font-bold text-white">All Musicians</h2>
              <span className="text-medium">({totalMusicians} musicians)</span>
            </div>

            {/* Musicians Grid */}
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-white">Loading musicians...</div>
              </div>
            ) : filteredMusicians.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="text-white text-xl mb-2">No musicians found</div>
                  <div className="text-secondary">Try adjusting your search or check back later</div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                {filteredMusicians.map((musician) => (
                  <MusicianCard 
                    key={musician.id} 
                    profile={musician}
                  />
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        type="musicians"
      />
    </ProtectedRoute>
  )
}