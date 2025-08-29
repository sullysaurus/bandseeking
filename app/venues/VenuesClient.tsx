'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { trackVenueSearch } from '@/components/FacebookPixel'
import Navigation from '@/components/layout/Navigation'
import VenueCard from '@/components/VenueCard'
import ReportVenueModal from '@/components/ReportVenueModal'
import { Search, MapPin, Music, Coffee, Beer, Navigation as NavigationIcon } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']
type VenueType = Venue['venue_type']

const venueTypeLabels: Record<VenueType, string> = {
  music_venue: 'Music Venue',
  brewery: 'Brewery',
  coffee_shop: 'Coffee Shop',
  restaurant: 'Restaurant',
  bar: 'Bar',
  event_space: 'Event Space',
  amphitheater: 'Amphitheater',
  theater: 'Theater',
  arena: 'Arena'
}

const venueTypeIcons: Record<VenueType, React.ReactNode> = {
  music_venue: <Music className="w-4 h-4" />,
  brewery: <Beer className="w-4 h-4" />,
  coffee_shop: <Coffee className="w-4 h-4" />,
  restaurant: <Music className="w-4 h-4" />,
  bar: <Beer className="w-4 h-4" />,
  event_space: <Music className="w-4 h-4" />,
  amphitheater: <Music className="w-4 h-4" />,
  theater: <Music className="w-4 h-4" />,
  arena: <Music className="w-4 h-4" />
}

export default function VenuesClient() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [hasSearched, setHasSearched] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [itemsPerPage] = useState(20) // Show 20 venues per page
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingVenue, setReportingVenue] = useState<{ id: string; name: string } | null>(null)
  const [selectedVenues, setSelectedVenues] = useState<Set<string>>(new Set())
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [locationFilter, setLocationFilter] = useState('')
  const [distanceFilter, setDistanceFilter] = useState(25) // Default 25 miles
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [searchExpanded, setSearchExpanded] = useState(false)

  // Helper function to calculate distance between two points
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 3959 // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180
    const dLon = (lon2 - lon1) * Math.PI / 180
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
    return R * c
  }

  // Geocode a location string (ZIP or city)
  const geocodeLocation = async (location: string): Promise<{ lat: number; lon: number } | null> => {
    try {
      const response = await fetch(
        `/api/geocode?location=${encodeURIComponent(location)}`
      )
      if (!response.ok) {
        throw new Error('Geocoding failed')
      }
      const data = await response.json()
      if (data.lat && data.lon) {
        return {
          lat: data.lat,
          lon: data.lon
        }
      }
    } catch (error) {
      console.error('Error geocoding location:', error)
    }
    return null
  }

  // Handle location search
  const handleLocationSearch = async () => {
    if (!locationFilter.trim()) return
    
    setLocationLoading(true)
    try {
      const coords = await geocodeLocation(locationFilter)
      if (coords) {
        setUserLocation(coords)
        setCurrentPage(1)
        fetchVenues(1)
      } else {
        alert('Could not find location. Please try a different ZIP code or city name.')
      }
    } catch (error) {
      console.error('Error searching by location:', error)
      alert('Error searching by location. Please try again.')
    } finally {
      setLocationLoading(false)
    }
  }

  // Handle using current location
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser')
      return
    }

    setLocationLoading(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        })
        setLocationFilter('Current Location')
        setCurrentPage(1)
        fetchVenues(1)
        setLocationLoading(false)
      },
      (error) => {
        console.error('Error getting location:', error)
        alert('Could not get your location. Please check your browser permissions.')
        setLocationLoading(false)
      }
    )
  }

  useEffect(() => {
    fetchVenues()
  }, [currentPage])

  // Auto-search when search text changes (debounced)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      const hasSearch = searchText.trim()
      
      if (hasSearch) {
        searchVenues(1) // Always start from page 1 for new searches
        setHasSearched(true)
      } else {
        // If search is empty, reset to all venues
        setCurrentPage(1)
        fetchVenues(1)
        setHasSearched(false)
      }
    }, 500)

    return () => clearTimeout(timeoutId)
  }, [searchText])

  // Handle pagination for search results
  useEffect(() => {
    if (hasSearched && searchText.trim()) {
      searchVenues(currentPage)
    }
  }, [currentPage, hasSearched])

  const fetchVenues = async (page: number = currentPage) => {
    try {
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      // Get total count
      const { count } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })

      // Get paginated data
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .order('name', { ascending: true })
        .range(from, to)

      if (error) throw error
      
      setVenues(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const searchVenues = async (page: number = 1) => {
    if (!searchText.trim()) {
      setCurrentPage(1)
      fetchVenues(1)
      return
    }

    try {
      setLoading(true)
      
      // Track venue search for Facebook Pixel
      trackVenueSearch(searchText.trim())
      
      // Reset to page 1 when starting a new search
      if (page === 1) {
        setCurrentPage(1)
      }
      
      const from = (page - 1) * itemsPerPage
      const to = from + itemsPerPage - 1
      
      // Format search query for PostgreSQL full-text search
      // Replace spaces with & for AND queries (e.g., "coffee raleigh" becomes "coffee & raleigh")
      const formattedQuery = searchText.trim().split(/\s+/).join(' & ')
      
      // Get total count for search results
      const { count } = await supabase
        .from('venues')
        .select('*', { count: 'exact', head: true })
        .textSearch('fts', formattedQuery)
      
      // Use full-text search with proper query formatting and pagination
      const { data, error } = await supabase
        .from('venues')
        .select('*')
        .textSearch('fts', formattedQuery)
        .order('name', { ascending: true })
        .range(from, to)

      if (error) {
        // If full-text search fails, fall back to basic text matching
        console.warn('Full-text search failed, using fallback:', error)
        
        // Get count for fallback
        const { count: fallbackCount } = await supabase
          .from('venues')
          .select('*', { count: 'exact', head: true })
          .or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%,city.ilike.%${searchText}%`)
        
        const fallbackQuery = supabase
          .from('venues')
          .select('*')
          .or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%,city.ilike.%${searchText}%`)
          .order('name', { ascending: true })
          .range(from, to)
        
        const { data: fallbackData, error: fallbackError } = await fallbackQuery
        
        if (fallbackError) throw fallbackError
        setVenues(fallbackData || [])
        setTotalCount(fallbackCount || 0)
      } else {
        setVenues(data || [])
        setTotalCount(count || 0)
      }
    } catch (error) {
      console.error('Error searching venues:', error)
      // On any error, just fetch all venues
      fetchVenues(1)
    } finally {
      setLoading(false)
    }
  }

  const handleReport = (venueId: string, venueName: string) => {
    setReportingVenue({ id: venueId, name: venueName })
    setReportModalOpen(true)
  }

  const handleReportClose = () => {
    setReportModalOpen(false)
    setReportingVenue(null)
  }

  const handleVenueSelect = (venueId: string) => {
    const newSelection = new Set(selectedVenues)
    if (newSelection.has(venueId)) {
      newSelection.delete(venueId)
    } else {
      newSelection.add(venueId)
    }
    setSelectedVenues(newSelection)
  }

  const handleSelectAll = () => {
    if (selectedVenues.size === venues.length) {
      setSelectedVenues(new Set())
    } else {
      setSelectedVenues(new Set(venues.map(v => v.id)))
    }
  }

  const handleEmailSelected = () => {
    if (selectedVenues.size > 0) {
      setShowEmailModal(true)
    }
  }

  const generateEmailLink = (client = 'default') => {
    const selectedVenueData = venues.filter(v => selectedVenues.has(v.id))
    const emails = selectedVenueData
      .filter(v => v.contact_email)
      .map(v => v.contact_email)
      .join(',')
    
    const subject = encodeURIComponent('Booking Inquiry')
    const body = encodeURIComponent(`Hello,

I'm reaching out regarding potential booking opportunities at your venue.

Please let me know if you have availability for live music performances and what your booking process looks like.

Thank you for your time!

Best regards,`)

    // For BCC, we put all emails in BCC field and leave TO field empty
    const bccEmails = emails
    
    switch (client) {
      case 'gmail':
        return `https://mail.google.com/mail/?view=cm&su=${subject}&body=${body}&bcc=${encodeURIComponent(bccEmails)}`
      case 'outlook':
        return `https://outlook.live.com/mail/0/deeplink/compose?subject=${subject}&body=${body}&bcc=${encodeURIComponent(bccEmails)}`
      case 'yahoo':
        return `https://compose.mail.yahoo.com/?subject=${subject}&body=${body}&bcc=${encodeURIComponent(bccEmails)}`
      default:
        return `mailto:?subject=${subject}&body=${body}&bcc=${bccEmails}`
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-4 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Music Venue Database
          </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-3 sm:mb-4">
            Discover venues for booking your next show
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 sm:p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  <strong>Evolving Database:</strong> Click the flag icon on any listing to report innacuracies.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 sm:p-6 mb-4 sm:mb-8">
          {/* Mobile Search Toggle */}
          <div className="sm:hidden mb-4">
            <button
              onClick={() => setSearchExpanded(!searchExpanded)}
              className="w-full flex items-center justify-between px-4 py-3 bg-gray-100 border-2 border-black rounded-lg font-bold text-gray-800"
            >
              <span className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                {searchExpanded ? 'HIDE SEARCH' : 'SEARCH VENUES'}
              </span>
              <span className="text-xl">{searchExpanded ? '−' : '+'}</span>
            </button>
          </div>

          <div className={`space-y-4 ${searchExpanded ? 'block' : 'hidden sm:block'}`}>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by venue name, city, state, type, or genre (e.g., 'brewery raleigh', 'coffee shop charlotte', 'indie rock')..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors text-base sm:text-lg"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            
            {/* Location Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Enter ZIP code or city for location-based search"
                    value={locationFilter}
                    onChange={(e) => setLocationFilter(e.target.value)}
                    className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                  />
                  <button
                    onClick={handleLocationSearch}
                    disabled={locationLoading || !locationFilter.trim()}
                    className="px-4 py-2 bg-blue-500 text-white border-2 border-black font-bold text-sm hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                  >
                    <NavigationIcon className="w-4 h-4" />
                    {locationLoading ? 'LOCATING...' : 'SEARCH NEARBY'}
                  </button>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm font-bold text-gray-700">Within:</label>
                <select
                  value={distanceFilter}
                  onChange={(e) => setDistanceFilter(Number(e.target.value))}
                  className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors font-bold"
                >
                  <option value="10">10 miles</option>
                  <option value="25">25 miles</option>
                  <option value="50">50 miles</option>
                  <option value="100">100 miles</option>
                  <option value="250">250 miles</option>
                </select>
              </div>
            </div>
            
            {/* Current Location Button */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleUseCurrentLocation}
                disabled={locationLoading}
                className="px-4 py-2 bg-green-500 text-white border-2 border-black font-bold text-sm hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
              >
                <MapPin className="w-4 h-4" />
                USE MY CURRENT LOCATION
              </button>
              {userLocation && (
                <button
                  onClick={() => {
                    setUserLocation(null)
                    setLocationFilter('')
                    fetchVenues(1)
                  }}
                  className="px-4 py-2 bg-gray-500 text-white border-2 border-black font-bold text-sm hover:bg-gray-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                >
                  CLEAR LOCATION
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Selection Controls */}
        {!loading && venues.length > 0 && (
          <div className="mb-4 bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={handleSelectAll}
                  className="px-3 py-1 border-2 border-black font-black text-sm hover:bg-gray-100 transition-colors"
                >
                  {selectedVenues.size === venues.length ? 'DESELECT ALL' : 'SELECT ALL'}
                </button>
                {selectedVenues.size > 0 && (
                  <span className="text-sm font-bold text-gray-700">
                    {selectedVenues.size} venue{selectedVenues.size !== 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              {selectedVenues.size > 0 && (
                <div className="relative group">
                  <button className="px-4 py-2 bg-blue-500 text-white border-2 border-black font-black text-sm hover:bg-blue-600 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2">
                    EMAIL SELECTED ({selectedVenues.size}) ▼
                  </button>
                  <div className="absolute right-0 top-full mt-1 bg-white border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                    <a
                      href={generateEmailLink('default')}
                      className="block px-4 py-2 font-bold text-sm text-gray-800 hover:bg-gray-100 border-b border-gray-200"
                    >
                      📧 Default Email Client
                    </a>
                    <a
                      href={generateEmailLink('gmail')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 font-bold text-sm text-gray-800 hover:bg-gray-100 border-b border-gray-200"
                    >
                      📮 Gmail
                    </a>
                    <a
                      href={generateEmailLink('outlook')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 font-bold text-sm text-gray-800 hover:bg-gray-100 border-b border-gray-200"
                    >
                      📨 Outlook
                    </a>
                    <a
                      href={generateEmailLink('yahoo')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-4 py-2 font-bold text-sm text-gray-800 hover:bg-gray-100"
                    >
                      📬 Yahoo Mail
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-3 sm:mb-6">
          <p className="text-gray-600">
            {loading ? 'Loading venues...' : (
              <>
                Showing {venues.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} venues
                {hasSearched && searchText && (
                  <span className="ml-2 text-gray-500">
                    for &quot;{searchText}&quot;
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Venues Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
          </div>
        ) : venues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map(venue => (
              <VenueCard 
                key={venue.id} 
                venue={venue} 
                onReport={handleReport} 
                onSelect={handleVenueSelect}
                isSelected={selectedVenues.has(venue.id)}
              />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No venues found for &quot;{searchText}&quot;</h3>
            <p className="text-gray-600">Try different search terms like venue names, cities, types, or genres</p>
            <button
              onClick={() => setSearchText('')}
              className="mt-4 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors font-medium"
            >
              Show All Venues
            </button>
          </div>
        ) : (
          <div className="text-center py-12">
            <MapPin className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No venues available</h3>
            <p className="text-gray-600">Check back later for more venues</p>
          </div>
        )}

        {/* Pagination */}
        {!loading && totalCount > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg px-6 py-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 font-black text-sm border-2 border-black transition-colors ${
                    currentPage === 1
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-cyan-300'
                  }`}
                >
                  ← PREV
                </button>

                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {(() => {
                    const totalPages = Math.ceil(totalCount / itemsPerPage)
                    const pages = []
                    const showPages = 5
                    let startPage = Math.max(1, currentPage - Math.floor(showPages / 2))
                    let endPage = Math.min(totalPages, startPage + showPages - 1)
                    
                    // Adjust start if we're near the end
                    startPage = Math.max(1, endPage - showPages + 1)

                    for (let i = startPage; i <= endPage; i++) {
                      pages.push(
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i)}
                          className={`px-3 py-2 font-black text-sm border-2 border-black transition-colors ${
                            currentPage === i
                              ? 'bg-black text-white'
                              : 'bg-white text-black hover:bg-lime-300'
                          }`}
                        >
                          {i}
                        </button>
                      )
                    }
                    return pages
                  })()}
                </div>

                <button
                  onClick={() => setCurrentPage(Math.min(Math.ceil(totalCount / itemsPerPage), currentPage + 1))}
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                  className={`px-4 py-2 font-black text-sm border-2 border-black transition-colors ${
                    currentPage >= Math.ceil(totalCount / itemsPerPage)
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : 'bg-white text-black hover:bg-cyan-300'
                  }`}
                >
                  NEXT →
                </button>
              </div>

              {/* Page info */}
              <div className="text-center mt-3 text-sm text-gray-600">
                Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Report Modal */}
      {reportModalOpen && reportingVenue && (
        <ReportVenueModal
          venueId={reportingVenue.id}
          venueName={reportingVenue.name}
          onClose={handleReportClose}
        />
      )}
    </div>
  )
}