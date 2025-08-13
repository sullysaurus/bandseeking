'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { MapPin, Calendar, Music, Globe, Instagram, Twitter, Youtube, Music2, Users, Plus, Check, ArrowLeft } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { bandService, Band, BandMember } from '@/lib/bands'
import { useAuth } from '@/contexts/AuthContext'

export default function BandProfilePage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const slug = params.slug as string

  const [band, setBand] = useState<Band | null>(null)
  const [members, setMembers] = useState<BandMember[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')

  useEffect(() => {
    if (slug) {
      loadBand()
    }
  }, [slug])

  const loadBand = async () => {
    setLoading(true)
    setError('')

    try {
      const bandData = await bandService.getBandBySlug(slug)
      
      if (!bandData) {
        setError('Band not found')
        return
      }

      setBand(bandData)

      // Load members
      const membersData = await bandService.getBandMembers(bandData.id)
      setMembers(membersData)

      // Check if user has already applied
      if (user) {
        const applications = await bandService.getBandApplications(bandData.id)
        const userApplication = applications.find(app => app.user_id === user.id)
        setHasApplied(!!userApplication)
      }

    } catch (err) {
      setError('Failed to load band')
      console.error('Error loading band:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user || !band || !applicationMessage.trim()) return

    setApplying(true)
    
    const application = await bandService.applyToBand(band.id, applicationMessage.trim())
    
    if (application) {
      setHasApplied(true)
      setShowApplicationModal(false)
      setApplicationMessage('')
      alert('Application sent successfully!')
    } else {
      alert('Failed to send application. Please try again.')
    }
    
    setApplying(false)
  }

  const openApplicationModal = () => {
    setApplicationMessage('')
    setShowApplicationModal(true)
  }

  const genreColors = {
    'Alternative Rock': 'bg-accent-purple',
    'Blues': 'bg-blue-500',
    'Metal': 'bg-red-500',
    'Jazz': 'bg-amber-500',
    'Folk': 'bg-emerald-500',
    'Indie': 'bg-pink-500',
    'Rock': 'bg-gray-500',
    'Pop': 'bg-purple-500',
    'Electronic': 'bg-cyan-500',
    'Hip Hop': 'bg-orange-500',
    'R&B': 'bg-rose-500',
    'Country': 'bg-yellow-500',
    'Punk': 'bg-red-600',
    'Reggae': 'bg-green-500',
    'Classical': 'bg-indigo-500'
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <div className="text-white">Loading band...</div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !band) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 mb-4">{error || 'Band not found'}</div>
              <button 
                onClick={() => router.back()}
                className="bg-accent-teal text-black px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
              >
                Go Back
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const isOwner = user?.id === band.owner_id
  const isMember = members.some(member => member.user_id === user?.id)
  const canApply = band.status === 'recruiting' && !isOwner && !isMember && !hasApplied
  const genreColor = genreColors[band.genre as keyof typeof genreColors] || 'bg-accent-purple'

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Back Button */}
            <button 
              onClick={() => router.back()}
              className="flex items-center gap-2 text-secondary hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Bands
            </button>

            {/* Band Header */}
            <div className="bg-card rounded-lg p-6 md:p-8 mb-6">
              <div className="flex flex-col md:flex-row gap-6">
                {/* Band Avatar */}
                <div className="w-24 h-24 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold text-2xl shrink-0">
                  {band.avatar_url ? (
                    <img 
                      src={band.avatar_url} 
                      alt={band.name} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    'B'
                  )}
                </div>

                {/* Band Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="min-w-0">
                      <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{band.name}</h1>
                      
                      <div className="flex flex-wrap items-center gap-3 mb-4">
                        {band.location && (
                          <div className="flex items-center gap-1 text-secondary">
                            <MapPin className="w-4 h-4" />
                            <span>{band.location}</span>
                          </div>
                        )}
                        
                        {band.formed_year && (
                          <div className="flex items-center gap-1 text-secondary">
                            <Calendar className="w-4 h-4" />
                            <span>Formed {band.formed_year}</span>
                          </div>
                        )}
                      </div>

                      {band.genre && (
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${genreColor} mb-4`}>
                          <Music className="w-4 h-4 mr-1" />
                          {band.genre}
                        </div>
                      )}
                    </div>

                    {/* Status & Action */}
                    <div className="flex items-center gap-3">
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
                        {band.status === 'recruiting' ? 'Recruiting' : band.status === 'complete' ? 'Complete' : 'On Hold'}
                      </div>

                      {isOwner ? (
                        <button
                          onClick={() => router.push(`/bands/${band.slug}/edit`)}
                          className="bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors"
                        >
                          Manage Band
                        </button>
                      ) : canApply ? (
                        <button
                          onClick={openApplicationModal}
                          className="bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Apply to Join
                        </button>
                      ) : hasApplied ? (
                        <button
                          disabled
                          className="bg-success text-white px-4 py-2 rounded-lg flex items-center gap-2"
                        >
                          <Check className="w-4 h-4" />
                          Applied
                        </button>
                      ) : null}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Band Description */}
            {band.description && (
              <div className="bg-card rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-white mb-4">About the Band</h2>
                <p className="text-secondary leading-relaxed">{band.description}</p>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Looking For */}
              {band.looking_for && band.looking_for.length > 0 && (
                <div className="lg:col-span-2 bg-card rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Looking For</h2>
                  <div className="flex flex-wrap gap-2">
                    {band.looking_for.map((role, index) => (
                      <span 
                        key={index}
                        className="bg-success/20 text-success px-3 py-1 rounded-full text-sm"
                      >
                        {role}
                      </span>
                    ))}
                  </div>
                  {band.status === 'recruiting' && (
                    <p className="text-accent-teal text-sm mt-3">
                      This band is actively recruiting for these positions
                    </p>
                  )}
                </div>
              )}

              {/* Band Stats */}
              <div className="bg-card rounded-lg p-6">
                <h2 className="text-xl font-semibold text-white mb-4">Band Stats</h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Members</span>
                    <span className="text-white font-semibold">{members.length}</span>
                  </div>
                  {band.formed_year && (
                    <div className="flex items-center justify-between">
                      <span className="text-secondary">Years Active</span>
                      <span className="text-white font-semibold">{new Date().getFullYear() - band.formed_year}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <span className="text-secondary">Open Positions</span>
                    <span className="text-white font-semibold">{band.looking_for?.length || 0}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Members */}
            {members.length > 0 && (
              <div className="bg-card rounded-lg p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-white">Members ({members.length})</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {members.map((member) => (
                    <div key={member.id} className="flex items-center gap-3 p-3 bg-background rounded-lg">
                      <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold">
                        U
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-medium">
                          User {member.user_id}
                          {member.user_id === band.owner_id && (
                            <span className="ml-2 text-xs bg-accent-purple px-2 py-1 rounded-full text-white">Owner</span>
                          )}
                        </div>
                        {member.role && (
                          <div className="text-sm text-secondary">{member.role}</div>
                        )}
                        <div className="text-xs text-medium">
                          Joined {new Date(member.joined_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Links */}
            {(band.website || band.instagram || band.twitter || band.youtube || band.spotify) && (
              <div className="bg-card rounded-lg p-6 mt-6">
                <h2 className="text-xl font-semibold text-white mb-4">Links</h2>
                <div className="flex flex-wrap gap-3">
                  {band.website && (
                    <a
                      href={band.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-background hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      Website
                    </a>
                  )}
                  {band.instagram && (
                    <a
                      href={`https://instagram.com/${band.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-background hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Instagram className="w-4 h-4" />
                      Instagram
                    </a>
                  )}
                  {band.twitter && (
                    <a
                      href={`https://twitter.com/${band.twitter.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-background hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Twitter className="w-4 h-4" />
                      Twitter
                    </a>
                  )}
                  {band.youtube && (
                    <a
                      href={band.youtube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-background hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Youtube className="w-4 h-4" />
                      YouTube
                    </a>
                  )}
                  {band.spotify && (
                    <a
                      href={band.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 bg-background hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                      <Music2 className="w-4 h-4" />
                      Spotify
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Application Modal */}
      {showApplicationModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-card rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-white mb-4">Apply to {band?.name}</h3>
            
            <div className="mb-4">
              <label className="block text-white mb-2">
                Tell them why you'd be a great fit
              </label>
              <textarea
                value={applicationMessage}
                onChange={(e) => setApplicationMessage(e.target.value)}
                rows={4}
                className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal resize-none"
                placeholder="Hi! I'm interested in joining your band. I play guitar and have been performing for 5 years..."
                maxLength={500}
              />
              <div className="text-xs text-medium mt-1">
                {applicationMessage.length}/500 characters
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowApplicationModal(false)}
                className="flex-1 bg-button-secondary hover:bg-opacity-80 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                disabled={applying || !applicationMessage.trim()}
                className="flex-1 bg-accent-teal hover:bg-opacity-90 text-black font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {applying ? 'Sending...' : 'Send Application'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ProtectedRoute>
  )
}