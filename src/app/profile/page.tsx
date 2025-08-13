'use client'

import { useState, useEffect } from 'react'
import { Edit, Save, X, MapPin, Music, Calendar, Mail, Phone, Globe, Instagram, Twitter, Github, Upload } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import AvatarUpload from '@/components/AvatarUpload'
import { profileService, Profile, ProfileUpdate } from '@/lib/profiles'
import { useAuth } from '@/contexts/AuthContext'

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
        // Create a default profile if none exists
        const defaultProfile = await profileService.createProfile({
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          full_name: user.user_metadata?.full_name || user.email || 'User',
          instruments: [],
          genres: [],
          looking_for: [],
          experience_level: 'Beginner'
        })
        
        if (defaultProfile) {
          setProfile(defaultProfile)
          setEditedProfile(defaultProfile)
        }
      }
    } catch (err) {
      console.error('Error loading profile:', err)
      setError('Failed to load profile')
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
        twitter: editedProfile.twitter,
        github: editedProfile.github,
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

  const addItem = (field: 'instruments' | 'genres' | 'looking_for', item: string) => {
    if (!editedProfile || !item.trim()) return
    const current = editedProfile[field] as string[]
    if (!current.includes(item)) {
      updateField(field, [...current, item])
    }
  }

  const removeItem = (field: 'instruments' | 'genres' | 'looking_for', item: string) => {
    if (!editedProfile) return
    const current = editedProfile[field] as string[]
    updateField(field, current.filter(i => i !== item))
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
            <h1 className="text-2xl md:text-4xl font-bold text-white">My Profile</h1>
            {!isEditing ? (
              <button 
                onClick={handleEdit}
                className="flex items-center gap-2 bg-accent-teal hover:bg-opacity-90 text-white font-medium px-4 py-2 rounded-lg transition-colors"
              >
                <Edit className="w-4 h-4" />
                Edit Profile
              </button>
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
                  
                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-medium" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayProfile.location || ''}
                        onChange={(e) => updateField('location', e.target.value)}
                        className="flex-1 bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      />
                    ) : (
                      <span className="text-secondary text-sm">{displayProfile.location}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-medium" />
                    {isEditing ? (
                      <input
                        type="text"
                        value={displayProfile.phone || ''}
                        onChange={(e) => updateField('phone', e.target.value)}
                        className="flex-1 bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      />
                    ) : (
                      <span className="text-secondary text-sm">{displayProfile.phone}</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <Calendar className="w-4 h-4 text-medium" />
                    <span className="text-secondary text-sm">
                      Joined {new Date(displayProfile.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Social Links Card */}
              <div className="bg-card rounded-lg p-6">
                <h3 className="text-white font-medium mb-4">Social Links</h3>
                <div className="space-y-3">
                  {[
                    { icon: Globe, field: 'website' as keyof Profile, label: 'Website' },
                    { icon: Instagram, field: 'instagram' as keyof Profile, label: 'Instagram' },
                    { icon: Twitter, field: 'twitter' as keyof Profile, label: 'Twitter' },
                    { icon: Github, field: 'github' as keyof Profile, label: 'GitHub' }
                  ].map(({ icon: Icon, field, label }) => (
                    <div key={field} className="flex items-center gap-3">
                      <Icon className="w-4 h-4 text-medium" />
                      {isEditing ? (
                        <input
                          type="text"
                          value={(displayProfile[field] as string) || ''}
                          onChange={(e) => updateField(field, e.target.value)}
                          placeholder={label}
                          className="flex-1 bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                        />
                      ) : (
                        <span className="text-secondary text-sm">{displayProfile[field] as string}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.instruments.map((instrument) => (
                          <span 
                            key={instrument}
                            className="inline-flex items-center gap-1 bg-accent-teal/20 text-accent-teal px-2 py-1 rounded-full text-sm"
                          >
                            {instrument}
                            <button
                              onClick={() => removeItem('instruments', instrument)}
                              className="ml-1 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add instrument (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addItem('instruments', e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="w-full bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayProfile.instruments.map((instrument) => (
                        <span 
                          key={instrument}
                          className="bg-accent-teal/20 text-accent-teal px-3 py-1 rounded-full text-sm"
                        >
                          {instrument}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Genres */}
                <div className="bg-card rounded-lg p-6">
                  <h3 className="text-white font-medium mb-4">Genres</h3>
                  {isEditing ? (
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.genres.map((genre) => (
                          <span 
                            key={genre}
                            className="inline-flex items-center gap-1 bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full text-sm"
                          >
                            {genre}
                            <button
                              onClick={() => removeItem('genres', genre)}
                              className="ml-1 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add genre (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addItem('genres', e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="w-full bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayProfile.genres.map((genre) => (
                        <span 
                          key={genre}
                          className="bg-accent-purple/20 text-accent-purple px-3 py-1 rounded-full text-sm"
                        >
                          {genre}
                        </span>
                      ))}
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
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {displayProfile.looking_for.map((item) => (
                          <span 
                            key={item}
                            className="inline-flex items-center gap-1 bg-success/20 text-success px-2 py-1 rounded-full text-sm"
                          >
                            {item}
                            <button
                              onClick={() => removeItem('looking_for', item)}
                              className="ml-1 hover:text-red-400"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="Add what you're looking for (press Enter)"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addItem('looking_for', e.currentTarget.value)
                            e.currentTarget.value = ''
                          }
                        }}
                        className="w-full bg-background border border-card rounded px-2 py-1 text-white text-sm focus:outline-none focus:ring-1 focus:ring-accent-teal"
                      />
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {displayProfile.looking_for.map((item) => (
                        <span 
                          key={item}
                          className="bg-success/20 text-success px-3 py-1 rounded-full text-sm"
                        >
                          {item}
                        </span>
                      ))}
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