'use client'

import { useState, useEffect } from 'react'
import { MapPin, Calendar, Mail, Phone, Globe, Instagram, MessageSquare, ArrowLeft, Heart, Headphones, Radio, Disc3, AudioLines } from 'lucide-react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import AvatarUpload from '@/components/AvatarUpload'
import { profileService, Profile } from '@/lib/profiles'
import { useAuth } from '@/contexts/AuthContext'

export default function PublicProfilePage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const username = params.username as string
  
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isOwnProfile, setIsOwnProfile] = useState(false)

  useEffect(() => {
    if (username) {
      loadProfile()
    }
  }, [username, user])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError('')
      
      const profileData = await profileService.getProfileByUsername(username)
      
      if (!profileData) {
        setError('Profile not found')
        return
      }
      
      setProfile(profileData)
      
      // Check if this is the current user's own profile
      if (user && profileData.id === user.id) {
        setIsOwnProfile(true)
      }
      
    } catch (err: any) {
      console.error('Error loading public profile:', err)
      setError('Failed to load profile')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-white">Loading profile...</div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !profile) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-8 flex items-center justify-center">
            <div className="text-center">
              <div className="text-red-400 mb-4">{error || 'Profile not found'}</div>
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
            {/* Header with Back Button */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 md:mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-secondary hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
                <div className="min-w-0">
                  <h1 className="text-2xl md:text-4xl font-bold text-white truncate">{profile.full_name || profile.username}</h1>
                  <p className="text-secondary text-base md:text-lg truncate">@{profile.username}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-auto md:ml-0">
                {isOwnProfile ? (
                  <Link 
                    href="/profile"
                    className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Edit Profile
                  </Link>
                ) : (
                  <>
                    <button className="flex items-center gap-2 bg-button-secondary hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors">
                      <Heart className="w-4 h-4" />
                      Follow
                    </button>
                    <button className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors">
                      <MessageSquare className="w-4 h-4" />
                      Contact
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column - Basic Info */}
              <div className="lg:col-span-1 space-y-6">
                {/* Avatar & Basic Info Card */}
                <div className="bg-card rounded-lg p-6">
                  <div className="text-center mb-6">
                    <div className="mx-auto mb-4">
                      <AvatarUpload
                        currentAvatarUrl={profile.avatar_url}
                        onAvatarChange={() => {}} // Read-only
                        size="large"
                        editable={false}
                      />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">{profile.full_name || profile.username}</h2>
                      <p className="text-secondary">@{profile.username}</p>
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-3">
                    {profile.location && (
                      <div className="flex items-center gap-3">
                        <MapPin className="w-4 h-4 text-medium" />
                        <span className="text-secondary text-sm">{profile.location}</span>
                      </div>
                    )}

                    {profile.phone && (
                      <div className="flex items-center gap-3">
                        <Phone className="w-4 h-4 text-medium" />
                        <a
                          href={`tel:${profile.phone}`}
                          className="text-accent-teal hover:text-accent-teal/80 text-sm transition-colors"
                        >
                          {profile.phone}
                        </a>
                      </div>
                    )}

                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-medium" />
                      <span className="text-secondary text-sm">
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Social Links Card */}
                {(profile.website || profile.instagram || profile.apple_music || profile.spotify || profile.soundcloud || profile.bandcamp) && (
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-white font-medium mb-4">Social Links</h3>
                    <div className="space-y-3">
                      {[
                        { icon: Globe, field: profile.website, label: 'Website' },
                        { icon: Instagram, field: profile.instagram, label: 'Instagram' },
                        { icon: Headphones, field: profile.apple_music, label: 'Apple Music' },
                        { icon: Disc3, field: profile.spotify, label: 'Spotify' },
                        { icon: Radio, field: profile.soundcloud, label: 'SoundCloud' },
                        { icon: AudioLines, field: profile.bandcamp, label: 'Bandcamp' }
                      ].map(({ icon: Icon, field, label }, index) => 
                        field ? (
                          <div key={index} className="flex items-center gap-3">
                            <Icon className="w-4 h-4 text-medium" />
                            <a 
                              href={field.startsWith('http') ? field : `https://${field}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-accent-teal hover:text-opacity-80 text-sm transition-colors"
                            >
                              {field}
                            </a>
                          </div>
                        ) : null
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Detailed Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Bio Card */}
                {profile.bio && (
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-white font-medium mb-4">About</h3>
                    <p className="text-secondary leading-relaxed">{profile.bio}</p>
                  </div>
                )}

                {/* Musical Info Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {/* Instruments */}
                  {profile.instruments && profile.instruments.length > 0 && (
                    <div className="bg-card rounded-lg p-6">
                      <h3 className="text-white font-medium mb-4">Instruments</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.instruments.map((instrument) => (
                          <span 
                            key={instrument}
                            className="bg-accent-teal/20 text-accent-teal px-3 py-1 rounded-full text-sm"
                          >
                            {instrument}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Genres */}
                  {profile.genres && profile.genres.length > 0 && (
                    <div className="bg-card rounded-lg p-6">
                      <h3 className="text-white font-medium mb-4">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.genres.map((genre) => (
                          <span 
                            key={genre}
                            className="bg-accent-purple/20 text-accent-purple px-3 py-1 rounded-full text-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Experience Level */}
                  {profile.experience_level && (
                    <div className="bg-card rounded-lg p-6">
                      <h3 className="text-white font-medium mb-4">Experience Level</h3>
                      <span className="inline-block bg-success/20 text-success px-3 py-1 rounded-full text-sm">
                        {profile.experience_level}
                      </span>
                    </div>
                  )}

                  {/* Looking For */}
                  {profile.looking_for && profile.looking_for.length > 0 && (
                    <div className="bg-card rounded-lg p-6">
                      <h3 className="text-white font-medium mb-4">Looking For</h3>
                      <div className="flex flex-wrap gap-2">
                        {profile.looking_for.map((item) => (
                          <span 
                            key={item}
                            className="bg-success/20 text-success px-3 py-1 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}