'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import VenueCard from '@/components/VenueCard'
import ReportVenueModal from '@/components/ReportVenueModal'
import { Search, MapPin, Music, Coffee, Beer } from 'lucide-react'
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
  const [itemsPerPage] = useState(12) // Show 12 venues per page
  const [reportModalOpen, setReportModalOpen] = useState(false)
  const [reportingVenue, setReportingVenue] = useState<{ id: string; name: string } | null>(null)

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Music Venues Database
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Discover venues for booking your next show
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-700 font-medium">
                  <strong>Evolving Database:</strong> This venue list is continuously growing and improving. 
                  If you notice any errors or outdated information, please click the flag icon on any listing to report it.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
          <div className="relative">
            <input
              type="text"
              placeholder="Search by venue name, city, type, or genre (e.g., 'brewery raleigh', 'coffee shop', 'indie rock')..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              className="w-full pl-12 pr-4 py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors text-lg"
            />
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
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
              <VenueCard key={venue.id} venue={venue} onReport={handleReport} />
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