'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Music } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import BandCard from '@/components/BandCard'
import ProtectedRoute from '@/components/ProtectedRoute'
import FilterPanel, { FilterOptions } from '@/components/FilterPanel'
import { bandService, Band } from '@/lib/bands'
import MobilePageHeader from '@/components/MobilePageHeader'


export default function FindBands() {
  const [bands, setBands] = useState<Band[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [filters, setFilters] = useState<FilterOptions>({
    instruments: [],
    genres: [],
    bandTypes: [],
    lookingFor: [],
    location: '',
    status: 'all'
  })
  
  useEffect(() => {
    loadBands()
  }, [])
  
  const loadBands = async () => {
    setLoading(true)
    const data = await bandService.getAllBands()
    setBands(data)
    setLoading(false)
  }
  
  const applyFilters = (band: Band): boolean => {
    // Search term filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const matchesSearch = (
        band.name.toLowerCase().includes(searchLower) ||
        band.description?.toLowerCase().includes(searchLower) ||
        band.genre?.toLowerCase().includes(searchLower) ||
        band.band_type?.toLowerCase().includes(searchLower) ||
        band.location?.toLowerCase().includes(searchLower) ||
        band.looking_for?.some(role => role.toLowerCase().includes(searchLower))
      )
      if (!matchesSearch) return false
    }

    // Location filter
    if (filters.location && filters.location.trim()) {
      if (!band.location || !band.location.toLowerCase().includes(filters.location.toLowerCase())) {
        return false
      }
    }

    // Genre filter (using single genre field for bands)
    if (filters.genres?.length && band.genre) {
      const hasMatchingGenre = filters.genres.some(filterGenre =>
        band.genre?.toLowerCase().includes(filterGenre.toLowerCase())
      )
      if (!hasMatchingGenre) return false
    }

    // Band type filter
    if (filters.bandTypes?.length && band.band_type) {
      const hasMatchingBandType = filters.bandTypes.some(filterType =>
        band.band_type?.toLowerCase().includes(filterType.toLowerCase())
      )
      if (!hasMatchingBandType) return false
    }

    // Looking for filter (instruments/roles they need)
    if (filters.lookingFor?.length) {
      const hasMatchingRole = filters.lookingFor.some(filterRole =>
        band.looking_for?.some(bandRole =>
          bandRole.toLowerCase().includes(filterRole.toLowerCase())
        )
      )
      if (!hasMatchingRole) return false
    }

    // Status filter
    if (filters.status && filters.status !== 'all') {
      if (band.status !== filters.status) return false
    }

    return true
  }
  
  const filteredBands = bands.filter(applyFilters)
  const totalBands = filteredBands.length
  const recruitingBands = filteredBands.filter(b => b.status === 'recruiting').length

  const getActiveFilterCount = () => {
    let count = 0
    if (filters.genres?.length) count += filters.genres.length
    if (filters.lookingFor?.length) count += filters.lookingFor.length
    if (filters.location) count++
    if (filters.status && filters.status !== 'all') count++
    return count
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 pb-24 md:pb-8">
          {/* Header */}
          <div className="p-4 md:p-8 pt-6 md:pt-12 pb-6 md:pb-8">
            <div className="flex flex-col gap-3 mb-3">
              <MobilePageHeader 
                title="Find Bands"
                subtitle="Discover bands looking for new members and explore the local music scene"
              />
              
              {/* Desktop controls */}
              <div className="hidden md:flex items-center gap-3 flex-shrink-0">
                <Link 
                  href="/bands/create"
                  className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-3 rounded-lg transition-colors whitespace-nowrap"
                >
                  <Plus className="w-5 h-5" />
                  Start a Band
                </Link>
              </div>
              
              {/* Desktop search and filters row */}
              <div className="hidden md:flex items-center gap-4">
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                  <input 
                    type="text" 
                    placeholder="Search bands..." 
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
              <div className="md:hidden space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-4 h-4" />
                    <input 
                      type="text" 
                      placeholder="Search bands..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-card border-0 rounded-lg pl-10 pr-3 py-2.5 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal w-full text-sm"
                    />
                  </div>
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className="flex items-center justify-center gap-1 bg-card hover:bg-opacity-80 text-white px-3 py-2.5 rounded-lg transition-colors relative min-w-[80px]"
                  >
                    <Filter className="w-4 h-4" />
                    <span className="text-sm">Filters</span>
                    {getActiveFilterCount() > 0 && (
                      <span className="absolute -top-1 -right-1 bg-accent-teal text-black text-xs rounded-full w-4 h-4 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </span>
                    )}
                  </button>
                </div>
                <Link 
                  href="/bands/create"
                  className="flex items-center justify-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2.5 rounded-lg transition-colors w-full"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-sm">Start a Band</span>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Main Content */}
          <div className="p-4 md:p-8 pt-0">
            {/* All Bands Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center">
                  <div className="w-4 h-4 bg-black rounded" />
                </div>
                <h2 className="text-2xl font-bold text-white">All Bands</h2>
                <span className="text-medium">({totalBands} bands)</span>
              </div>

              {/* Band Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-white">Loading bands...</div>
                </div>
              ) : filteredBands.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-medium mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {searchTerm ? 'No bands found' : 'No bands yet'}
                  </h3>
                  <p className="text-secondary">
                    {searchTerm ? 'Try adjusting your search terms' : 'Be the first to create a band!'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {filteredBands.map((band) => (
                    <BandCard 
                      key={band.id} 
                      id={band.id}
                      name={band.name}
                      slug={band.slug}
                      location={band.location}
                      status={band.status}
                      genre={band.genre}
                      band_type={band.band_type}
                      description={band.description}
                      formed_year={band.formed_year}
                      looking_for={band.looking_for || []}
                      created_at={band.created_at}
                      avatar_url={band.avatar_url}
                      member_count={band.member_count}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <FilterPanel
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        filters={filters}
        onFiltersChange={setFilters}
        type="bands"
      />
    </ProtectedRoute>
  )
}