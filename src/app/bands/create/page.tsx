'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Music, MapPin, Calendar, Globe, Instagram, Twitter, Youtube, Music2, Plus, X } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { bandService, BandCreate } from '@/lib/bands'
import { useAuth } from '@/contexts/AuthContext'
import { MUSIC_GENRES, BAND_ROLES } from '@/lib/constants/music'

export default function CreateBandPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [bandData, setBandData] = useState<BandCreate>({
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
    
    // Validation
    if (!bandData.name?.trim()) {
      setError('Band name is required')
      return
    }
    
    if (bandData.name.trim().length < 2) {
      setError('Band name must be at least 2 characters long')
      return
    }

    if (bandData.formed_year && (bandData.formed_year < 1900 || bandData.formed_year > new Date().getFullYear())) {
      setError('Please enter a valid year formed')
      return
    }

    setLoading(true)
    setError('')

    try {
      const band = await bandService.createBand({
        ...bandData,
        name: bandData.name.trim(),
        description: bandData.description?.trim() || '',
        location: bandData.location?.trim() || ''
      })
      
      if (band) {
        router.push(`/bands/${band.slug}`)
      } else {
        setError('Failed to create band. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      if (err.message?.includes('Database not set up yet')) {
        setError('Database not set up yet. Please install Docker and run migrations to create bands.')
      } else {
        setError(err.message || 'Failed to create band. Please try again.')
      }
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-3xl mx-auto">
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
                <h1 className="text-2xl md:text-4xl font-bold text-white">Start a Band</h1>
                <p className="text-secondary">Create your band profile and start recruiting musicians</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
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
                      {MUSIC_GENRES.map(genre => (
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
                  {BAND_ROLES.map(instrument => (
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
                  disabled={loading}
                  className="px-6 py-3 bg-accent-teal text-black font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Create Band'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}