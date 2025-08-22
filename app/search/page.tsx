'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import ProfileCard from '@/components/ProfileCard'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Search, Filter, X, ChevronDown, MapPin } from 'lucide-react'
import { instruments, genres, seekingOptions, experienceLevels, availabilityOptions } from '@/lib/utils'

export default function SearchPage() {
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
      filtered = filtered.filter(profile =>
        filters.availability.includes(profile.availability)
      )
    }

    // Transportation filter
    if (filters.hasTransportation) {
      filtered = filtered.filter(profile => profile.has_transportation)
    }

    // Equipment filter
    if (filters.hasEquipment) {
      filtered = filtered.filter(profile => profile.has_own_equipment)
    }

    // Distance filter
    filtered = filtered.filter(profile =>
      profile.willing_to_travel_miles >= filters.maxDistance
    )

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
    if (filters.maxDistance < 100) count++
    if (filters.zipCode) count++
    return count
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Find Musicians</h1>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, bio, or influences..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="secondary"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
              {activeFiltersCount() > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-black text-white text-xs rounded-full">
                  {activeFiltersCount()}
                </span>
              )}
            </Button>
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

              {/* Distance */}
              <div>
                <label className="block text-sm font-medium mb-2">
                  Max Travel Distance: {filters.maxDistance} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={filters.maxDistance}
                  onChange={(e) => setFilters({ ...filters, maxDistance: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>

              {/* Location */}
              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="space-y-2">
                  <Input
                    placeholder="Enter ZIP code"
                    value={filters.zipCode}
                    onChange={(e) => setFilters({ ...filters, zipCode: e.target.value })}
                    maxLength={5}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={getMyLocation}
                    disabled={gettingLocation}
                    className="w-full flex items-center justify-center gap-2 text-sm"
                  >
                    <MapPin className="w-4 h-4" />
                    {gettingLocation ? 'Getting location...' : 'Get my location'}
                  </Button>
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
          <p className="text-gray-600">
            Found {filteredProfiles.length} musician{filteredProfiles.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : filteredProfiles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No musicians found matching your criteria</p>
            <Button variant="secondary" onClick={clearFilters}>
              Clear Filters
            </Button>
          </div>
        )}
      </div>
    </>
  )
}