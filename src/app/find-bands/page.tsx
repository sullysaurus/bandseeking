'use client'

import { useState, useEffect } from 'react'
import { Search, Filter, Plus, Music } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import BandCard from '@/components/BandCard'
import ProtectedRoute from '@/components/ProtectedRoute'
import { bandService, Band } from '@/lib/bands'


export default function FindBands() {
  const [bands, setBands] = useState<Band[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  
  useEffect(() => {
    loadBands()
  }, [])
  
  const loadBands = async () => {
    setLoading(true)
    const data = await bandService.getAllBands()
    setBands(data)
    setLoading(false)
  }
  
  const filteredBands = bands.filter(band => {
    if (!searchTerm) return true
    const searchLower = searchTerm.toLowerCase()
    return (
      band.name.toLowerCase().includes(searchLower) ||
      band.description?.toLowerCase().includes(searchLower) ||
      band.genre?.toLowerCase().includes(searchLower) ||
      band.location?.toLowerCase().includes(searchLower) ||
      band.looking_for?.some(role => role.toLowerCase().includes(searchLower))
    )
  })
  
  const totalBands = filteredBands.length
  const recruitingBands = filteredBands.filter(b => b.status === 'recruiting').length

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        {/* Header */}
        <div className="mb-6 md:mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 md:gap-0 mb-4">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Find Bands</h1>
              <p className="text-secondary text-base md:text-lg">Discover bands looking for new members and explore the local music scene</p>
            </div>
            
            {/* Desktop controls */}
            <div className="hidden md:flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search bands..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-card border-0 rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal w-96"
                />
              </div>
              <button className="flex items-center gap-2 bg-card hover:bg-opacity-80 text-white px-4 py-3 rounded-lg transition-colors">
                <Filter className="w-5 h-5" />
                Filters
              </button>
              <Link 
                href="/bands/create"
                className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-white font-medium px-6 py-3 rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Start a Band
              </Link>
            </div>
            
            {/* Mobile search */}
            <div className="md:hidden">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input 
                  type="text" 
                  placeholder="Search bands..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="bg-card border-0 rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal w-full"
                />
              </div>
            </div>
          </div>
        </div>

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
                  description={band.description}
                  formed_year={band.formed_year}
                  looking_for={band.looking_for || []}
                  created_at={band.created_at}
                />
              ))}
            </div>
          )}
        </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}