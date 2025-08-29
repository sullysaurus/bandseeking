'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { trackVenueSearch } from '@/components/FacebookPixel'
import Navigation from '@/components/layout/Navigation'
import VenueCard from '@/components/VenueCard'
import ReportVenueModal from '@/components/ReportVenueModal'
import { Search, MapPin, Music, Coffee, Beer } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']

// Map venue types to icons
const venueTypeIcons = {
  music_venue: <Music className="w-4 h-4" />,
  brewery: <Beer className="w-4 h-4" />,
  winery: <Music className="w-4 h-4" />,
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
  const [searchExpanded, setSearchExpanded] = useState(false)

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
          .or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%,city.ilike.%${searchText}%,state.ilike.%${searchText}%`)
        
        const fallbackQuery = supabase
          .from('venues')
          .select('*')
          .or(`name.ilike.%${searchText}%,description.ilike.%${searchText}%,city.ilike.%${searchText}%,state.ilike.%${searchText}%`)
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

        {/* Search */}
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

          <div className={`${searchExpanded ? 'block' : 'hidden sm:block'}`}>
            {/* Search Input */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search by venue name, city, state, type, or genre (e.g., 'brewery', 'raleigh', 'coffee shop charlotte')..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors text-base sm:text-lg"
              />
              <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 sm:w-6 sm:h-6" />
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
                      ✉️ Yahoo Mail
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Grid */}
        {loading ? (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            <p className="mt-2 text-gray-600">Loading venues...</p>
          </div>
        ) : venues.length === 0 ? (
          <div className="text-center py-8 bg-white rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
            <p className="text-lg font-semibold text-gray-900">No venues found</p>
            <p className="mt-2 text-gray-600">Try adjusting your search criteria</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            {venues.map((venue) => (
              <VenueCard
                key={venue.id}
                venue={venue}
                onReport={handleReport}
                isSelected={selectedVenues.has(venue.id)}
                onSelect={handleVenueSelect}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalCount > itemsPerPage && (
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border-2 border-black font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                PREV
              </button>
              <span className="px-4 py-2 font-bold">
                Page {currentPage} of {Math.ceil(totalCount / itemsPerPage)}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(Math.ceil(totalCount / itemsPerPage), prev + 1))}
                disabled={currentPage === Math.ceil(totalCount / itemsPerPage)}
                className="px-4 py-2 border-2 border-black font-black text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                NEXT
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Report Modal */}
      {reportModalOpen && reportingVenue && (
        <ReportVenueModal
          onClose={handleReportClose}
          venueId={reportingVenue.id}
          venueName={reportingVenue.name}
        />
      )}
    </div>
  )
}