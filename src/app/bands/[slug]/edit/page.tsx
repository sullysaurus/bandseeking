'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Music, MapPin, Calendar, Globe, Instagram, Twitter, Youtube, Music2, Plus, X, Users, Mail, Trash2 } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import AvatarUpload from '@/components/AvatarUpload'
import { bandService, Band, BandUpdate, BandMember, BandApplication } from '@/lib/bands'
import { profileService } from '@/lib/profiles'
import { useAuth } from '@/contexts/AuthContext'

const genres = [
  'Rock', 'Alternative Rock', 'Indie', 'Pop', 'Electronic', 
  'Hip Hop', 'R&B', 'Jazz', 'Blues', 'Country', 
  'Folk', 'Metal', 'Punk', 'Reggae', 'Classical',
  'Experimental', 'Funk', 'Soul', 'Gospel', 'Latin'
]

const instruments = [
  'Guitar', 'Bass', 'Drums', 'Vocals', 'Keyboard',
  'Piano', 'Saxophone', 'Trumpet', 'Violin', 'Cello',
  'Producer', 'DJ', 'Percussion', 'Harmonica', 'Flute'
]

export default function EditBandPage() {
  const router = useRouter()
  const params = useParams()
  const { user } = useAuth()
  const slug = params.slug as string

  const [band, setBand] = useState<Band | null>(null)
  const [members, setMembers] = useState<BandMember[]>([])
  const [applications, setApplications] = useState<BandApplication[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState<'details' | 'members' | 'applications'>('details')

  const [bandData, setBandData] = useState<BandUpdate>({
    name: '',
    description: '',
    location: '',
    genre: '',
    status: 'recruiting',
    formed_year: new Date().getFullYear(),
    website: '',
    instagram: '',
    twitter: '',
    youtube: '',
    spotify: '',
    looking_for: []
  })

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

      // Check if user owns this band
      if (bandData.owner_id !== user?.id) {
        setError('You are not authorized to edit this band')
        return
      }

      setBand(bandData)
      setBandData({
        name: bandData.name,
        description: bandData.description || '',
        location: bandData.location || '',
        genre: bandData.genre || '',
        status: bandData.status,
        formed_year: bandData.formed_year || new Date().getFullYear(),
        website: bandData.website || '',
        instagram: bandData.instagram || '',
        twitter: bandData.twitter || '',
        youtube: bandData.youtube || '',
        spotify: bandData.spotify || '',
        looking_for: bandData.looking_for || []
      })

      // Load members and applications
      const [membersData, applicationsData] = await Promise.all([
        bandService.getBandMembers(bandData.id),
        bandService.getBandApplications(bandData.id)
      ])
      
      setMembers(membersData)
      setApplications(applicationsData)

    } catch (err) {
      setError('Failed to load band')
      console.error('Error loading band:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setBandData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleLookingForToggle = (instrument: string) => {
    setBandData(prev => ({
      ...prev,
      looking_for: prev.looking_for?.includes(instrument)
        ? prev.looking_for.filter(i => i !== instrument)
        : [...(prev.looking_for || []), instrument]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!band || !bandData.name) {
      setError('Band name is required')
      return
    }

    setSaving(true)
    setError('')

    const updatedBand = await bandService.updateBand(band.id, bandData)
    
    if (updatedBand) {
      setBand(updatedBand)
      alert('Band updated successfully!')
    } else {
      setError('Failed to update band. Please try again.')
    }

    setSaving(false)
  }

  const handleAvatarChange = (newAvatarUrl: string | null) => {
    if (band) {
      setBand(prev => prev ? { ...prev, avatar_url: newAvatarUrl } : null)
    }
  }

  const handleRemoveMember = async (memberId: string, userId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return

    const success = await bandService.removeMember(band!.id, userId)
    if (success) {
      setMembers(prev => prev.filter(m => m.id !== memberId))
    } else {
      alert('Failed to remove member')
    }
  }

  const handleApplicationStatus = async (applicationId: string, status: 'accepted' | 'rejected') => {
    const success = await bandService.updateApplicationStatus(applicationId, status)
    if (success) {
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId ? { ...app, status } : app
        )
      )
      if (status === 'accepted') {
        // Reload members to show the new member
        const updatedMembers = await bandService.getBandMembers(band!.id)
        setMembers(updatedMembers)
      }
    } else {
      alert(`Failed to ${status === 'accepted' ? 'accept' : 'reject'} application`)
    }
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

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white">Manage Band</h1>
                <p className="text-secondary">Edit your band details, members, and applications</p>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-card rounded-lg p-1">
              {[
                { key: 'details', label: 'Band Details', icon: Music },
                { key: 'members', label: 'Members', icon: Users, count: members.length },
                { key: 'applications', label: 'Applications', icon: Mail, count: applications.filter(a => a.status === 'pending').length }
              ].map(({ key, label, icon: Icon, count }) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key as any)}
                  className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md transition-colors ${
                    activeTab === key
                      ? 'bg-accent-teal text-black'
                      : 'text-secondary hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                  {count !== undefined && count > 0 && (
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      activeTab === key
                        ? 'bg-black/20 text-black'
                        : 'bg-accent-teal text-black'
                    }`}>
                      {count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            {/* Tab Content */}
            {activeTab === 'details' && (
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Avatar Section */}
                <div className="bg-card rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Band Avatar</h2>
                  <div className="flex items-start gap-6">
                    <AvatarUpload
                      currentAvatarUrl={band.avatar_url}
                      onAvatarChange={handleAvatarChange}
                      size="large"
                      editable={true}
                      type="band"
                      entityId={band.id}
                    />
                    <div className="flex-1">
                      <p className="text-secondary text-sm">
                        Upload an image to represent your band. This will be shown on your band profile and in search results.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Basic Information */}
                <div className="bg-card rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                  
                  <div>
                    <label className="block text-white mb-2">
                      Band Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={bandData.name}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      placeholder="Enter your band name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">Description</label>
                    <textarea
                      name="description"
                      value={bandData.description}
                      onChange={handleInputChange}
                      rows={4}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal resize-none"
                      placeholder="Tell us about your band, your music style, and what you're looking for..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">
                        <MapPin className="inline w-4 h-4 mr-1" />
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        value={bandData.location}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="City, State"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">
                        <Music className="inline w-4 h-4 mr-1" />
                        Genre
                      </label>
                      <select
                        name="genre"
                        value={bandData.genre}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      >
                        <option value="">Select a genre</option>
                        {genres.map(genre => (
                          <option key={genre} value={genre}>{genre}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-white mb-2">
                        <Calendar className="inline w-4 h-4 mr-1" />
                        Year Formed
                      </label>
                      <input
                        type="number"
                        name="formed_year"
                        value={bandData.formed_year}
                        onChange={handleInputChange}
                        min="1900"
                        max={new Date().getFullYear()}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">Band Status</label>
                      <select
                        name="status"
                        value={bandData.status}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      >
                        <option value="recruiting">Recruiting Members</option>
                        <option value="complete">Complete</option>
                        <option value="on_hold">On Hold</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Looking For */}
                <div className="bg-card rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Looking For</h2>
                  <p className="text-secondary mb-4">Select the instruments/roles you're looking for</p>
                  
                  <div className="flex flex-wrap gap-2">
                    {instruments.map(instrument => (
                      <button
                        key={instrument}
                        type="button"
                        onClick={() => handleLookingForToggle(instrument)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          bandData.looking_for?.includes(instrument)
                            ? 'bg-accent-teal text-black'
                            : 'bg-background text-secondary hover:text-white border border-border'
                        }`}
                      >
                        {bandData.looking_for?.includes(instrument) ? (
                          <X className="inline w-3 h-3 mr-1" />
                        ) : (
                          <Plus className="inline w-3 h-3 mr-1" />
                        )}
                        {instrument}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Links */}
                <div className="bg-card rounded-lg p-6 space-y-4">
                  <h2 className="text-xl font-semibold text-white mb-4">Social Links</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-white mb-2">
                        <Globe className="inline w-4 h-4 mr-1" />
                        Website
                      </label>
                      <input
                        type="url"
                        name="website"
                        value={bandData.website}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="https://yourband.com"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">
                        <Instagram className="inline w-4 h-4 mr-1" />
                        Instagram
                      </label>
                      <input
                        type="text"
                        name="instagram"
                        value={bandData.instagram}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="@yourband"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">
                        <Twitter className="inline w-4 h-4 mr-1" />
                        Twitter
                      </label>
                      <input
                        type="text"
                        name="twitter"
                        value={bandData.twitter}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="@yourband"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">
                        <Youtube className="inline w-4 h-4 mr-1" />
                        YouTube
                      </label>
                      <input
                        type="text"
                        name="youtube"
                        value={bandData.youtube}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="youtube.com/c/yourband"
                      />
                    </div>

                    <div>
                      <label className="block text-white mb-2">
                        <Music2 className="inline w-4 h-4 mr-1" />
                        Spotify
                      </label>
                      <input
                        type="text"
                        name="spotify"
                        value={bandData.spotify}
                        onChange={handleInputChange}
                        className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="open.spotify.com/artist/..."
                      />
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-6 py-3 bg-button-secondary text-white rounded-lg hover:bg-opacity-80 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-accent-teal text-black font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            )}

            {/* Members Tab */}
            {activeTab === 'members' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">Band Members ({members.length})</h2>
                  </div>

                  {members.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="w-12 h-12 text-medium mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No members yet</h3>
                      <p className="text-secondary">Members will appear here when they join your band</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold">
                              U
                            </div>
                            <div>
                              <div className="text-white font-medium">User {member.user_id}</div>
                              {member.role && (
                                <div className="text-sm text-secondary">{member.role}</div>
                              )}
                              <div className="text-xs text-medium">
                                Joined {new Date(member.joined_at).toLocaleDateString()}
                              </div>
                            </div>
                          </div>
                          
                          {member.user_id !== band.owner_id && (
                            <button
                              onClick={() => handleRemoveMember(member.id, member.user_id)}
                              className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Applications Tab */}
            {activeTab === 'applications' && (
              <div className="space-y-6">
                <div className="bg-card rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold text-white">
                      Applications ({applications.filter(a => a.status === 'pending').length} pending)
                    </h2>
                  </div>

                  {applications.length === 0 ? (
                    <div className="text-center py-8">
                      <Mail className="w-12 h-12 text-medium mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-white mb-2">No applications yet</h3>
                      <p className="text-secondary">Applications from musicians will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {applications.map((application) => (
                        <div key={application.id} className="p-4 bg-background rounded-lg">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold">
                                U
                              </div>
                              <div>
                                <div className="text-white font-medium">User {application.user_id}</div>
                                <div className="text-xs text-medium">
                                  Applied {new Date(application.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            
                            <div className={`px-3 py-1 rounded-full text-sm ${
                              application.status === 'pending' ? 'bg-orange-500/20 text-orange-400' :
                              application.status === 'accepted' ? 'bg-success/20 text-success' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                              {application.status}
                            </div>
                          </div>
                          
                          {application.message && (
                            <p className="text-secondary text-sm mb-4 pl-13">
                              "{application.message}"
                            </p>
                          )}
                          
                          {application.status === 'pending' && (
                            <div className="flex gap-2 pl-13">
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'accepted')}
                                className="bg-success hover:bg-success/80 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleApplicationStatus(application.id, 'rejected')}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                              >
                                Reject
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}