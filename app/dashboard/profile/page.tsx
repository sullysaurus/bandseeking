'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { instruments, genres, seekingOptions, experienceLevels, availabilityOptions } from '@/lib/utils'
import { ArrowLeft, Save, Eye } from 'lucide-react'

export default function EditProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    bio: '',
    profileImageUrl: '',
    mainInstrument: '',
    secondaryInstruments: [] as string[],
    experienceLevel: '',
    seeking: [] as string[],
    genres: [] as string[],
    influences: '',
    availability: '',
    hasTransportation: false,
    hasOwnEquipment: false,
    willingToTravelMiles: 25,
    socialLinks: {
      instagram: '',
      youtube: '',
      soundcloud: '',
      spotify: ''
    },
    isPublished: false
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/auth/login')
      return
    }
    
    // Get user data including username
    const { data: userData } = await supabase
      .from('users')
      .select('username')
      .eq('id', user.id)
      .single()
    
    setCurrentUser({ ...user, username: userData?.username })
    await fetchProfile(user.id)
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const previewUrl = URL.createObjectURL(file)
      setAvatarPreview(previewUrl)
    }
  }

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') {
        throw error
      }

      if (profileData) {
        setProfile(profileData)
        setFormData({
          bio: profileData.bio || '',
          profileImageUrl: profileData.profile_image_url || '',
          mainInstrument: profileData.main_instrument || '',
          secondaryInstruments: profileData.secondary_instruments || [],
          experienceLevel: profileData.experience_level || '',
          seeking: profileData.seeking || [],
          genres: profileData.genres || [],
          influences: profileData.influences || '',
          availability: profileData.availability || '',
          hasTransportation: profileData.has_transportation || false,
          hasOwnEquipment: profileData.has_own_equipment || false,
          willingToTravelMiles: profileData.willing_to_travel_miles || 25,
          socialLinks: profileData.social_links || {
            instagram: '',
            youtube: '',
            soundcloud: '',
            spotify: ''
          },
          isPublished: profileData.is_published || false
        })
        setAvatarPreview(profileData.profile_image_url)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!currentUser) return
    
    setSaving(true)
    try {
      let profileImageUrl = formData.profileImageUrl

      // Upload new avatar if provided
      if (avatarFile) {
        console.log('Uploading new avatar...')
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${currentUser.id}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Avatar upload error details:', {
            error: uploadError,
            message: uploadError.message
          })
          throw new Error(`Failed to upload avatar: ${uploadError.message}`)
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        
        profileImageUrl = publicUrl
        console.log('Avatar uploaded successfully:', profileImageUrl)
      }

      const profileData = {
        user_id: currentUser.id,
        bio: formData.bio,
        profile_image_url: profileImageUrl,
        main_instrument: formData.mainInstrument,
        secondary_instruments: formData.secondaryInstruments,
        experience_level: formData.experienceLevel as any,
        seeking: formData.seeking,
        genres: formData.genres,
        influences: formData.influences,
        availability: formData.availability as any,
        has_transportation: formData.hasTransportation,
        has_own_equipment: formData.hasOwnEquipment,
        willing_to_travel_miles: formData.willingToTravelMiles,
        social_links: formData.socialLinks,
        is_published: formData.isPublished
      }

      if (profile) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', profile.id)
        
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('profiles')
          .insert(profileData)
        
        if (error) throw error
      }

      // Update user profile_completed flag
      await supabase
        .from('users')
        .update({ profile_completed: true })
        .eq('id', currentUser.id)

      // Clear avatar file after successful save
      setAvatarFile(null)
      
      // Redirect to user's profile page
      if (currentUser?.username) {
        router.push(`/profile/${currentUser.username}`)
      } else {
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse">Loading profile...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Edit Profile</h1>
              <p className="text-gray-600">Update your musical profile</p>
            </div>
            {currentUser && (
              <Link href={`/profile/${currentUser.user_metadata?.username || currentUser.id}`}>
                <Button variant="ghost">
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </Link>
            )}
          </div>
        </div>

        <div className="space-y-8">
          {/* Basic Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={4}
                  placeholder="Tell us about your musical journey..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Profile Photo</label>
                <div className="space-y-4">
                  {avatarPreview && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-100">
                        <img
                          src={avatarPreview}
                          alt="Profile preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-sm text-gray-500">Upload a new profile photo (optional)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Musical Info */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Musical Information</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2">Main Instrument</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.mainInstrument}
                  onChange={(e) => setFormData({ ...formData, mainInstrument: e.target.value })}
                >
                  <option value="">Select an instrument</option>
                  {instruments.map((instrument) => (
                    <option key={instrument} value={instrument}>
                      {instrument}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Experience Level</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option value="">Select experience level</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium mb-2">Influences</label>
              <textarea
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                rows={3}
                placeholder="List your musical influences..."
                value={formData.influences}
                onChange={(e) => setFormData({ ...formData, influences: e.target.value })}
              />
            </div>
          </div>

          {/* What You're Looking For */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">What You&apos;re Looking For</h2>
            <div className="grid md:grid-cols-2 gap-2">
              {seekingOptions.map((option) => (
                <label key={option} className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={formData.seeking.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, seeking: [...formData.seeking, option] })
                      } else {
                        setFormData({ ...formData, seeking: formData.seeking.filter(s => s !== option) })
                      }
                    }}
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Genres</h2>
            <div className="grid md:grid-cols-3 gap-2">
              {genres.map((genre) => (
                <label key={genre} className="flex items-center p-2 rounded border border-gray-200 hover:border-gray-300 cursor-pointer">
                  <input
                    type="checkbox"
                    className="mr-2"
                    checked={formData.genres.includes(genre)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, genres: [...formData.genres, genre] })
                      } else {
                        setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) })
                      }
                    }}
                  />
                  <span className="text-sm">{genre}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability & Logistics */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Availability & Logistics</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                >
                  <option value="">Select availability</option>
                  {availabilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={formData.hasTransportation}
                    onChange={(e) => setFormData({ ...formData, hasTransportation: e.target.checked })}
                  />
                  <span>I have reliable transportation</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    className="mr-3"
                    checked={formData.hasOwnEquipment}
                    onChange={(e) => setFormData({ ...formData, hasOwnEquipment: e.target.checked })}
                  />
                  <span>I have my own equipment</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Willing to travel: {formData.willingToTravelMiles} miles
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.willingToTravelMiles}
                  onChange={(e) => setFormData({ ...formData, willingToTravelMiles: parseInt(e.target.value) })}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Social Links (Optional)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                label="Instagram"
                placeholder="@username"
                value={formData.socialLinks.instagram}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                })}
              />
              <Input
                label="YouTube"
                placeholder="youtube.com/..."
                value={formData.socialLinks.youtube}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                })}
              />
              <Input
                label="SoundCloud"
                placeholder="soundcloud.com/..."
                value={formData.socialLinks.soundcloud}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, soundcloud: e.target.value }
                })}
              />
              <Input
                label="Spotify"
                placeholder="spotify.com/..."
                value={formData.socialLinks.spotify}
                onChange={(e) => setFormData({
                  ...formData,
                  socialLinks: { ...formData.socialLinks, spotify: e.target.value }
                })}
              />
            </div>
          </div>

          {/* Publish Settings */}
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
            <label className="flex items-center">
              <input
                type="checkbox"
                className="mr-3"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <div>
                <span className="font-medium">Publish profile</span>
                <p className="text-sm text-gray-600">
                  Make your profile visible to other musicians
                </p>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} className="flex items-center">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </div>
      </div>
    </>
  )
}