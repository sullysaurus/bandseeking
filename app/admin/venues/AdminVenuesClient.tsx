'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Plus, Edit, Trash2, Search, MapPin, Music, Filter } from 'lucide-react'
import VenueForm from './VenueForm'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']
type VenueType = Venue['venue_type']

const VENUE_TYPES: VenueType[] = [
  'music_venue',
  'brewery', 
  'coffee_shop',
  'restaurant',
  'bar',
  'event_space',
  'amphitheater',
  'theater',
  'arena'
]

export default function AdminVenuesClient() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedType, setSelectedType] = useState<VenueType | 'all'>('all')
  const [showForm, setShowForm] = useState(false)
  const [editingVenue, setEditingVenue] = useState<Venue | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const itemsPerPage = 20

  useEffect(() => {
    fetchVenues()
  }, [currentPage, searchText, selectedType])

  const fetchVenues = async () => {
    try {
      setLoading(true)
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      let query = supabase
        .from('venues')
        .select('*', { count: 'exact' })
        .order('name', { ascending: true })
        .range(from, to)

      // Apply filters
      if (searchText.trim()) {
        const formattedQuery = searchText.trim().split(/\s+/).join(' & ')
        query = query.textSearch('fts', formattedQuery)
      }

      if (selectedType !== 'all') {
        query = query.eq('venue_type', selectedType)
      }

      const { data, error, count } = await query

      if (error) throw error
      
      setVenues(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching venues:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (venue: Venue) => {
    if (!confirm(`Are you sure you want to delete "${venue.name}"? This action cannot be undone.`)) {
      return
    }

    try {
      const { error } = await supabase
        .from('venues')
        .delete()
        .eq('id', venue.id)

      if (error) throw error

      // Refresh the list
      fetchVenues()
    } catch (error) {
      console.error('Error deleting venue:', error)
      alert('Error deleting venue. Please try again.')
    }
  }

  const handleEdit = (venue: Venue) => {
    setEditingVenue(venue)
    setShowForm(true)
  }

  const handleCreate = () => {
    setEditingVenue(null)
    setShowForm(true)
  }

  const handleFormClose = () => {
    setShowForm(false)
    setEditingVenue(null)
    fetchVenues() // Refresh the list
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          VENUES MANAGEMENT
        </h1>
        <p className="text-lg text-gray-600">
          Manage all venues in the BandSeeking platform
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search venues by name, city, or description..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Type Filter */}
          <div className="w-48 relative">
            <select
              value={selectedType}
              onChange={(e) => {
                setSelectedType(e.target.value as VenueType | 'all')
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors appearance-none bg-white"
            >
              <option value="all">All Types</option>
              {VENUE_TYPES.map(type => (
                <option key={type} value={type}>
                  {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>

          {/* Add Venue Button */}
          <button
            onClick={handleCreate}
            className="px-6 py-3 bg-green-400 border-2 border-black font-black text-black hover:bg-green-500 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            ADD VENUE
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {loading ? 'Loading venues...' : (
            <>
              Showing {venues.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} venues
              {(searchText || selectedType !== 'all') && (
                <span className="ml-2 text-gray-500">
                  (filtered)
                </span>
              )}
            </>
          )}
        </p>
      </div>

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
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Location</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Capacity</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black">
                {venues.map((venue, index) => (
                  <tr key={venue.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div>
                          <div className="text-sm font-black text-gray-900">
                            {venue.name}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {venue.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-black bg-blue-100 text-blue-800 border border-blue-300 rounded">
                        {venue.venue_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1" />
                        {venue.city}, {venue.state}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {venue.capacity ? venue.capacity.toLocaleString() : 'Not specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(venue)}
                          className="px-3 py-1 bg-yellow-300 border-2 border-black font-black text-xs hover:bg-yellow-400 transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(venue)}
                          className="px-3 py-1 bg-red-300 border-2 border-black font-black text-xs hover:bg-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
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
            <Music className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-black text-gray-900 mb-2">No venues found</h3>
            <p className="text-gray-600 mb-4">
              {searchText || selectedType !== 'all' 
                ? 'Try adjusting your filters or search terms' 
                : 'Get started by adding your first venue'}
            </p>
            <button
              onClick={handleCreate}
              className="px-6 py-2 bg-green-400 border-2 border-black font-black text-sm hover:bg-green-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              Add First Venue
            </button>
          </div>
        )}
      </div>

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

              <span className="px-4 py-2 font-black text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className={`px-4 py-2 font-black text-sm border-2 border-black transition-colors ${
                  currentPage >= totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-cyan-300'
                }`}
              >
                NEXT →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Venue Form Modal */}
      {showForm && (
        <VenueForm
          venue={editingVenue}
          onClose={handleFormClose}
        />
      )}
    </div>
  )
}