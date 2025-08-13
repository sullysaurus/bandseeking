'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Users, Calendar, MapPin, Music, Settings, Eye, Trash2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { bandService, Band } from '@/lib/bands'
import { useAuth } from '@/contexts/AuthContext'

export default function MyBandsPage() {
  const { user } = useAuth()
  const [ownedBands, setOwnedBands] = useState<Band[]>([])
  const [memberBands, setMemberBands] = useState<Band[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (user) {
      loadBands()
    }
  }, [user])

  const loadBands = async () => {
    setLoading(true)
    setError('')
    
    try {
      const [owned, member] = await Promise.all([
        bandService.getMyBands(),
        bandService.getBandsAsMember()
      ])
      
      setOwnedBands(owned)
      setMemberBands(member)
    } catch (err: any) {
      // Handle database migration not applied yet
      if (err?.code === '42P01') {
        setError('Database not set up yet. Please run migrations when Docker is available.')
      } else {
        setError('Failed to load bands')
      }
      console.error('Error loading bands:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteBand = async (bandId: string, bandName: string) => {
    if (!confirm(`Are you sure you want to delete "${bandName}"? This action cannot be undone.`)) {
      return
    }

    const success = await bandService.deleteBand(bandId)
    if (success) {
      setOwnedBands(prev => prev.filter(band => band.id !== bandId))
    } else {
      alert('Failed to delete band. Please try again.')
    }
  }

  const BandCard = ({ band, isOwner = false }: { band: Band; isOwner?: boolean }) => (
    <div className="bg-card rounded-lg p-6 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-xl font-semibold text-white truncate">{band.name}</h3>
          <div className="flex items-center gap-4 text-sm text-secondary mt-1">
            {band.location && (
              <div className="flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                <span>{band.location}</span>
              </div>
            )}
            {band.formed_year && (
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>Est. {band.formed_year}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          band.status === 'recruiting' 
            ? 'bg-success/20 text-success' 
            : band.status === 'complete'
            ? 'bg-complete/20 text-complete'
            : 'bg-orange-500/20 text-orange-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            band.status === 'recruiting' 
              ? 'bg-success' 
              : band.status === 'complete'
              ? 'bg-complete'
              : 'bg-orange-400'
          }`} />
          {band.status === 'recruiting' ? 'Recruiting' : 
           band.status === 'complete' ? 'Complete' : 
           'On Hold'}
        </div>
      </div>

      {/* Genre */}
      {band.genre && (
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent-purple/20 text-accent-purple text-sm">
          <Music className="w-4 h-4 mr-1" />
          {band.genre}
        </div>
      )}

      {/* Description */}
      {band.description && (
        <p className="text-secondary text-sm leading-relaxed line-clamp-2">
          {band.description}
        </p>
      )}

      {/* Looking For */}
      {band.looking_for && band.looking_for.length > 0 && (
        <div>
          <div className="text-white text-sm font-medium mb-2">Looking for</div>
          <div className="flex flex-wrap gap-1">
            {band.looking_for.slice(0, 3).map((item) => (
              <span 
                key={item}
                className="bg-success/20 text-success px-2 py-1 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
            {band.looking_for.length > 3 && (
              <span className="text-medium text-xs px-2 py-1">
                +{band.looking_for.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Link
          href={`/bands/${band.slug}`}
          className="flex-1 bg-button-secondary hover:bg-opacity-80 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
        >
          <Eye className="w-4 h-4" />
          View
        </Link>
        {isOwner && (
          <>
            <Link
              href={`/bands/${band.slug}/edit`}
              className="flex-1 bg-accent-teal hover:bg-opacity-90 text-black font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Settings className="w-4 h-4" />
              Manage
            </Link>
            <button
              onClick={() => handleDeleteBand(band.id, band.name)}
              className="bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors flex items-center justify-center"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
    </div>
  )

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <div className="text-white">Loading your bands...</div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white mb-2">My Bands</h1>
                <p className="text-secondary">Manage your bands and collaborations</p>
              </div>
              <Link
                href="/bands/create"
                className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="w-4 h-4" />
                Start a Band
              </Link>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Owned Bands Section */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 bg-accent-teal rounded-lg flex items-center justify-center">
                  <Settings className="w-4 h-4 text-black" />
                </div>
                <h2 className="text-xl md:text-2xl font-bold text-white">Bands I Own</h2>
                <span className="text-medium">({ownedBands.length} bands)</span>
              </div>

              {ownedBands.length === 0 ? (
                <div className="bg-card rounded-lg p-8 text-center">
                  <Music className="w-12 h-12 text-medium mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No bands yet</h3>
                  <p className="text-secondary mb-4">Create your first band and start recruiting musicians</p>
                  <Link
                    href="/bands/create"
                    className="inline-flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-6 py-3 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Start a Band
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {ownedBands.map((band) => (
                    <BandCard key={band.id} band={band} isOwner={true} />
                  ))}
                </div>
              )}
            </div>

            {/* Member Bands Section */}
            {memberBands.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-accent-purple rounded-lg flex items-center justify-center">
                    <Users className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-white">Bands I'm In</h2>
                  <span className="text-medium">({memberBands.length} bands)</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {memberBands.map((band) => (
                    <BandCard key={band.id} band={band} isOwner={false} />
                  ))}
                </div>
              </div>
            )}

            {/* Stats Section */}
            {(ownedBands.length > 0 || memberBands.length > 0) && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-white">{ownedBands.length}</div>
                  <div className="text-sm text-medium">Owned</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent-purple">{memberBands.length}</div>
                  <div className="text-sm text-medium">Member</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-success">
                    {ownedBands.filter(b => b.status === 'recruiting').length}
                  </div>
                  <div className="text-sm text-medium">Recruiting</div>
                </div>
                <div className="bg-card rounded-lg p-4 text-center">
                  <div className="text-2xl font-bold text-accent-teal">
                    {ownedBands.reduce((sum, band) => sum + (band.looking_for?.length || 0), 0)}
                  </div>
                  <div className="text-sm text-medium">Open Roles</div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}