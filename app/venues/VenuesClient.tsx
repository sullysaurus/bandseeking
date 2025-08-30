'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { trackVenueSearch } from '@/components/FacebookPixel'
import Navigation from '@/components/layout/Navigation'
import VenueCard from '@/components/VenueCard'
import ReportVenueModal from '@/components/ReportVenueModal'
import SuggestVenueModal from '@/components/SuggestVenueModal'
import { Search, MapPin, Music, Coffee, Beer, Mail, Eye, Flag, Users, Plus } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']

// Map venue types to icons
const venueTypeIcons = {
  music_venue: <Music className="w-5 h-5" />,
  brewery: <Beer className="w-5 h-5" />,
  winery: <Music className="w-5 h-5" />,
  coffee_shop: <Coffee className="w-5 h-5" />,
  restaurant: <Music className="w-5 h-5" />,
  bar: <Beer className="w-5 h-5" />,
  event_space: <Music className="w-5 h-5" />,
  amphitheater: <Music className="w-5 h-5" />,
  theater: <Music className="w-5 h-5" />,
  arena: <Music className="w-5 h-5" />
}

// Map venue types to colors
const venueTypeColors = {
  music_venue: 'bg-purple-200 text-purple-800 border-purple-400',
  brewery: 'bg-amber-200 text-amber-800 border-amber-400',
  winery: 'bg-rose-200 text-rose-800 border-rose-400',
  coffee_shop: 'bg-orange-200 text-orange-800 border-orange-400',
  restaurant: 'bg-green-200 text-green-800 border-green-400',
  bar: 'bg-blue-200 text-blue-800 border-blue-400',
  event_space: 'bg-indigo-200 text-indigo-800 border-indigo-400',
  amphitheater: 'bg-pink-200 text-pink-800 border-pink-400',
  theater: 'bg-red-200 text-red-800 border-red-400',
  arena: 'bg-yellow-200 text-yellow-800 border-yellow-400'
}

// Map venue types to labels
const venueTypeLabels = {
  music_venue: 'Music Venue',
  brewery: 'Brewery',
  winery: 'Winery', 
  coffee_shop: 'Coffee Shop',
  restaurant: 'Restaurant',
  bar: 'Bar',
  event_space: 'Event Space',
  amphitheater: 'Amphitheater',
  theater: 'Theater',
  arena: 'Arena'
}

// Generate URL-friendly slug from venue name
const generateVenueSlug = (name: string, city: string, state: string) => {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim() // Remove leading/trailing spaces

  // Add city for uniqueness if needed (for similar venue names)
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${baseSlug}-${citySlug}-${state.toLowerCase()}`
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
  const [showSuggestModal, setShowSuggestModal] = useState(false)

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
    <div className="min-h-screen bg-lime-300">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        {/* Header */}
        <div className="mb-3 sm:mb-8">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-black mb-1 sm:mb-4">
            VENUES
          </h1>
          <p className="text-sm sm:text-lg font-bold text-black">
            DISCOVER VENUES FOR BOOKING YOUR NEXT SHOW
          </p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white border-2 sm:border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search venues..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="w-full pl-10 pr-4 py-2 sm:py-3 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors font-bold text-sm sm:text-base"
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-3 sm:mb-6">
          <p className="text-black font-black text-sm sm:text-lg">
            {loading ? 'LOADING...' : (
              <>
                <span className="hidden sm:inline">SHOWING </span>
                {venues.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalCount)} 
                <span className="hidden sm:inline"> OF </span>
                <span className="sm:hidden">/</span>
                {totalCount} VENUES
                {hasSearched && (
                  <span className="ml-1 sm:ml-2 text-gray-700 text-xs sm:text-base">
                    (FILTERED)
                  </span>
                )}
              </>
            )}
          </p>
        </div>

        {/* Selection Controls */}
        {!loading && venues.length > 0 && selectedVenues.size > 0 && (
          <div className="mb-3 sm:mb-4 bg-white border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-2 sm:p-4 rounded-lg">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-bold text-gray-700">
                  {selectedVenues.size} venue{selectedVenues.size !== 1 ? 's' : ''} selected
                </span>
              </div>
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
            </div>
          </div>
        )}

        {/* Venues Table */}
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
            </div>
          ) : venues.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-100 border-b-4 border-black">
                  <tr>
                    <th className="px-2 sm:px-4 py-2 sm:py-3 text-left font-black text-xs sm:text-sm">
                      VENUE INFO
                    </th>
                    <th className="px-1 sm:px-4 py-2 sm:py-3 text-center font-black text-xs sm:text-sm hidden sm:table-cell">TYPE</th>
                    <th className="px-1 sm:px-4 py-2 sm:py-3 text-center font-black text-xs sm:text-sm hidden sm:table-cell">LOCATION</th>
                    <th className="px-1 sm:px-4 py-2 sm:py-3 text-center font-black text-xs sm:text-sm hidden sm:table-cell">CAPACITY</th>
                    <th className="px-1 sm:px-4 py-2 sm:py-3 text-center font-black text-xs sm:text-sm">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {venues.map((venue, index) => (
                    <tr 
                      key={venue.id} 
                      className={`border-b-2 border-gray-200 hover:bg-lime-100 transition-colors ${
                        selectedVenues.has(venue.id) ? 'bg-blue-50' : ''
                      }`}
                    >
                      <td className="px-2 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-start gap-2 sm:gap-3">
                          <input
                            type="checkbox"
                            checked={selectedVenues.has(venue.id)}
                            onChange={() => handleVenueSelect(venue.id)}
                            className="flex-shrink-0 w-3 h-3 sm:w-4 sm:h-4 mt-1"
                          />
                          <div className="min-w-0 flex-1">
                            <h3 className="font-black text-sm sm:text-lg text-black mb-1">
                              {venue.name}
                            </h3>
                            
                            {/* Mobile: Stack venue info vertically */}
                            <div className="sm:hidden space-y-1">
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                {venueTypeIcons[venue.venue_type]}
                                <span className="font-bold">{venueTypeLabels[venue.venue_type]}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <MapPin className="w-3 h-3" />
                                <span className="font-bold">{venue.city}, {venue.state}</span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Users className="w-3 h-3" />
                                <span className="font-bold">
                                  {venue.capacity ? (venue.capacity >= 1000 ? Math.floor(venue.capacity / 1000) + 'k' : venue.capacity.toString()) : 'Variable'}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                      
                      {/* Desktop columns - hidden on mobile */}
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${venueTypeColors[venue.venue_type]}`}>
                          {venueTypeLabels[venue.venue_type]}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <div className="flex items-center gap-1 justify-center">
                          <MapPin className="w-4 h-4 text-gray-500" />
                          <span className="font-bold text-sm">{venue.city}, {venue.state}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center hidden sm:table-cell">
                        <span className="font-bold text-sm">
                          {venue.capacity ? venue.capacity.toLocaleString() : 'Variable'}
                        </span>
                      </td>
                      
                      {/* Actions column */}
                      <td className="px-2 sm:px-4 py-3 sm:py-4">
                        <div className="flex items-center justify-end sm:justify-center gap-1 sm:gap-2">
                          {venue.contact_email && (
                            <a
                              href={`mailto:${venue.contact_email}`}
                              className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-blue-400 border-2 border-black hover:bg-blue-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                              title={`Email ${venue.name}`}
                            >
                              <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                            </a>
                          )}
                          <a
                            href={`/venue/${generateVenueSlug(venue.name, venue.city, venue.state)}`}
                            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-green-400 border-2 border-black hover:bg-green-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            title={`View ${venue.name}`}
                          >
                            <Eye className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                          </a>
                          <button
                            onClick={() => handleReport(venue.id, venue.name)}
                            className="inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 bg-red-400 border-2 border-black hover:bg-red-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] sm:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            title="Report inaccurate information"
                          >
                            <Flag className="w-3 h-3 sm:w-4 sm:h-4 text-black" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-2xl font-black text-gray-900 mb-2">NO VENUES FOUND</p>
              <p className="font-bold text-gray-600">Try adjusting your search criteria</p>
            </div>
          )}
        </div>

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