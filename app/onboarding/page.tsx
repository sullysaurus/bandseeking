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
  const [authLoading, setAuthLoading] = useState(true)
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
        return
      }

      // If we reach here, user is authenticated and needs to complete onboarding
      setAuthLoading(false)
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
            <div className="text-center">
              <h2 className="text-4xl font-black mb-2">TELL US ABOUT YOURSELF</h2>
              <p className="font-bold text-lg">Let other musicians get to know you</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block font-black mb-3 text-lg">BIO</label>
                <textarea
                  className="w-full px-4 py-4 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  rows={4}
                  placeholder="TELL US ABOUT YOUR MUSICAL JOURNEY..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-black mb-3 text-lg">PROFILE PHOTO</label>
                <div className="space-y-4">
                  {formData.profileImage && (
                    <div className="flex justify-center">
                      <div className="w-32 h-32 border-4 border-black bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                        <Image
                          src={URL.createObjectURL(formData.profileImage)}
                          alt="Profile preview"
                          width={128}
                          height={128}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="w-full px-4 py-3 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
                  />
                  <p className="font-bold text-center">UPLOAD A PROFILE PHOTO (OPTIONAL)</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-2">YOUR INSTRUMENTS</h2>
              <p className="font-bold text-lg">What do you play?</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block font-black mb-3 text-lg">MAIN INSTRUMENT</label>
                <select
                  className="w-full px-4 py-4 border-4 border-black font-black focus:outline-none focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                <label className="block font-black mb-3 text-lg">EXPERIENCE LEVEL</label>
                <div className="grid grid-cols-2 gap-4">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                      className={`p-4 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        formData.experienceLevel === level.value
                          ? 'bg-pink-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-cyan-300'
                      }`}
                    >
                      {level.label.toUpperCase()}
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
            <div className="text-center">
              <h2 className="text-4xl font-black mb-2">WHAT ARE YOU LOOKING FOR?</h2>
              <p className="font-bold text-lg">Select all that apply</p>
            </div>
            <div className="space-y-4">
              {seekingOptions.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-4 border-4 border-black cursor-pointer font-bold shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    formData.seeking.includes(option)
                      ? 'bg-purple-400 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-cyan-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-4 w-5 h-5"
                    checked={formData.seeking.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, seeking: [...formData.seeking, option] })
                      } else {
                        setFormData({ ...formData, seeking: formData.seeking.filter(s => s !== option) })
                      }
                    }}
                  />
                  <span className="text-lg">{option.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-4xl font-black mb-2">MUSICAL PREFERENCES</h2>
              <p className="font-bold text-lg">What genres do you play?</p>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block font-black mb-3 text-lg">GENRES (SELECT ALL THAT APPLY)</label>
                <div className="grid grid-cols-2 gap-3 max-h-80 overflow-y-auto p-2">
                  {genres.map((genre) => (
                    <label
                      key={genre}
                      className={`flex items-center p-3 border-4 border-black cursor-pointer font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        formData.genres.includes(genre)
                          ? 'bg-blue-300 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-cyan-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-3 w-4 h-4"
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
              <div>
                <label className="block font-black mb-3 text-lg">INFLUENCES</label>
                <textarea
                  className="w-full px-4 py-4 border-4 border-black font-bold focus:outline-none focus:bg-yellow-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  rows={3}
                  placeholder="LIST YOUR MUSICAL INFLUENCES, FAVORITE ARTISTS, BANDS..."
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
            <div className="text-center">
              <h2 className="text-4xl font-black mb-2">AVAILABILITY & LOGISTICS</h2>
              <p className="font-bold text-lg">When can you practice and how far can you travel?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-black mb-3 text-lg">AVAILABILITY</label>
                <div className="grid grid-cols-2 gap-4">
                  {availabilityOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, availability: option.value })}
                      className={`p-4 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        formData.availability === option.value
                          ? 'bg-yellow-300 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-cyan-300'
                      }`}
                    >
                      {option.label.toUpperCase()}
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

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-lime-300 flex items-center justify-center">
        <div className="bg-white border-8 border-black p-8 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
            <p className="font-black text-xl">LOADING YOUR PROFILE...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lime-300">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Progress Header */}
        <div className="mb-8 text-center">
          <h1 className="text-6xl font-black mb-4">PROFILE SETUP</h1>
          <div className="bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between mb-3">
              <span className="font-black">STEP {currentStep} OF {TOTAL_STEPS}</span>
              <span className="font-black">{Math.round((currentStep / TOTAL_STEPS) * 100)}% COMPLETE</span>
            </div>
            <div className="w-full bg-black h-4 border-2 border-black">
              <div
                className="bg-pink-400 h-full transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-8 bg-white border-4 border-black p-8 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-6 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center ${
              currentStep === 1 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-300 hover:bg-yellow-400'
            }`}
          >
            <ChevronLeft className="w-5 h-5 mr-2" />
            PREVIOUS
          </button>

          {currentStep === TOTAL_STEPS ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-8 py-3 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-pink-400 hover:bg-pink-500'
              }`}
            >
              {loading ? 'PUBLISHING...' : 'PUBLISH PROFILE →'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-6 py-3 bg-pink-400 border-4 border-black font-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-500 transition-all flex items-center"
            >
              NEXT
              <ChevronRight className="w-5 h-5 ml-2" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}