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

const TOTAL_STEPS = 8

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [authLoading, setAuthLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    city: '',
    state: '',
    zipCode: '',
    bio: '',
    profileImage: null as File | null,
    mainInstrument: '',
    secondaryInstruments: [] as string[],
    experienceLevel: '',
    seeking: [] as string[],
    genres: [] as string[],
    influences: '',
    youtubeUrl: '',
    availability: [] as string[],
    hasTransportation: false,
    hasOwnEquipment: false,
    willingToTravelMiles: 25
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

      // Ensure user record exists using the helper
      const userRecord = await ensureUserRecord()
      
      // If profile is already completed, redirect to dashboard
      if (userRecord.profile_completed) {
        console.log('Profile already completed, redirecting to dashboard')
        router.push('/dashboard')
        return
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

  const handleNext = async () => {
    // Validate current step before proceeding
    if (currentStep === 1) {
      if (!formData.fullName || formData.fullName.length < 2) {
        alert('Please enter your full name')
        return
      }
      if (!formData.username || formData.username.length < 3) {
        alert('Please enter a username (at least 3 characters)')
        return
      }
      if (!formData.city || formData.city.length < 2) {
        alert('Please enter your city')
        return
      }
      if (!formData.state || formData.state.length < 2) {
        alert('Please enter your state')
        return
      }
      if (!formData.zipCode || !/^\d{5}$/.test(formData.zipCode)) {
        alert('Please enter a valid 5-digit ZIP code')
        return
      }
      
      // Check username availability
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', formData.username)
        .single()
      
      if (data) {
        alert('Username is already taken. Please choose another.')
        return
      }
    }
    
    if (currentStep === 3) {
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
        social_links: formData.youtubeUrl ? { youtube: formData.youtubeUrl } : null,
        availability: formData.availability.length > 0 ? formData.availability : null,
        has_transportation: formData.hasTransportation,
        has_own_equipment: formData.hasOwnEquipment,
        willing_to_travel_miles: formData.willingToTravelMiles,
        is_published: true
      })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw profileError
      }

      console.log('Profile created successfully:', profileData)

      // Update user with all information including profile_completed flag
      const { error: userError } = await supabase
        .from('users')
        .update({ 
          profile_completed: true,
          full_name: formData.fullName,
          username: formData.username,
          city: formData.city,
          state: formData.state,
          zip_code: formData.zipCode
        })
        .eq('id', userId)

      if (userError) {
        console.error('User update error:', userError)
        throw userError
      }

      console.log('Profile completion flag updated')
      
      // Redirect to their profile page to see the complete profile
      router.push(`/profile/${formData.username}`)
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
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">BASIC INFORMATION</h2>
              <p className="font-bold text-sm md:text-lg">Let&apos;s start with the basics</p>
            </div>
            <div className="space-y-3 md:space-y-4">
              <div>
                <label className="block font-black mb-1 md:mb-2 text-xs md:text-sm">FULL NAME</label>
                <input
                  placeholder="YOUR NAME"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 md:border-4 border-black font-bold text-base placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
              </div>
              
              <div>
                <label className="block font-black mb-1 md:mb-2 text-xs md:text-sm">USERNAME</label>
                <input
                  placeholder="PICK A USERNAME"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 md:border-4 border-black font-bold text-base placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
                <p className="mt-1 font-bold text-xs text-gray-600">LETTERS, NUMBERS, UNDERSCORES ONLY</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2 md:gap-4">
                <div>
                  <label className="block font-black mb-1 md:mb-2 text-xs md:text-sm">CITY</label>
                  <input
                    placeholder="YOUR CITY"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 md:border-4 border-black font-bold text-base placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                  />
                </div>
                
                <div>
                  <label className="block font-black mb-1 md:mb-2 text-xs md:text-sm">STATE</label>
                  <input
                    placeholder="ST"
                    maxLength={2}
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value.toUpperCase() })}
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 md:border-4 border-black font-bold text-base placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors uppercase"
                  />
                </div>
              </div>
              
              <div>
                <label className="block font-black mb-1 md:mb-2 text-xs md:text-sm">ZIP CODE</label>
                <input
                  placeholder="12345"
                  maxLength={5}
                  value={formData.zipCode}
                  onChange={(e) => setFormData({ ...formData, zipCode: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-3 md:px-4 py-2 md:py-3 border-2 md:border-4 border-black font-bold text-base placeholder:text-gray-400 focus:outline-none focus:bg-yellow-100 transition-colors"
                />
              </div>
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">TELL US ABOUT YOURSELF</h2>
              <p className="font-bold text-sm md:text-lg">Let other musicians get to know you</p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block font-black mb-2 md:mb-3 text-sm md:text-lg">BIO</label>
                <textarea
                  className="w-full px-3 md:px-4 py-2 md:py-4 border-2 md:border-4 border-black font-bold text-base focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  rows={4}
                  placeholder="TELL US ABOUT YOUR MUSICAL JOURNEY..."
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                />
              </div>
              <div>
                <label className="block font-black mb-2 md:mb-3 text-sm md:text-lg">PROFILE PHOTO</label>
                <div className="space-y-3 md:space-y-4">
                  {formData.profileImage && (
                    <div className="flex justify-center">
                      <div className="w-24 h-24 md:w-32 md:h-32 border-2 md:border-4 border-black bg-white shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
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
                    className="w-full px-3 md:px-4 py-2 md:py-3 border-2 md:border-4 border-black font-bold text-sm md:text-base focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                    onChange={(e) => setFormData({ ...formData, profileImage: e.target.files?.[0] || null })}
                  />
                  <p className="font-bold text-center text-xs md:text-base">UPLOAD A PROFILE PHOTO (OPTIONAL)</p>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">YOUR INSTRUMENTS</h2>
              <p className="font-bold text-sm md:text-lg">What do you play?</p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block font-black mb-2 md:mb-3 text-sm md:text-lg">MAIN INSTRUMENT</label>
                <select
                  className="w-full px-3 md:px-4 py-3 md:py-4 border-2 md:border-4 border-black font-black text-base focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
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
                <label className="block font-black mb-2 md:mb-3 text-sm md:text-lg">EXPERIENCE LEVEL</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {experienceLevels.map((level) => (
                    <button
                      key={level.value}
                      type="button"
                      onClick={() => setFormData({ ...formData, experienceLevel: level.value })}
                      className={`p-3 md:p-4 border-2 md:border-4 border-black font-black text-sm md:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        formData.experienceLevel === level.value
                          ? 'bg-pink-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
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

      case 4:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">WHAT ARE YOU LOOKING FOR?</h2>
              <p className="font-bold text-sm md:text-lg">Select all that apply</p>
            </div>
            <div className="space-y-3 md:space-y-4">
              {seekingOptions.map((option) => (
                <label
                  key={option}
                  className={`flex items-center p-3 md:p-4 border-2 md:border-4 border-black cursor-pointer font-bold shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                    formData.seeking.includes(option)
                      ? 'bg-purple-400 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                      : 'bg-white hover:bg-cyan-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    className="mr-3 md:mr-4 w-4 h-4 md:w-5 md:h-5"
                    checked={formData.seeking.includes(option)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, seeking: [...formData.seeking, option] })
                      } else {
                        setFormData({ ...formData, seeking: formData.seeking.filter(s => s !== option) })
                      }
                    }}
                  />
                  <span className="text-sm md:text-lg">{option.toUpperCase()}</span>
                </label>
              ))}
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">MUSICAL PREFERENCES</h2>
              <p className="font-bold text-sm md:text-lg">What genres do you play?</p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <div>
                <label className="block font-black mb-2 md:mb-3 text-sm md:text-lg">GENRES (SELECT ALL THAT APPLY)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 md:gap-3 max-h-64 md:max-h-80 overflow-y-auto p-1 md:p-2">
                  {genres.map((genre) => (
                    <label
                      key={genre}
                      className={`flex items-center p-2 md:p-3 border-2 md:border-4 border-black cursor-pointer font-bold shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] md:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        formData.genres.includes(genre)
                          ? 'bg-blue-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-cyan-200'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-2 md:mr-3 w-3 h-3 md:w-4 md:h-4"
                        checked={formData.genres.includes(genre)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, genres: [...formData.genres, genre] })
                          } else {
                            setFormData({ ...formData, genres: formData.genres.filter(g => g !== genre) })
                          }
                        }}
                      />
                      <span className="text-xs md:text-sm">{genre.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div>
                <label className="block font-black mb-2 md:mb-3 text-sm md:text-lg">INFLUENCES</label>
                <textarea
                  className="w-full px-3 md:px-4 py-3 md:py-4 border-2 md:border-4 border-black font-bold text-base focus:outline-none focus:bg-yellow-100 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  rows={3}
                  placeholder="LIST YOUR MUSICAL INFLUENCES, FAVORITE ARTISTS, BANDS..."
                  value={formData.influences}
                  onChange={(e) => setFormData({ ...formData, influences: e.target.value })}
                />
              </div>
            </div>
          </div>
        )

      case 6:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">AVAILABILITY & LOGISTICS</h2>
              <p className="font-bold text-sm md:text-lg">When can you practice and how far can you travel?</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block font-black mb-2 md:mb-3 text-sm md:text-lg">AVAILABILITY (SELECT ALL THAT APPLY)</label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  {availabilityOptions.map((option) => (
                    <label
                      key={option.value}
                      className={`flex items-center p-3 md:p-4 border-2 md:border-4 border-black cursor-pointer font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all ${
                        formData.availability.includes(option.value)
                          ? 'bg-yellow-300 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
                          : 'bg-white hover:bg-cyan-300'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="mr-3 w-4 h-4 md:w-5 md:h-5"
                        checked={formData.availability.includes(option.value)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({ ...formData, availability: [...formData.availability, option.value] })
                          } else {
                            setFormData({ ...formData, availability: formData.availability.filter(a => a !== option.value) })
                          }
                        }}
                      />
                      <span className="text-sm md:text-base">{option.label.toUpperCase()}</span>
                    </label>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="flex items-center p-3 border-2 border-black bg-white font-bold cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 md:w-5 md:h-5"
                    checked={formData.hasTransportation}
                    onChange={(e) => setFormData({ ...formData, hasTransportation: e.target.checked })}
                  />
                  <span className="text-sm md:text-base">I HAVE RELIABLE TRANSPORTATION</span>
                </label>
                <label className="flex items-center p-3 border-2 border-black bg-white font-bold cursor-pointer hover:bg-gray-50">
                  <input
                    type="checkbox"
                    className="mr-3 w-4 h-4 md:w-5 md:h-5"
                    checked={formData.hasOwnEquipment}
                    onChange={(e) => setFormData({ ...formData, hasOwnEquipment: e.target.checked })}
                  />
                  <span className="text-sm md:text-base">I HAVE MY OWN EQUIPMENT</span>
                </label>
              </div>
              <div>
                <label className="block font-black mb-2 text-sm md:text-base">
                  WILLING TO TRAVEL: {formData.willingToTravelMiles} MILES
                </label>
                <input
                  type="range"
                  min="5"
                  max="100"
                  step="5"
                  value={formData.willingToTravelMiles}
                  onChange={(e) => setFormData({ ...formData, willingToTravelMiles: parseInt(e.target.value) })}
                  className="w-full h-3 md:h-4 bg-gray-300 border-2 border-black appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>
        )

      case 7:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">SHARE YOUR MUSIC</h2>
              <p className="font-bold text-sm md:text-lg">Add a link of yourself playing or one of your favorite bands or something that inspires you</p>
            </div>
            <div className="space-y-4 md:space-y-6">
              <div>
                <Input
                  label="YOUTUBE URL (OPTIONAL)"
                  type="url"
                  placeholder="https://youtube.com/watch?v=..."
                  value={formData.youtubeUrl}
                  onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                  className="text-sm md:text-base"
                />
                <p className="text-xs md:text-sm text-gray-600 mt-2 font-bold">
                  This will be displayed on your profile to give others a sense of your musical style
                </p>
                {formData.youtubeUrl && formData.youtubeUrl.includes('youtube.com') && (
                  <div className="mt-4 p-3 bg-gray-100 border-2 border-black">
                    <p className="text-xs font-bold mb-2">PREVIEW:</p>
                    <div className="aspect-video bg-white border-2 border-black flex items-center justify-center">
                      <p className="text-sm font-bold text-gray-600">VIDEO PREVIEW</p>
                    </div>
                  </div>
                )}
              </div>
              <div className="text-center p-4 bg-yellow-100 border-2 border-black">
                <p className="font-bold text-sm">
                  💡 TIP: This step is completely optional - you can always add this later from your profile settings!
                </p>
              </div>
            </div>
          </div>
        )

      case 8:
        return (
          <div className="space-y-4 md:space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-4xl font-black mb-1 md:mb-2">REVIEW YOUR PROFILE</h2>
              <p className="font-bold text-sm md:text-lg">Make sure everything looks good</p>
            </div>
            <div className="space-y-4">
              <div className="p-3 md:p-4 bg-yellow-100 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <h3 className="font-black mb-2 md:mb-3 text-sm md:text-lg">PROFILE SUMMARY</h3>
                <div className="space-y-1 md:space-y-2 text-xs md:text-sm font-bold">
                  <p><span className="text-pink-600">MAIN INSTRUMENT:</span> {formData.mainInstrument || 'Not selected'}</p>
                  <p><span className="text-pink-600">EXPERIENCE:</span> {formData.experienceLevel || 'Not selected'}</p>
                  <p><span className="text-pink-600">GENRES:</span> {formData.genres.length > 0 ? formData.genres.join(', ') : 'None selected'}</p>
                  <p><span className="text-pink-600">LOOKING FOR:</span> {formData.seeking.length > 0 ? formData.seeking.join(', ') : 'None selected'}</p>
                  <p><span className="text-pink-600">AVAILABILITY:</span> {formData.availability.length > 0 ? formData.availability.join(', ') : 'Not selected'}</p>
                  <p><span className="text-pink-600">YOUTUBE:</span> {formData.youtubeUrl || 'None added'}</p>
                  <p><span className="text-pink-600">TRAVEL DISTANCE:</span> {formData.willingToTravelMiles} miles</p>
                </div>
              </div>
              <div className="flex items-center justify-center py-3 md:py-4">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-400 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center justify-center">
                  <Check className="w-8 h-8 md:w-12 md:h-12 text-black" />
                </div>
              </div>
              <div className="text-center p-3 md:p-4 bg-cyan-300 border-2 md:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <p className="font-black text-xs md:text-base">
                  YOUR PROFILE WILL BE PUBLISHED AND VISIBLE TO OTHER MUSICIANS!
                </p>
              </div>
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
      <div className="min-h-screen bg-lime-300">
        <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
          {/* Progress Header Skeleton */}
          <div className="mb-4 md:mb-8 text-center">
            <h1 className="text-3xl md:text-6xl font-black mb-2 md:mb-4">PROFILE SETUP</h1>
            <div className="bg-white border-2 md:border-4 border-black p-3 md:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between mb-2 md:mb-3 text-xs md:text-base">
                <span className="font-black">LOADING...</span>
                <span className="font-black">0%</span>
              </div>
              <div className="w-full bg-black h-3 md:h-4 border border-black">
                <div className="bg-gray-300 h-full w-0 transition-all duration-300" />
              </div>
            </div>
          </div>

          {/* Content Skeleton */}
          <div className="mb-4 md:mb-8 bg-white border-2 md:border-4 border-black p-4 md:p-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center mb-6">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black mx-auto mb-4"></div>
              <p className="font-black text-xl">PREPARING YOUR PROFILE...</p>
              <p className="font-bold text-sm mt-2 text-gray-600">This will just take a moment</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-lime-300">
      <div className="max-w-4xl mx-auto px-4 py-4 md:py-8">
        {/* Progress Header */}
        <div className="mb-4 md:mb-8 text-center">
          <h1 className="text-3xl md:text-6xl font-black mb-2 md:mb-4">PROFILE SETUP</h1>
          <div className="bg-white border-2 md:border-4 border-black p-3 md:p-4 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="flex justify-between mb-2 md:mb-3 text-xs md:text-base">
              <span className="font-black">STEP {currentStep}/{TOTAL_STEPS}</span>
              <span className="font-black">{Math.round((currentStep / TOTAL_STEPS) * 100)}%</span>
            </div>
            <div className="w-full bg-black h-3 md:h-4 border border-black">
              <div
                className="bg-pink-400 h-full transition-all duration-300"
                style={{ width: `${(currentStep / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Step Content */}
        <div className="mb-4 md:mb-8 bg-white border-2 md:border-4 border-black p-4 md:p-8 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          {renderStep()}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between gap-2">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className={`px-3 md:px-6 py-2 md:py-3 border-2 md:border-4 border-black font-black text-sm md:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center ${
              currentStep === 1 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-yellow-300 hover:bg-yellow-400'
            }`}
          >
            <ChevronLeft className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
            <span className="hidden md:inline">PREVIOUS</span>
            <span className="md:hidden">BACK</span>
          </button>

          {currentStep === TOTAL_STEPS ? (
            <button
              onClick={handleSubmit}
              disabled={loading}
              className={`px-4 md:px-8 py-2 md:py-3 border-2 md:border-4 border-black font-black text-sm md:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] transition-all flex items-center ${
                loading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                  : 'bg-pink-400 hover:bg-pink-500'
              }`}
            >
              {loading ? 'PUBLISHING...' : 'PUBLISH →'}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="px-3 md:px-6 py-2 md:py-3 bg-pink-400 border-2 md:border-4 border-black font-black text-sm md:text-base shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-pink-500 transition-all flex items-center"
            >
              NEXT
              <ChevronRight className="w-4 h-4 md:w-5 md:h-5 ml-1 md:ml-2" />
            </button>
          )}
        </div>

        {/* Skip Option */}
        <div className="mt-6 text-center">
          <button
            onClick={() => router.push('/dashboard')}
            className="px-4 py-2 bg-gray-200 border-2 border-black font-bold text-sm md:text-base hover:bg-gray-300 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
          >
            I&apos;LL DO THIS LATER
          </button>
          <p className="text-xs text-gray-600 mt-2 font-bold">
            You can complete your profile anytime from the dashboard
          </p>
        </div>
      </div>
    </div>
  )
}