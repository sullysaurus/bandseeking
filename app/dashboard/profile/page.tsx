'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Image from 'next/image'
import { instruments, genres, seekingOptions, experienceLevels, availabilityOptions } from '@/lib/utils'

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
        <div className="min-h-screen bg-orange-300 flex items-center justify-center">
          <div className="font-black text-2xl">LOADING PROFILE...</div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-orange-300">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center font-black text-lg mb-4 hover:text-pink-400 transition-colors"
            >
              ← BACK TO DASHBOARD
            </Link>
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-4xl md:text-5xl font-black mb-2">EDIT PROFILE</h1>
                <p className="font-bold text-xl">Update your musical profile and get discovered.</p>
              </div>
              {currentUser && (
                <Link 
                  href={`/profile/${currentUser.username || currentUser.id}`}
                  className="px-4 py-2 bg-black text-white border-4 border-black font-black hover:bg-cyan-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  VIEW PROFILE →
                </Link>
              )}
            </div>
          </div>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">BASIC INFORMATION</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-black mb-2">BIO</label>
                <textarea
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  rows={4}
                  placeholder="TELL US ABOUT YOUR MUSICAL JOURNEY..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>

              <div>
                <label className="block font-black mb-2">PROFILE PHOTO</label>
                <div className="space-y-4">
                  {avatarPreview && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 border-4 border-black bg-gray-100">
                        <Image
                          src={avatarPreview}
                          alt="Profile preview"
                          width={96}
                          height={96}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-3 py-2 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-sm font-bold text-gray-600">Upload a new profile photo (optional)</p>
                </div>
              </div>
            </div>
          </div>

          {/* Musical Info */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">MUSICAL INFORMATION</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-black mb-2">MAIN INSTRUMENT</label>
                <select
                  className="w-full px-4 py-3 border-4 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                  value={formData.mainInstrument}
                  onChange={(e) => setFormData({ ...formData, mainInstrument: e.target.value })}
                >
                  <option value="">SELECT AN INSTRUMENT</option>
                  {instruments.map((instrument) => (
                    <option key={instrument} value={instrument}>
                      {instrument.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block font-black mb-2">EXPERIENCE LEVEL</label>
                <select
                  className="w-full px-4 py-3 border-4 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                  value={formData.experienceLevel}
                  onChange={(e) => setFormData({ ...formData, experienceLevel: e.target.value })}
                >
                  <option value="">SELECT EXPERIENCE LEVEL</option>
                  {experienceLevels.map((level) => (
                    <option key={level.value} value={level.value}>
                      {level.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4">
              <label className="block font-black mb-2">INFLUENCES</label>
              <textarea
                className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                rows={3}
                placeholder="LIST YOUR MUSICAL INFLUENCES..."
                value={formData.influences}
                onChange={(e) => setFormData({ ...formData, influences: e.target.value })}
              />
            </div>
          </div>

          {/* What You're Looking For */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">WHAT YOU&apos;RE LOOKING FOR</h2>
            <div className="grid md:grid-cols-2 gap-2">
              {seekingOptions.map((option) => (
                <label key={option} className="flex items-center p-3 border-2 border-black bg-white hover:bg-yellow-100 cursor-pointer font-bold transition-colors">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4"
                    checked={formData.seeking.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, seeking: [...formData.seeking, option] })
                      } else {
                        setFormData({ ...formData, seeking: formData.seeking.filter(s => s !== option) })
                      }
                    }}
                  />
                  <span>{option.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Genres */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">GENRES</h2>
            <div className="grid md:grid-cols-3 gap-2">
              {genres.map((genre) => (
                <label key={genre} className="flex items-center p-2 border-2 border-black bg-white hover:bg-cyan-100 cursor-pointer font-bold transition-colors">
                  <input
                    type="checkbox"
                    className="mr-2 w-4 h-4"
                    checked={formData.genres.includes(genre)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, genres: [...formData.genres, genre] })
                      } else {
                        setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) })
                      }
                    }}
                  />
                  <span className="text-sm">{genre.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Availability & Logistics */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">AVAILABILITY & LOGISTICS</h2>
            <div className="space-y-4">
              <div>
                <label className="block font-black mb-2">AVAILABILITY</label>
                <select
                  className="w-full px-4 py-3 border-4 border-black font-bold bg-white focus:outline-none focus:bg-yellow-100"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                >
                  <option value="">SELECT AVAILABILITY</option>
                  {availabilityOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="space-y-3">
                <label className="flex items-center p-3 border-2 border-black bg-white hover:bg-lime-100 cursor-pointer font-bold transition-colors">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4"
                    checked={formData.hasTransportation}
                    onChange={(e) => setFormData({ ...formData, hasTransportation: e.target.checked })}
                  />
                  <span>I HAVE RELIABLE TRANSPORTATION</span>
                </label>
                <label className="flex items-center p-3 border-2 border-black bg-white hover:bg-lime-100 cursor-pointer font-bold transition-colors">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4"
                    checked={formData.hasOwnEquipment}
                    onChange={(e) => setFormData({ ...formData, hasOwnEquipment: e.target.checked })}
                  />
                  <span>I HAVE MY OWN EQUIPMENT</span>
                </label>
              </div>

              <div>
                <label className="block font-black mb-2">
                  WILLING TO TRAVEL: {formData.willingToTravelMiles} MILES
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.willingToTravelMiles}
                  onChange={(e) => setFormData({ ...formData, willingToTravelMiles: parseInt(e.target.value) })}
                  className="w-full h-3 bg-pink-400 border-2 border-black appearance-none slider"
                />
              </div>
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">SOCIAL LINKS (OPTIONAL)</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block font-black mb-2">INSTAGRAM</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  placeholder="@USERNAME"
                  value={formData.socialLinks.instagram}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, instagram: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block font-black mb-2">YOUTUBE</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  placeholder="YOUTUBE.COM/..."
                  value={formData.socialLinks.youtube}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, youtube: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block font-black mb-2">SOUNDCLOUD</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  placeholder="SOUNDCLOUD.COM/..."
                  value={formData.socialLinks.soundcloud}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, soundcloud: e.target.value }
                  })}
                />
              </div>
              <div>
                <label className="block font-black mb-2">SPOTIFY</label>
                <input
                  type="text"
                  className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100"
                  placeholder="SPOTIFY.COM/..."
                  value={formData.socialLinks.spotify}
                  onChange={(e) => setFormData({
                    ...formData,
                    socialLinks: { ...formData.socialLinks, spotify: e.target.value }
                  })}
                />
              </div>
            </div>
          </div>

          {/* Publish Settings */}
          <div className="bg-white border-4 border-black p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <h2 className="text-2xl font-black mb-4">PROFILE SETTINGS</h2>
            <label className="flex items-center p-4 border-2 border-black bg-white hover:bg-lime-100 cursor-pointer font-bold transition-colors">
              <input
                type="checkbox"
                className="mr-3 w-5 h-5"
                checked={formData.isPublished}
                onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
              />
              <div>
                <span className="font-black">PUBLISH PROFILE</span>
                <p className="text-sm font-bold text-gray-600">
                  Make your profile visible to other musicians
                </p>
              </div>
            </label>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSave} 
              disabled={saving}
              className="px-8 py-4 bg-black text-white border-4 border-black font-black text-lg hover:bg-pink-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'SAVING...' : 'SAVE PROFILE →'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}