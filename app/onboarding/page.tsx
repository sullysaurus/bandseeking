'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { ensureUserRecord, getUserProfile } from '@/lib/auth-helpers'
import { instruments, genres, seekingOptions, experienceLevels, availabilityOptions } from '@/lib/utils'
import Image from 'next/image'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { ChevronLeft, ChevronRight, Check } from 'lucide-react'

const TOTAL_STEPS = 7

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    bio: '',
    profileImage: null as File | null,
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
    }
  })

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()
      
      if (authError) {
        console.error('Auth error:', authError)
        router.push('/auth/login')
        return
      }
      
      if (!user) {
        console.log('No user found, redirecting to login')
        router.push('/auth/login')
        return
      }

      console.log('User authenticated:', user.id)
      setUserId(user.id)

      // Check if user record exists in database
      const { data: userRecord, error: userRecordError } = await supabase
        .from('users')
        .select('id, profile_completed')
        .eq('id', user.id)
        .single()

      if (userRecordError && userRecordError.code === 'PGRST116') {
        // User record doesn't exist, create it
        console.log('User record not found, creating...')
        const { error: createUserError } = await supabase.from('users').insert({
          id: user.id,
          email: user.email || '',
          username: user.user_metadata?.username || user.email?.split('@')[0] || 'user',
          full_name: user.user_metadata?.full_name || 'User',
          city: user.user_metadata?.city || null,
          state: user.user_metadata?.state || null,
          zip_code: user.user_metadata?.zip_code || null,
          profile_completed: false
        })

        if (createUserError) {
          console.error('Error creating user record:', createUserError)
          throw createUserError
        }
        console.log('User record created successfully')
      } else if (userRecordError) {
        console.error('Error checking user record:', userRecordError)
        throw userRecordError
      } else {
        console.log('User record exists:', userRecord)
        
        // If profile is already completed, redirect to dashboard
        if (userRecord.profile_completed) {
          console.log('Profile already completed, redirecting to dashboard')
          router.push('/dashboard')
          return
        }
      }

      // Check if user already has a profile
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, is_published')
        .eq('user_id', user.id)
        .single()

      if (existingProfile) {
        console.log('User already has profile, redirecting to dashboard')
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Error checking auth:', error)
      router.push('/auth/login')
    }
  }

  const handleNext = () => {
    // Validate current step before proceeding
    if (currentStep === 2) {
      if (!formData.mainInstrument) {
        alert('Please select your main instrument')
        return
      }
      if (!formData.experienceLevel) {
        alert('Please select your experience level')
        return
      }
    }

    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    if (!userId) {
      console.error('No user ID available')
      return
    }
    
    // Validate required fields
    if (!formData.mainInstrument) {
      alert('Please select a main instrument')
      return
    }
    
    if (!formData.experienceLevel) {
      alert('Please select your experience level')
      return
    }
    
    setLoading(true)
    try {
      console.log('Submitting profile data:', {
        user_id: userId,
        main_instrument: formData.mainInstrument,
        experience_level: formData.experienceLevel,
        bio: formData.bio?.substring(0, 50) + '...',
        seeking_count: formData.seeking.length,
        genres_count: formData.genres.length,
        has_profile_image: !!formData.profileImage
      })

      let profileImageUrl = null

      // Upload profile image if provided
      if (formData.profileImage) {
        console.log('Uploading profile image...')
        console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
        console.log('Supabase Key exists:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
        const fileExt = formData.profileImage.name.split('.').pop()
        const fileName = `${userId}-${Date.now()}.${fileExt}`
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(fileName, formData.profileImage, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          console.error('Image upload error:', uploadError)
          throw new Error(`Failed to upload image: ${uploadError.message}`)
        }

        // Get the public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)
        
        profileImageUrl = publicUrl
        console.log('Image uploaded successfully:', profileImageUrl)
      }

      // Create profile
      const { data: profileData, error: profileError } = await supabase.from('profiles').insert({
        user_id: userId,
        bio: formData.bio || '',
        profile_image_url: profileImageUrl,
        main_instrument: formData.mainInstrument,
        secondary_instruments: formData.secondaryInstruments.length > 0 ? formData.secondaryInstruments : null,
        experience_level: formData.experienceLevel as any,
        seeking: formData.seeking.length > 0 ? formData.seeking : null,
        genres: formData.genres.length > 0 ? formData.genres : null,
        influences: formData.influences || null,
        availability: formData.availability || null,
        has_transportation: formData.hasTransportation,
        has_own_equipment: formData.hasOwnEquipment,
        willing_to_travel_miles: formData.willingToTravelMiles,
        social_links: formData.socialLinks,
        is_published: true
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw profileError
      }

      console.log('Profile created successfully:', profileData)

      // Update user profile_completed flag
      const { error: userError } = await supabase
        .from('users')
        .update({ profile_completed: true })
        .eq('id', userId)

      if (userError) {
        console.error('User update error:', userError)
        throw userError
      }

      console.log('Profile completion flag updated')
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating profile:', error)
      
      // More specific error handling
      if (error && typeof error === 'object') {
        if ('message' in error) {
          alert(`Error creating profile: ${error.message}`)
        } else if ('code' in error) {
          alert(`Database error (${error.code}): Please try again`)
        } else {
          alert('Error creating profile. Please check the console and try again.')
        }
      } else {
        alert('Unknown error creating profile. Please try again.')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Tell us about yourself</h2>
              <p className="text-gray-600">Let other musicians get to know you</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={4}
                  placeholder="Tell us about your musical journey, influences, and what you're looking for..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Profile Image</label>
                <div className="space-y-3">
                  {formData.profileImage && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 relative rounded-full overflow-hidden bg-gray-100">
                        <Image
                          src={URL.createObjectURL(formData.profileImage)}
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
                  />
                  <p className="text-sm text-gray-500">Upload a profile photo (optional)</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Your Instruments</h2>
              <p className="text-gray-600">What do you play?</p>
            </div>
            <div className="space-y-4">
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
                <div className="grid grid-cols-2 gap-3">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                      className={`p-3 rounded-lg border ${
                        formData.experienceLevel === level.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {level.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">What are you looking for?</h2>
              <p className="text-gray-600">Select all that apply</p>
            </div>
            <div className="space-y-2">
              {seekingOptions.map((option) => (
                <label
                  key={option}
                  className="flex items-center p-3 rounded-lg border border-gray-300 hover:border-gray-400 cursor-pointer"
                >
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
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Musical Preferences</h2>
              <p className="text-gray-600">What genres do you play?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Genres (select all that apply)</label>
                <div className="grid grid-cols-2 gap-2 max-h-64 overflow-y-auto">
                  {genres.map((genre) => (
                    <label
                      key={genre}
                      className="flex items-center p-2 rounded border border-gray-300 hover:border-gray-400 cursor-pointer"
                    >
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
              <div>
                <label className="block text-sm font-medium mb-2">Influences</label>
                <textarea
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black"
                  rows={3}
                  placeholder="List your musical influences, favorite artists, bands..."
                  value={formData.influences}
                  onChange={(e) => setFormData({ ...formData, influences: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Availability & Logistics</h2>
              <p className="text-gray-600">When can you practice and how far can you travel?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Availability</label>
                <div className="grid grid-cols-2 gap-3">
                  {availabilityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, availability: option.value })}
                      className={`p-3 rounded-lg border ${
                        formData.availability === option.value
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
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
        )

      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Social Links (Optional)</h2>
              <p className="text-gray-600">Share your music and social profiles</p>
            </div>
            <div className="space-y-4">
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
        )

      case 7:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Review Your Profile</h2>
              <p className="text-gray-600">Make sure everything looks good</p>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Profile Summary</h3>
                <div className="space-y-2 text-sm">
                  <p><strong>Main Instrument:</strong> {formData.mainInstrument}</p>
                  <p><strong>Experience:</strong> {formData.experienceLevel}</p>
                  <p><strong>Genres:</strong> {formData.genres.join(', ') || 'None selected'}</p>
                  <p><strong>Looking for:</strong> {formData.seeking.join(', ') || 'None selected'}</p>
                  <p><strong>Availability:</strong> {formData.availability}</p>
                  <p><strong>Travel Distance:</strong> {formData.willingToTravelMiles} miles</p>
                </div>
              </div>
              <div className="flex items-center justify-center py-4">
                <Check className="w-12 h-12 text-green-500" />
              </div>
              <p className="text-center text-gray-600">
                Your profile will be published and visible to other musicians
              </p>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-gray-600">Step {currentStep} of {TOTAL_STEPS}</span>
            <span className="text-sm text-gray-600">{Math.round((currentStep / TOTAL_STEPS) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-black h-2 rounded-full transition-all duration-300"
              style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
            />
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <Button
            variant="ghost"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex items-center"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>

          {currentStep === TOTAL_STEPS ? (
            <Button
              onClick={handleSubmit}
              disabled={loading}
              className="flex items-center"
            >
              {loading ? 'Publishing...' : 'Publish Profile'}
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              className="flex items-center"
            >
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}