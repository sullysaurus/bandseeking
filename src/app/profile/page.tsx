'use client'

import { useState, useEffect } from 'react'
import { Edit, Save, X, MapPin, Music, Calendar, Mail, Phone, Globe, Instagram, Upload, Eye, Headphones, Radio, Disc3, AudioLines } from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import AvatarUpload from '@/components/AvatarUpload'
import TagInput from '@/components/TagInput'
import { profileService, Profile, ProfileUpdate } from '@/lib/profiles'
import { useAuth } from '@/contexts/AuthContext'
import { COMMON_INSTRUMENTS, MUSIC_GENRES, LOOKING_FOR_OPTIONS } from '@/lib/constants/music'
import { isProfileComplete, getProfileCompletionTasks, getProfileCompletionPercentage } from '@/lib/profile-utils'

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [editedProfile, setEditedProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadProfile()
    }
  }, [user])

  const loadProfile = async () => {
    if (!user) return
    
    try {
      setLoading(true)
      setError('')
      
      // Try to get existing profile
      const existingProfile = await profileService.getProfile()
      
      if (existingProfile) {
        setProfile(existingProfile)
        setEditedProfile(existingProfile)
      } else {
        // Profile doesn't exist, create one
        console.log('Profile not found, creating one...')
        try {
          const newProfile = await profileService.createProfile({
            username: user.email?.split('@')[0] || `user_${Date.now()}`,
            full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
          })
          if (newProfile) {
            setProfile(newProfile)
            setEditedProfile(newProfile)
            setSuccess('Profile created successfully! Please complete your profile.')
            setIsEditing(true) // Start in edit mode for new profiles
          }
        } catch (createError) {
          console.error('Error creating profile:', createError)
          setError('Failed to create profile. Please try refreshing the page.')
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      // Don't show error message if it's just a missing profile
      if (!err?.message?.includes('not found')) {
        setError('Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = () => {
    setIsEditing(true)
    setError('')
    setSuccess('')
  }

  const handleSave = async () => {
    if (!editedProfile || !profile) return
    
    try {
      setLoading(true)
      setError('')
      
      // Prepare update data
      const updates: ProfileUpdate = {
        username: editedProfile.username,
        full_name: editedProfile.full_name,
        bio: editedProfile.bio,
        location: editedProfile.location,
        instruments: editedProfile.instruments,
        genres: editedProfile.genres,
        experience_level: editedProfile.experience_level,
        looking_for: editedProfile.looking_for,
        website: editedProfile.website,
        instagram: editedProfile.instagram,
        apple_music: editedProfile.apple_music,
        spotify: editedProfile.spotify,
        soundcloud: editedProfile.soundcloud,
        bandcamp: editedProfile.bandcamp,
        phone: editedProfile.phone,
        avatar_url: editedProfile.avatar_url
      }
      
      const updatedProfile = await profileService.updateProfile(updates)
      
      if (updatedProfile) {
        setProfile(updatedProfile)
        setEditedProfile(updatedProfile)
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (err: any) {
      console.error('Error updating profile:', err)
      setError(err.message || 'Failed to update profile')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditedProfile(profile)
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  const updateField = (field: keyof Profile, value: any) => {
    if (!editedProfile) return
    setEditedProfile({ ...editedProfile, [field]: value })
  }

  const handleAvatarChange = (avatarUrl: string | null) => {
    if (editedProfile) {
      setEditedProfile({ ...editedProfile, avatar_url: avatarUrl })
    }
    if (profile) {
      setProfile({ ...profile, avatar_url: avatarUrl })
    }
  }


  if (loading || !profile) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 flex items-center justify-center">
          <div className="text-center">
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : error ? (
              <div className="space-y-4">
                <div className="text-red-400">{error}</div>
                <button 
                  onClick={loadProfile}
                  className="bg-accent-teal text-white px-4 py-2 rounded-lg hover:bg-opacity-90 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : null}
          </div>
        </main>
      </div>
    )
  }

  const displayProfile = isEditing ? editedProfile! : profile

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
      
      <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
        <div className="max-w-4xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-6 md:mb-8">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl md:text-4xl font-bold text-white">My Profile</h1>
              {!isProfileComplete(profile) && (
                <div className="flex items-center gap-4 text-accent-teal text-sm bg-accent-teal/5 px-4 py-2 rounded-lg border border-accent-teal/20">
                  <div className="flex items-center gap-2">
                    <div className="w-20 h-2 bg-background rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-accent-teal to-accent-teal/80 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${getProfileCompletionPercentage(profile)}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold min-w-[2rem]">
                      {Math.round(getProfileCompletionPercentage(profile))}%
                    </span>
                  </div>
                  <span className="font-medium">Profile incomplete</span>
                </div>
              )}
            </div>
            {!isEditing ? (
              <div className="flex gap-2">
                <Link
                  href={`/profile/${profile.username}`}
                  className="flex items-center gap-2 bg-button-secondary hover:bg-opacity-80 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Eye className="w-4 h-4" />
                  View Profile
                </Link>
                <button 
                  onClick={handleEdit}
                  className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  <Edit className="w-4 h-4" />
                  Edit Profile
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="flex items-center gap-2 bg-success hover:bg-opacity-90 text-white font-medium px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  Save Changes
                </button>
                <button 
                  onClick={handleCancel}
                  className="flex items-center gap-2 bg-button-secondary hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 bg-success/10 border border-success/20 text-success px-4 py-3 rounded-lg">
              {success}
            </div>
          )}
          
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Avatar & Basic Info Card */}
              <div className="bg-card rounded-lg p-6">
                <div className="text-center mb-6">
                  <div className="mx-auto mb-4">
                    <AvatarUpload
                      currentAvatarUrl={displayProfile.avatar_url}
                      onAvatarChange={handleAvatarChange}
                      size="large"
                      editable={isEditing}
                    />
                  </div>
                  {isEditing ? (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={displayProfile.full_name || ''}
                        onChange={(e) => updateField('full_name', e.target.value)}
                        className="w-full bg-background border border-card rounded-lg px-3 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="Full Name"
                      />
                      <input
                        type="text"
                        value={displayProfile.username || ''}
                        onChange={(e) => updateField('username', e.target.value)}
                        className="w-full bg-background border border-card rounded-lg px-3 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                        placeholder="Username"
                      />
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-bold text-white">{displayProfile.full_name}</h2>
                      <p className="text-secondary">@{displayProfile.username}</p>
                    </div>
                  )}
                </div>

                {/* Contact Info */}
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-medium" />
                    <span className="text-secondary text-sm">{user?.email}</span>
                  </div>
                  
                  {(isEditing || displayProfile.location) && (
                    <div className="flex items-center gap-3">
                      <MapPin className="w-4 h-4 text-medium" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayProfile.location || ''}
                          onChange={(e) => updateField('location', e.target.value)}
                          placeholder="Location"
                          className="flex-1 bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                        />
                      ) : (
                        <span className="text-secondary text-sm">{displayProfile.location}</span>
                      )}
                    </div>
                  )}

                  {(isEditing || displayProfile.phone) && (
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-medium" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={displayProfile.phone || ''}
                          onChange={(e) => updateField('phone', e.target.value)}
                          placeholder="Phone number"
                          className="flex-1 bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                        />
                      ) : (
                        <a
                          href={`tel:${displayProfile.phone}`}
                          className="text-accent-teal hover:text-accent-teal/80 text-sm transition-colors"
                        >
                          {displayProfile.phone}
                        </a>
                      )}
                    </div>
                  )}

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-medium" />
                    <span className="text-secondary text-sm">
                      Joined {new Date(displayProfile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links Card */}
              {(isEditing || displayProfile.website || displayProfile.instagram || displayProfile.apple_music || displayProfile.spotify || displayProfile.soundcloud || displayProfile.bandcamp) && (
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Social Links</h3>
                  <div className="space-y-3">
                  {[
                    { icon: Globe, field: 'website' as keyof Profile, label: 'Website' },
                    { icon: Instagram, field: 'instagram' as keyof Profile, label: 'Instagram' },
                    { icon: Headphones, field: 'apple_music' as keyof Profile, label: 'Apple Music' },
                    { icon: Disc3, field: 'spotify' as keyof Profile, label: 'Spotify' },
                    { icon: Radio, field: 'soundcloud' as keyof Profile, label: 'SoundCloud' },
                    { icon: AudioLines, field: 'bandcamp' as keyof Profile, label: 'Bandcamp' }
                  ].map(({ icon: Icon, field, label }) => {
                    const fieldValue = displayProfile[field] as string
                    
                    // When editing, show all fields. When viewing, only show fields with values
                    if (!isEditing && !fieldValue) return null
                    
                    return (
                      <div key={field} className="flex items-center gap-3">
                        <Icon className="w-4 h-4 text-medium" />
                        {isEditing ? (
                          <input
                            type="text"
                            value={fieldValue || ''}
                            onChange={(e) => updateField(field, e.target.value)}
                            placeholder={label}
                            className="flex-1 bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                          />
                        ) : (
                          <a
                            href={fieldValue.startsWith('http') ? fieldValue : `https://${fieldValue}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-accent-teal hover:text-accent-teal/80 text-sm transition-colors"
                          >
                            {label}
                          </a>
                        )}
                      </div>
                    )
                  }).filter(Boolean)}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column - Detailed Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Bio Card */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-white font-medium mb-4">About Me</h3>
                {isEditing ? (
                  <textarea
                    value={displayProfile.bio || ''}
                    onChange={(e) => updateField('bio', e.target.value)}
                    rows={4}
                    className="w-full bg-background border border-card rounded-lg px-3 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal resize-none"
                    placeholder="Tell us about yourself..."
                  />
                ) : (
                  <p className="text-secondary leading-relaxed">{displayProfile.bio}</p>
                )}
              </div>

              {/* Musical Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Instruments */}
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Instruments</h3>
                  {isEditing ? (
                    <TagInput
                      value={displayProfile.instruments}
                      onChange={(instruments) => updateField('instruments', instruments)}
                      suggestions={COMMON_INSTRUMENTS}
                      placeholder="Select or type an instrument"
                      tagColor="accent-teal"
                      maxTags={10}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayProfile.instruments.length > 0 ? (
                        displayProfile.instruments.map((instrument) => (
                          <span 
                            key={instrument}
                            className="bg-accent-teal/20 text-accent-teal px-3 py-1 rounded-full text-sm"
                          >
                            {instrument}
                          </span>
                        ))
                      ) : (
                        <span className="text-medium text-sm">No instruments added</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Genres</h3>
                  {isEditing ? (
                    <TagInput
                      value={displayProfile.genres}
                      onChange={(genres) => updateField('genres', genres)}
                      suggestions={MUSIC_GENRES}
                      placeholder="Select or type a genre"
                      tagColor="accent-purple"
                      maxTags={10}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayProfile.genres.length > 0 ? (
                        displayProfile.genres.map((genre) => (
                          <span 
                            key={genre}
                            className="bg-accent-purple/20 text-accent-purple px-3 py-1 rounded-full text-sm"
                          >
                            {genre}
                          </span>
                        ))
                      ) : (
                        <span className="text-medium text-sm">No genres added</span>
                      )}
                    </div>
                  )}
                </div>

                {/* Experience Level */}
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Experience Level</h3>
                  {isEditing ? (
                    <select
                      value={displayProfile.experience_level || ''}
                      onChange={(e) => updateField('experience_level', e.target.value)}
                      className="w-full bg-background border border-card rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    >
                      <option value="Beginner">Beginner</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                      <option value="Professional">Professional</option>
                    </select>
                  ) : (
                    <span className="inline-block bg-success/20 text-success px-3 py-1 rounded-full text-sm">
                      {displayProfile.experience_level}
                    </span>
                  )}
                </div>

                {/* Looking For */}
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Looking For</h3>
                  {isEditing ? (
                    <TagInput
                      value={displayProfile.looking_for}
                      onChange={(items) => updateField('looking_for', items)}
                      suggestions={LOOKING_FOR_OPTIONS}
                      placeholder="What are you looking for?"
                      tagColor="success"
                      maxTags={8}
                    />
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayProfile.looking_for.length > 0 ? (
                        displayProfile.looking_for.map((item) => (
                          <span 
                            key={item}
                            className="bg-success/20 text-success px-3 py-1 rounded-full text-sm"
                          >
                            {item}
                          </span>
                        ))
                      ) : (
                        <span className="text-medium text-sm">Not specified</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      </div>
    </ProtectedRoute>
  )
}