'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import Image from 'next/image'
import { instruments, genres, experienceLevels } from '@/lib/utils'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { calculateProfileCompletion, getProfileCompletionMessage, getRandomEncouragingMessage } from '@/lib/profile-utils'

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
    secondaryInstrument: '',
    experienceLevel: '',
    genres: [] as string[],
    zipCode: '',
    socialLinks: {
      youtube: '',
      instagram: '',
      soundcloud: '',
      spotify: '',
      bandcamp: '',
      appleMusic: ''
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
    
    setCurrentUser(user)
    
    // Get profile data
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single()
    
    if (profileData) {
      setProfile(profileData)
      setFormData({
        bio: profileData.bio || '',
        profileImageUrl: profileData.profile_image_url || '/social.png',
        mainInstrument: profileData.main_instrument || '',
        secondaryInstrument: profileData.secondary_instrument || '',
        experienceLevel: profileData.experience_level || '',
        genres: profileData.genres || [],
        zipCode: profileData.zip_code || '',
        socialLinks: profileData.social_links || {
          youtube: '',
          instagram: '',
          soundcloud: '',
          spotify: '',
          bandcamp: '',
          appleMusic: ''
        },
        isPublished: profileData.is_published || false
      })
      setAvatarPreview(profileData.profile_image_url || '/social.png')
    }
    
    setLoading(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      let profileImageUrl = formData.profileImageUrl || '/social.png'

      // Upload avatar if selected
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop()
        const fileName = `${currentUser.id}.${fileExt}`
        
        const { error: uploadError, data } = await supabase.storage
          .from('avatars')
          .upload(fileName, avatarFile, { upsert: true })

        if (uploadError) throw uploadError

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(fileName)

        profileImageUrl = publicUrl
      }

      // Update profile
      const { error } = await supabase
        .from('profiles')
        .update({
          username: profile.username,
          bio: formData.bio,
          main_instrument: formData.mainInstrument,
          secondary_instrument: formData.secondaryInstrument,
          experience_level: formData.experienceLevel,
          genres: formData.genres,
          zip_code: formData.zipCode,
          social_links: formData.socialLinks,
          profile_image_url: profileImageUrl,
          is_published: formData.isPublished,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', currentUser.id)

      if (error) throw error

      // Redirect based on publish status
      if (formData.isPublished && profile?.username) {
        router.push(`/profile/${profile.username}`)
      } else {
        alert('Profile saved successfully!')
      }

    } catch (error) {
      console.error('Error saving profile:', error)
      alert('Error saving profile. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setAvatarFile(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }


  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen bg-lime-300 flex items-center justify-center">
          <div className="bg-white border-4 border-black p-8 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <div className="text-center">
              <div className="text-6xl mb-4">🎸</div>
              <h1 className="text-2xl font-black mb-2">LOADING PROFILE...</h1>
            </div>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-lime-300">
        <div className="p-4 md:p-8 max-w-4xl mx-auto">
          <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] mb-6">
            <h1 className="text-3xl md:text-4xl font-black mb-2">EDIT PROFILE</h1>
            <p className="font-bold text-gray-600 mb-4">Tell other musicians about yourself</p>
            
            {profile && (() => {
              const completion = calculateProfileCompletion(profile)
              return (
                <div className="bg-lime-100 border-2 border-black p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-sm">PROFILE COMPLETION</span>
                    <span className="font-black text-lg">{completion.percentage}%</span>
                  </div>
                  <div className="w-full bg-gray-300 border-2 border-black h-3 mb-2">
                    <div 
                      className="h-full bg-gradient-to-r from-pink-400 to-cyan-400 border-r-2 border-black transition-all"
                      style={{ width: `${completion.percentage}%` }}
                    ></div>
                  </div>
                  <p className="font-bold text-sm">{getProfileCompletionMessage(completion)}</p>
                  {completion.isUsingDefaults && (
                    <p className="font-bold text-xs text-purple-600 mt-1">
                      💡 {getRandomEncouragingMessage()}
                    </p>
                  )}
                </div>
              )
            })()}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Image */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black mb-4">PROFILE PHOTO</h2>
              <div className="flex items-center gap-6">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview}
                    alt="Profile"
                    width={100}
                    height={100}
                    className="w-24 h-24 border-4 border-black object-cover"
                  />
                ) : (
                  <div className="w-24 h-24 border-4 border-black bg-gray-200 flex items-center justify-center">
                    <span className="text-2xl font-black text-gray-400">?</span>
                  </div>
                )}
                <div className="flex-1">
                  <label className="inline-block px-4 py-2 bg-yellow-300 border-2 border-black font-black text-sm cursor-pointer hover:bg-yellow-400 transition-colors">
                    CHOOSE FILE
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarChange}
                      className="hidden"
                    />
                  </label>
                  <p className="text-sm font-bold text-gray-600 mt-2">Upload a square image for best results</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black mb-4">BASIC INFO</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-black text-sm mb-2">USERNAME</label>
                  <Input 
                    value={profile?.username || ''} 
                    onChange={(e) => {
                      // Update the profile state directly since username is part of profile, not formData
                      setProfile({...profile, username: e.target.value})
                    }}
                    placeholder="your-username"
                  />
                  <p className="text-xs font-bold text-gray-500 mt-1">This will be your public handle (@username)</p>
                  {profile?.username?.match(/^(guitarist|drummer|vocalist|bassist|keyboardist|producer|songwriter)_\d+$/) && (
                    <p className="text-xs font-bold text-purple-600 mt-1">💡 Make it unique! Try your real name or stage name</p>
                  )}
                </div>
                
                <div>
                  <label className="block font-black text-sm mb-2">ZIP CODE</label>
                  <Input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                    placeholder="12345"
                    maxLength={5}
                  />
                  {formData.zipCode === '27601' && (
                    <p className="text-xs font-bold text-purple-600 mt-1">💡 Enter your actual ZIP code to connect with local musicians</p>
                  )}
                </div>
              </div>
            </div>

            {/* Musical Info */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black mb-4">MUSICAL INFO</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-black text-sm mb-2">BIO</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => setFormData({...formData, bio: e.target.value})}
                    placeholder="Tell other musicians about yourself - what you play, your style, influences, what you're looking for, experience level, etc. This is all searchable!"
                    rows={4}
                    className="w-full p-3 border-2 border-black focus:outline-none focus:bg-yellow-100 font-bold resize-none"
                  />
                  {formData.bio === 'Super cool person looking to collaborate. Shoot me a dm!' && (
                    <p className="text-xs font-bold text-purple-600 mt-1">💡 Tell your story! Mention your style, influences, what you&apos;re looking for, experience level, etc.</p>
                  )}
                </div>

                {/* Compact row for instruments and experience */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block font-black text-sm mb-2">MAIN INSTRUMENT</label>
                    <select
                      value={formData.mainInstrument}
                      onChange={(e) => setFormData({...formData, mainInstrument: e.target.value})}
                      className="w-full p-2 border-2 border-black focus:outline-none focus:bg-yellow-100 font-bold text-sm"
                    >
                      <option value="">Select</option>
                      {instruments.map(instrument => (
                        <option key={instrument} value={instrument}>{instrument}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-black text-sm mb-2">ALSO PLAYS</label>
                    <select
                      value={formData.secondaryInstrument}
                      onChange={(e) => setFormData({...formData, secondaryInstrument: e.target.value})}
                      className="w-full p-2 border-2 border-black focus:outline-none focus:bg-yellow-100 font-bold text-sm"
                    >
                      <option value="">None</option>
                      {instruments.filter(i => i !== formData.mainInstrument).map(instrument => (
                        <option key={instrument} value={instrument}>{instrument}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-black text-sm mb-2">EXPERIENCE</label>
                    <select
                      value={formData.experienceLevel}
                      onChange={(e) => setFormData({...formData, experienceLevel: e.target.value})}
                      className="w-full p-2 border-2 border-black focus:outline-none focus:bg-yellow-100 font-bold text-sm"
                    >
                      <option value="">Select</option>
                      {experienceLevels.map(level => (
                        <option key={level.value} value={level.value}>{level.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Compact genres */}
                <div>
                  <label className="block font-black text-sm mb-2">GENRES (select up to 3)</label>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-32 overflow-y-auto">
                    {genres.slice(0, 12).map(genre => (
                      <label key={genre} className="flex items-center text-xs">
                        <input
                          type="checkbox"
                          checked={formData.genres.includes(genre)}
                          onChange={(e) => {
                            if (e.target.checked && formData.genres.length < 3) {
                              setFormData({...formData, genres: [...formData.genres, genre]})
                            } else if (!e.target.checked) {
                              setFormData({...formData, genres: formData.genres.filter(g => g !== genre)})
                            }
                          }}
                          disabled={!formData.genres.includes(genre) && formData.genres.length >= 3}
                          className="mr-1 scale-75"
                        />
                        <span className="font-bold">{genre}</span>
                      </label>
                    ))}
                  </div>
                  {formData.genres.length === 1 && formData.genres.includes('Rock') && (
                    <p className="text-xs font-bold text-purple-600 mt-1">💡 Add 1-2 more genres to help people find you!</p>
                  )}
                </div>
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black mb-4">SOCIAL LINKS</h2>
              <div className="space-y-4">
                <div>
                  <label className="block font-black text-sm mb-2">YOUTUBE</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.youtube}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, youtube: e.target.value}
                    })}
                    placeholder="https://youtube.com/..."
                  />
                </div>
                <div>
                  <label className="block font-black text-sm mb-2">INSTAGRAM</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.instagram}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, instagram: e.target.value}
                    })}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block font-black text-sm mb-2">SOUNDCLOUD</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.soundcloud}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, soundcloud: e.target.value}
                    })}
                    placeholder="https://soundcloud.com/..."
                  />
                </div>
                <div>
                  <label className="block font-black text-sm mb-2">SPOTIFY</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.spotify}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, spotify: e.target.value}
                    })}
                    placeholder="https://open.spotify.com/..."
                  />
                </div>
                <div>
                  <label className="block font-black text-sm mb-2">BANDCAMP</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.bandcamp}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, bandcamp: e.target.value}
                    })}
                    placeholder="https://bandcamp.com/..."
                  />
                </div>
                <div>
                  <label className="block font-black text-sm mb-2">APPLE MUSIC</label>
                  <Input
                    type="url"
                    value={formData.socialLinks.appleMusic}
                    onChange={(e) => setFormData({
                      ...formData, 
                      socialLinks: {...formData.socialLinks, appleMusic: e.target.value}
                    })}
                    placeholder="https://music.apple.com/..."
                  />
                </div>
              </div>
            </div>

            {/* Publish Toggle */}
            <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <h2 className="text-xl font-black mb-4">VISIBILITY</h2>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="mr-3 scale-125"
                />
                <span className="font-black">PUBLISH PROFILE (make it visible to other musicians)</span>
              </label>
              <p className="text-sm font-bold text-gray-600 mt-2">
                When published, other musicians can find and contact you through search.
              </p>
              {profile && (() => {
                const completion = calculateProfileCompletion(profile)
                return completion.percentage < 80 && (
                  <p className="text-xs font-bold text-purple-600 mt-2">
                    💡 Complete profiles get 3x more messages! Consider customizing your defaults above.
                  </p>
                )
              })()}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-pink-400 hover:bg-pink-500 border-4 border-black font-black text-lg py-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
              >
                {saving ? 'SAVING...' : 'SAVE PROFILE'}
              </Button>
              
              {profile?.username && (
                <Link 
                  href={`/profile/${profile.username}`}
                  className="px-6 py-4 bg-cyan-400 hover:bg-cyan-500 border-4 border-black font-black text-lg shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-center"
                >
                  {formData.isPublished ? 'VIEW PROFILE' : 'PREVIEW PROFILE'}
                </Link>
              )}
            </div>
          </form>
        </div>
      </div>
    </>
  )
}