'use client'

import { useState, useEffect } from 'react'
import { Briefcase, Search, Filter, MapPin, Calendar, DollarSign, Clock, Eye, Users, Plus, Bookmark, BookmarkCheck } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { opportunityService, Opportunity } from '@/lib/opportunities'
import { MUSIC_GENRES, COMMON_INSTRUMENTS } from '@/lib/constants/music'

type TabType = 'browse' | 'saved' | 'mine'
type OpportunityType = 'all' | 'gig' | 'session' | 'audition' | 'collaboration' | 'teaching' | 'recording' | 'other'

export default function OpportunitiesPage() {
  const [activeTab, setActiveTab] = useState<TabType>('browse')
  const [opportunities, setOpportunities] = useState<Opportunity[]>([])
  const [savedOpportunities, setSavedOpportunities] = useState<Opportunity[]>([])
  const [myOpportunities, setMyOpportunities] = useState<Opportunity[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [showExpired, setShowExpired] = useState(false)
  const [filters, setFilters] = useState({
    type: 'all' as OpportunityType,
    is_paid: undefined as boolean | undefined,
    is_remote: undefined as boolean | undefined,
    genres: [] as string[],
    instruments: [] as string[]
  })

  useEffect(() => {
    loadOpportunities()
  }, [activeTab, filters, searchTerm, showExpired])

  const loadOpportunities = async () => {
    setLoading(true)
    try {
      if (activeTab === 'browse') {
        const data = await opportunityService.getOpportunities({
          ...filters,
          type: filters.type === 'all' ? undefined : filters.type,
          search: searchTerm || undefined
        })
        setOpportunities(data)
      } else if (activeTab === 'saved') {
        const data = await opportunityService.getSavedOpportunities()
        setSavedOpportunities(data)
      } else if (activeTab === 'mine') {
        const data = await opportunityService.getMyOpportunities()
        setMyOpportunities(data)
      }
    } catch (error) {
      console.error('Error loading opportunities:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSaveToggle = async (opportunityId: string, isSaved: boolean) => {
    if (isSaved) {
      await opportunityService.unsaveOpportunity(opportunityId)
    } else {
      await opportunityService.saveOpportunity(opportunityId)
    }
    loadOpportunities()
  }

  const filterExpiredOpportunities = (opportunities: Opportunity[]) => {
    if (showExpired) {
      return opportunities
    }
    
    return opportunities.filter(opportunity => {
      const isExpired = opportunity.deadline && new Date(opportunity.deadline) < new Date()
      return !isExpired
    })
  }

  const getActiveData = () => {
    let data: Opportunity[] = []
    
    switch (activeTab) {
      case 'browse':
        data = opportunities
        break
      case 'saved':
        data = savedOpportunities
        break
      case 'mine':
        data = myOpportunities
        break
      default:
        data = []
    }
    
    return filterExpiredOpportunities(data)
  }

  const getFilteredCounts = () => {
    let data: Opportunity[] = []
    
    switch (activeTab) {
      case 'browse':
        data = opportunities
        break
      case 'saved':
        data = savedOpportunities
        break
      case 'mine':
        data = myOpportunities
        break
      default:
        data = []
    }
    
    const total = data.length
    const expired = data.filter(opportunity => {
      const isExpired = opportunity.deadline && new Date(opportunity.deadline) < new Date()
      return isExpired
    }).length
    
    return { total, expired, active: total - expired }
  }

  const activeData = getActiveData()
  const counts = getFilteredCounts()

  const OpportunityCard = ({ opportunity, showSaveButton = true }: { opportunity: Opportunity; showSaveButton?: boolean }) => {
    const [isSaved, setIsSaved] = useState(false)

    useEffect(() => {
      if (showSaveButton) {
        opportunityService.isOpportunitySaved(opportunity.id).then(setIsSaved)
      }
    }, [opportunity.id, showSaveButton])

    const typeColors = {
      gig: 'bg-accent-teal/20 text-accent-teal',
      session: 'bg-accent-purple/20 text-accent-purple',
      audition: 'bg-success/20 text-success',
      collaboration: 'bg-blue-500/20 text-blue-400',
      teaching: 'bg-orange-500/20 text-orange-400',
      recording: 'bg-pink-500/20 text-pink-400',
      other: 'bg-gray-500/20 text-gray-400'
    }

    const isExpired = opportunity.deadline && new Date(opportunity.deadline) < new Date()
    const isUpcoming = opportunity.date_time && new Date(opportunity.date_time) > new Date()

    return (
      <div className={`bg-card rounded-lg p-6 hover:bg-opacity-80 transition-colors ${isExpired ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <span className={`px-2 py-1 rounded text-xs font-medium ${typeColors[opportunity.type]}`}>
                {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
              </span>
              {opportunity.is_paid && (
                <span className="bg-success/20 text-success px-2 py-1 rounded text-xs font-medium">
                  Paid
                </span>
              )}
              {opportunity.is_remote && (
                <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded text-xs font-medium">
                  Remote
                </span>
              )}
              {isExpired && (
                <span className="bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs font-medium">
                  Expired
                </span>
              )}
            </div>
            
            <Link 
              href={`/opportunities/${opportunity.id}`}
              className="text-lg font-semibold text-white hover:text-accent-teal transition-colors block mb-2"
            >
              {opportunity.title}
            </Link>

            <p className="text-secondary text-sm line-clamp-2 mb-3">
              {opportunity.description}
            </p>

            {/* Meta info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-medium mb-3">
              {opportunity.location && (
                <div className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {opportunity.location}
                </div>
              )}
              
              {opportunity.date_time && (
                <div className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(opportunity.date_time).toLocaleDateString()}
                </div>
              )}

              {opportunity.payment_amount && (
                <div className="flex items-center gap-1">
                  <DollarSign className="w-3 h-3" />
                  {opportunity.payment_amount}
                </div>
              )}

              {opportunity.deadline && (
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Apply by {new Date(opportunity.deadline).toLocaleDateString()}
                </div>
              )}
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1 mb-3">
              {opportunity.genres.slice(0, 3).map((genre) => (
                <span key={genre} className="bg-accent-purple/20 text-accent-purple px-2 py-0.5 rounded text-xs">
                  {genre}
                </span>
              ))}
              {opportunity.instruments_needed.slice(0, 3).map((instrument) => (
                <span key={instrument} className="bg-accent-teal/20 text-accent-teal px-2 py-0.5 rounded text-xs">
                  {instrument}
                </span>
              ))}
            </div>

            {/* Creator info */}
            <div className="flex items-center gap-2 text-sm">
              {opportunity.creator_avatar ? (
                <img 
                  src={opportunity.creator_avatar} 
                  alt={opportunity.creator_name || ''} 
                  className="w-6 h-6 rounded-full"
                />
              ) : (
                <div className="w-6 h-6 bg-button-secondary rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">
                    {(opportunity.creator_name || opportunity.creator_username || 'U').charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <Link 
                href={`/profile/${opportunity.creator_username}`}
                className="text-secondary hover:text-white transition-colors"
              >
                {opportunity.creator_name || opportunity.creator_username}
              </Link>
              <span className="text-medium">•</span>
              <div className="flex items-center gap-1 text-medium">
                <Eye className="w-3 h-3" />
                {opportunity.views_count}
              </div>
              {opportunity.application_count !== undefined && (
                <>
                  <span className="text-medium">•</span>
                  <div className="flex items-center gap-1 text-medium">
                    <Users className="w-3 h-3" />
                    {opportunity.application_count} applied
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          {showSaveButton && activeTab !== 'mine' && (
            <button
              onClick={() => handleSaveToggle(opportunity.id, isSaved)}
              className="ml-4 p-2 hover:bg-background rounded-lg transition-colors"
            >
              {isSaved ? (
                <BookmarkCheck className="w-5 h-5 text-accent-teal" />
              ) : (
                <Bookmark className="w-5 h-5 text-medium hover:text-accent-teal" />
              )}
            </button>
          )}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-card">
          <span className="text-xs text-medium">
            Posted {new Date(opportunity.created_at).toLocaleDateString()}
          </span>
          
          <div className="flex gap-2">
            {activeTab === 'mine' ? (
              <>
                <Link
                  href={`/opportunities/${opportunity.id}/edit`}
                  className="text-accent-teal hover:text-opacity-80 text-sm font-medium transition-colors"
                >
                  Edit
                </Link>
                <Link
                  href={`/opportunities/${opportunity.id}/applications`}
                  className="text-secondary hover:text-white text-sm font-medium transition-colors"
                >
                  View Applications
                </Link>
              </>
            ) : (
              <Link
                href={`/opportunities/${opportunity.id}`}
                className="bg-accent-teal hover:bg-opacity-90 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                View Details
              </Link>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div>
              <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">Opportunities</h1>
              <p className="text-secondary">Find gigs, sessions, and collaborations</p>
            </div>
            
            <Link
              href="/opportunities/create"
              className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Post Opportunity
            </Link>
          </div>

          {/* Tabs */}
          <div className="flex gap-4 mb-6 border-b border-card">
            <button
              onClick={() => setActiveTab('browse')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'browse'
                  ? 'text-white border-b-2 border-accent-teal'
                  : 'text-secondary hover:text-white'
              }`}
            >
              Browse All
            </button>
            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'saved'
                  ? 'text-white border-b-2 border-accent-teal'
                  : 'text-secondary hover:text-white'
              }`}
            >
              Saved ({savedOpportunities.length})
            </button>
            <button
              onClick={() => setActiveTab('mine')}
              className={`pb-3 px-1 font-medium transition-colors ${
                activeTab === 'mine'
                  ? 'text-white border-b-2 border-accent-teal'
                  : 'text-secondary hover:text-white'
              }`}
            >
              My Posts ({myOpportunities.length})
            </button>
          </div>

          {/* Search and Filters */}
          {activeTab === 'browse' && (
            <div className="space-y-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medium w-5 h-5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search opportunities..."
                  className="w-full bg-card border border-card rounded-lg pl-12 pr-4 py-3 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                />
              </div>

              {/* Filter Toggle */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-secondary hover:text-white transition-colors"
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>
                
                {/* Show Expired Toggle */}
                <label className="flex items-center gap-2 text-secondary hover:text-white transition-colors cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showExpired}
                    onChange={(e) => setShowExpired(e.target.checked)}
                    className="w-4 h-4 rounded border border-card bg-background text-accent-teal focus:ring-accent-teal focus:ring-2"
                  />
                  <span className="text-sm">Show expired</span>
                </label>
              </div>

              {/* Expired Filter Info */}
              {!showExpired && counts.expired > 0 && (
                <div className="text-sm text-medium">
                  <span>{counts.expired} expired opportunity{counts.expired === 1 ? '' : 's'} hidden</span>
                </div>
              )}

              {/* Filters */}
              {showFilters && (
                <div className="bg-card rounded-lg p-4 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Type */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Type</label>
                      <select
                        value={filters.type}
                        onChange={(e) => setFilters({ ...filters, type: e.target.value as OpportunityType })}
                        className="w-full bg-background border border-card rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      >
                        <option value="all">All Types</option>
                        <option value="gig">Gigs</option>
                        <option value="session">Sessions</option>
                        <option value="audition">Auditions</option>
                        <option value="collaboration">Collaborations</option>
                        <option value="teaching">Teaching</option>
                        <option value="recording">Recording</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    {/* Payment */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Payment</label>
                      <select
                        value={filters.is_paid === undefined ? 'any' : filters.is_paid ? 'paid' : 'unpaid'}
                        onChange={(e) => {
                          const value = e.target.value === 'any' ? undefined : e.target.value === 'paid'
                          setFilters({ ...filters, is_paid: value })
                        }}
                        className="w-full bg-background border border-card rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      >
                        <option value="any">Any</option>
                        <option value="paid">Paid Only</option>
                        <option value="unpaid">Unpaid Only</option>
                      </select>
                    </div>

                    {/* Location */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Location</label>
                      <select
                        value={filters.is_remote === undefined ? 'any' : filters.is_remote ? 'remote' : 'in_person'}
                        onChange={(e) => {
                          const value = e.target.value === 'any' ? undefined : e.target.value === 'remote'
                          setFilters({ ...filters, is_remote: value })
                        }}
                        className="w-full bg-background border border-card rounded px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      >
                        <option value="any">Any</option>
                        <option value="remote">Remote Only</option>
                        <option value="in_person">In-Person Only</option>
                      </select>
                    </div>

                    {/* Clear Filters */}
                    <div className="flex items-end">
                      <button
                        onClick={() => setFilters({
                          type: 'all',
                          is_paid: undefined,
                          is_remote: undefined,
                          genres: [],
                          instruments: []
                        })}
                        className="w-full bg-button-secondary hover:bg-opacity-80 text-white px-3 py-2 rounded transition-colors"
                      >
                        Clear Filters
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="text-center py-12">
              <p className="text-secondary">Loading opportunities...</p>
            </div>
          ) : activeData.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {activeData.map((opportunity) => (
                <OpportunityCard 
                  key={opportunity.id} 
                  opportunity={opportunity}
                  showSaveButton={activeTab === 'browse'}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-card rounded-lg">
              <Briefcase className="w-12 h-12 text-medium mx-auto mb-4" />
              <p className="text-white font-medium mb-2">
                {activeTab === 'browse' && 'No opportunities found'}
                {activeTab === 'saved' && 'No saved opportunities'}
                {activeTab === 'mine' && 'No opportunities posted'}
              </p>
              <p className="text-secondary text-sm mb-4">
                {activeTab === 'browse' && 'Try adjusting your filters or check back later'}
                {activeTab === 'saved' && 'Save opportunities you\'re interested in to view them here'}
                {activeTab === 'mine' && 'Start by posting your first opportunity'}
              </p>
              {(activeTab === 'browse' || activeTab === 'mine') && (
                <Link
                  href="/opportunities/create"
                  className="inline-flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Post Opportunity
                </Link>
              )}
            </div>
          )}
        </main>
      </div>
    </ProtectedRoute>
  )
}