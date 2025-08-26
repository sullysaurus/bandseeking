'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { trackSearch } from '@/components/FacebookPixel'
import Navigation from '@/components/layout/Navigation'
import ProfileCard from '@/components/ProfileCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Search, Filter, X, ChevronDown, MapPin } from 'lucide-react'
import { instruments, genres, seekingOptions, experienceLevels, availabilityOptions } from '@/lib/utils'

export default function SearchClient() {
  const [profiles, setProfiles] = useState<any[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [gettingLocation, setGettingLocation] = useState(false)
  
  const [filters, setFilters] = useState({
    instrument: '',
    experienceLevel: [] as string[],
    genres: [] as string[],
    seeking: [] as string[],
    availability: [] as string[],
    hasTransportation: false,
    hasEquipment: false,
    maxDistance: 100,
    zipCode: ''
  })

  useEffect(() => {
    fetchProfiles()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [profiles, searchQuery, filters])

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
      setFilteredProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...profiles]

    // Search query
    if (searchQuery) {
      // Track search event for Facebook Pixel
      trackSearch(searchQuery)
      
      filtered = filtered.filter(profile => {
        const searchLower = searchQuery.toLowerCase()
        return (
          profile.user.full_name.toLowerCase().includes(searchLower) ||
          profile.user.username.toLowerCase().includes(searchLower) ||
          profile.bio?.toLowerCase().includes(searchLower) ||
          profile.influences?.toLowerCase().includes(searchLower)
        )
      })
    }

    // Instrument filter
    if (filters.instrument) {
      filtered = filtered.filter(profile => 
        profile.main_instrument === filters.instrument ||
        profile.secondary_instruments?.includes(filters.instrument)
      )
    }

    // Experience level filter
    if (filters.experienceLevel.length > 0) {
      filtered = filtered.filter(profile =>
        filters.experienceLevel.includes(profile.experience_level)
      )
    }

    // Genres filter
    if (filters.genres.length > 0) {
      filtered = filtered.filter(profile =>
        profile.genres?.some((genre: string) => filters.genres.includes(genre))
      )
    }

    // Seeking filter
    if (filters.seeking.length > 0) {
      filtered = filtered.filter(profile =>
        profile.seeking?.some((item: string) => filters.seeking.includes(item))
      )
    }

    // Availability filter
    if (filters.availability.length > 0) {
      filtered = filtered.filter(profile => {
        if (Array.isArray(profile.availability)) {
          return profile.availability.some((item: string) => filters.availability.includes(item))
        } else {
          return filters.availability.includes(profile.availability)
        }
      })
    }

    // Transportation filter
    if (filters.hasTransportation) {
      filtered = filtered.filter(profile => profile.has_transportation)
    }

    // Equipment filter
    if (filters.hasEquipment) {
      filtered = filtered.filter(profile => profile.has_own_equipment)
    }

    // Location-based filter
    if (filters.zipCode) {
      // TODO: Implement actual distance calculation between zip codes
      // For now, just filter by exact zip code match
      filtered = filtered.filter(profile =>
        profile.user.zip_code === filters.zipCode
      )
    }

    setFilteredProfiles(filtered)
  }

  const clearFilters = () => {
    setFilters({
      instrument: '',
      experienceLevel: [],
      genres: [],
      seeking: [],
      availability: [],
      hasTransportation: false,
      hasEquipment: false,
      maxDistance: 100,
      zipCode: ''
    })
    setSearchQuery('')
  }

  const getMyLocation = async () => {
    setGettingLocation(true)
    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser')
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        })
      })

      const { latitude, longitude } = position.coords

      // Use reverse geocoding to get ZIP code
      const response = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
      )
      
      if (!response.ok) {
        throw new Error('Failed to get location data')
      }

      const data = await response.json()
      const zipCode = data.postcode || data.postalCode

      if (zipCode) {
        setFilters({ ...filters, zipCode })
      } else {
        throw new Error('Could not determine ZIP code from location')
      }
    } catch (error) {
      console.error('Error getting location:', error)
      alert(error instanceof Error ? error.message : 'Failed to get your location')
    } finally {
      setGettingLocation(false)
    }
  }

  const activeFiltersCount = () => {
    let count = 0
    if (filters.instrument) count++
    if (filters.experienceLevel.length > 0) count += filters.experienceLevel.length
    if (filters.genres.length > 0) count += filters.genres.length
    if (filters.seeking.length > 0) count += filters.seeking.length
    if (filters.availability.length > 0) count += filters.availability.length
    if (filters.hasTransportation) count++
    if (filters.hasEquipment) count++
    if (filters.zipCode) count++
    return count
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Search Header */}
          <div className="mb-6">
            <h1 className="text-4xl font-bold mb-2 text-black">Find Musicians</h1>
            <p className="text-gray-600 text-lg">Discover talented musicians ready to collaborate</p>
          </div>

          {/* Main Search Input */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, username, bio, or influences..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg"
              />
            </div>
          </div>

        {/* Compact Search Controls */}
        <div className="mb-6">
          {/* Main Search Bar - Single Row */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Location and Radius Section */}
              <div className="flex items-center gap-4 lg:w-auto">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="ZIP Code"
                    value={filters.zipCode}
                    onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                    maxLength={5}
                    className="pl-10 pr-4 h-10 w-32 text-center bg-gray-50 border-gray-200 rounded-lg focus:bg-white transition-colors"
                  />
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={getMyLocation}
                  disabled={gettingLocation}
                  className="h-10 px-3 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200"
                  title="Use my location"
                >
                  {gettingLocation ? (
                    <div className="w-4 h-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
                  ) : (
                    <MapPin className="w-4 h-4" />
                  )}
                </Button>
                
                {/* Compact Radius */}
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600 whitespace-nowrap">within</span>
                  <select
                    value={filters.maxDistance}
                    onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                    className="h-10 px-4 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-w-[80px]"
                  >
                    <option value={5}>5mi</option>
                    <option value={10}>10mi</option>
                    <option value={25}>25mi</option>
                    <option value={50}>50mi</option>
                    <option value={100}>100mi</option>
                  </select>
                </div>
              </div>

              {/* Quick Instrument Filters */}
              <div className="flex items-center gap-3 flex-1">
                {['Guitar', 'Drums', 'Vocals', 'Bass'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => {
                      const realChip = chip
                      setFilters({ ...filters, instrument: filters.instrument === realChip ? '' : realChip })
                    }}
                    className={`px-4 py-1.5 text-sm rounded-lg border transition-all font-medium ${
                      filters.instrument === chip
                        ? 'bg-blue-600 text-white border-blue-600'
                        : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* More Filters Button */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 h-10 px-4 rounded-lg bg-gray-100 hover:bg-gray-200 border-0 shrink-0"
              >
                <Filter className="w-4 h-4" />
                <span className="font-medium">Filters</span>
                {activeFiltersCount() > 0 && (
                  <span className="px-1.5 py-0.5 bg-blue-600 text-white text-xs rounded-full font-semibold">
                    {activeFiltersCount()}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-white rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={clearFilters}
                className="text-sm text-gray-600 hover:text-black"
              >
                Clear all
              </button>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Instrument */}
              <div>
                <label className="block text-sm font-medium mb-2">Instrument</label>
                <select
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  value={filters.instrument}
                  onChange={(e) => setFilters({ ...filters, instrument: e.target.value })}
                >
                  <option value="">All Instruments</option>
                  {instruments.map((instrument) => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </select>
              </div>

              {/* Experience Level */}
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {experienceLevels.map((level) => (
                    <label key={level.value} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filters.experienceLevel.includes(level.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              experienceLevel: [...filters.experienceLevel, level.value]
                            })
                          } else {
                            setFilters({
                              ...filters,
                              experienceLevel: filters.experienceLevel.filter(l => l !== level.value)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{level.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Availability */}
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {availabilityOptions.map((option) => (
                    <label key={option.value} className="flex items-center">
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={filters.availability.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFilters({
                              ...filters,
                              availability: [...filters.availability, option.value]
                            })
                          } else {
                            setFilters({
                              ...filters,
                              availability: filters.availability.filter(a => a !== option.value)
                            })
                          }
                        }}
                      />
                      <span className="text-sm">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Logistics */}
              <div>
                <label className="block text-sm font-medium mb-2">Logistics</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.hasTransportation}
                      onChange={(e) => setFilters({ ...filters, hasTransportation: e.target.checked })}
                    />
                    <span className="text-sm">Has Transportation</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.hasEquipment}
                      onChange={(e) => setFilters({ ...filters, hasEquipment: e.target.checked })}
                    />
                    <span className="text-sm">Has Own Equipment</span>
                  </label>
                </div>
              </div>

            </div>

            {/* Genres (expandable) */}
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-sm mb-2">
                Genres ({filters.genres.length} selected)
              </summary>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
                {genres.map((genre) => (
                  <label key={genre} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.genres.includes(genre)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, genres: [...filters.genres, genre] })
                        } else {
                          setFilters({ ...filters, genres: filters.genres.filter(g => g !== genre) })
                        }
                      }}
                    />
                    <span className="text-sm">{genre}</span>
                  </label>
                ))}
              </div>
            </details>

            {/* Seeking (expandable) */}
            <details className="mt-4">
              <summary className="cursor-pointer font-medium text-sm mb-2">
                Looking For ({filters.seeking.length} selected)
              </summary>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                {seekingOptions.map((option) => (
                  <label key={option} className="flex items-center">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={filters.seeking.includes(option)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setFilters({ ...filters, seeking: [...filters.seeking, option] })
                        } else {
                          setFilters({ ...filters, seeking: filters.seeking.filter(s => s !== option) })
                        }
                      }}
                    />
                    <span className="text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </details>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4">
          <p className="text-gray-700">
            Found {filteredProfiles.length} musician{filteredProfiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-80 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-700 mb-4">No musicians found matching your criteria</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
        </div>
      </div>
    </>
  )
}