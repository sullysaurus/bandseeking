'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Database, Search, Trash2, Eye, EyeOff, ArrowLeft, Music, MapPin } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'


export default function AdminProfilesPage() {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [profiles, setProfiles] = useState<any[]>([])
  const [filteredProfiles, setFilteredProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterPublished, setFilterPublished] = useState<string>('all')

  useEffect(() => {
    checkAdminAccess()
  }, [])

  useEffect(() => {
    filterProfiles()
  }, [profiles, searchQuery, filterPublished])

  const checkAdminAccess = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user || user.email !== 'dsully15@gmail.com') {
        router.push('/dashboard')
        return
      }

      setCurrentUser(user)
      await fetchProfiles()
    } catch (error) {
      console.error('Error checking admin access:', error)
      router.push('/dashboard')
    } finally {
      setLoading(false)
    }
  }

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setProfiles(data || [])
    } catch (error) {
      console.error('Error fetching profiles:', error)
    }
  }

  const filterProfiles = () => {
    let filtered = profiles

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(profile =>
        profile.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.main_instrument.toLowerCase().includes(searchQuery.toLowerCase()) ||
        profile.bio?.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Filter by published status
    if (filterPublished === 'published') {
      filtered = filtered.filter(profile => profile.is_published)
    } else if (filterPublished === 'draft') {
      filtered = filtered.filter(profile => !profile.is_published)
    }

    setFilteredProfiles(filtered)
  }

  const toggleProfileVisibility = async (profileId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_published: !currentStatus })
        .eq('id', profileId)

      if (error) throw error

      // Update local state
      setProfiles(profiles.map(profile => 
        profile.id === profileId 
          ? { ...profile, is_published: !currentStatus }
          : profile
      ))

      alert(`Profile ${!currentStatus ? 'published' : 'unpublished'} successfully`)
    } catch (error) {
      console.error('Error updating profile visibility:', error)
      alert('Error updating profile visibility')
    }
  }

  const deleteProfile = async (profileId: string) => {
    if (!confirm('Are you sure you want to delete this profile? This action cannot be undone.')) {
      return
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', profileId)

      if (error) throw error

      // Update local state
      setProfiles(profiles.filter(profile => profile.id !== profileId))
      alert('Profile deleted successfully')
    } catch (error) {
      console.error('Error deleting profile:', error)
      alert('Error deleting profile')
    }
  }

  if (loading) {
    return (
      <>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Loading profiles...</p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <Link href="/admin" className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors">
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Admin</span>
              </Link>
            </div>
            <div className="flex items-center gap-3 mb-2">
              <Database className="w-8 h-8 text-green-600" />
              <h1 className="text-3xl font-bold text-black">Profile Management</h1>
            </div>
            <p className="text-gray-600">Moderate and manage user profiles</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search profiles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <select
                value={filterPublished}
                onChange={(e) => setFilterPublished(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Profiles</option>
                <option value="published">Published Only</option>
                <option value="draft">Drafts Only</option>
              </select>

              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredProfiles.length} of {profiles.length} profiles
              </div>
            </div>
          </div>

          {/* Profiles Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Profile Header */}
                <div className="p-6 pb-4">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      {profile.profile_image_url ? (
                        <Image
                          src={profile.profile_image_url}
                          alt={profile.full_name}
                          width={56}
                          height={56}
                          className="w-14 h-14 rounded-xl object-cover ring-2 ring-gray-100"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-gray-100">
                          <div className="text-lg font-bold text-white">
                            {profile.full_name.charAt(0).toUpperCase()}
                          </div>
                        </div>
                      )}
                      
                      {/* Status indicator */}
                      <div className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-2 border-white ${
                        profile.is_published ? 'bg-green-500' : 'bg-gray-400'
                      }`}></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg text-gray-900 truncate">
                        {profile.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-1">@{profile.username}</p>
                      
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Music className="w-4 h-4 text-blue-600 flex-shrink-0" />
                        <span className="truncate font-medium">{profile.main_instrument}</span>
                      </div>
                      
                      {profile.zip_code && (
                        <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{profile.zip_code}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Profile Details */}
                <div className="px-6 pb-4">
                  <div className="mb-3">
                    <span className={`inline-block px-2 py-1 text-xs rounded-full ${
                      profile.is_published 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {profile.is_published ? 'Published' : 'Draft'}
                    </span>
                    <span className="inline-block ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full capitalize">
                      {profile.experience_level}
                    </span>
                  </div>

                  {profile.bio && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {profile.bio}
                    </p>
                  )}

                  {profile.genres && profile.genres.length > 0 && (
                    <div className="mb-3">
                      <p className="text-xs text-gray-500 mb-1">Genres:</p>
                      <div className="flex flex-wrap gap-1">
                        {profile.genres.slice(0, 3).map((genre, index) => (
                          <span
                            key={index}
                            className="text-xs px-2 py-1 bg-purple-50 text-purple-700 rounded"
                          >
                            {genre}
                          </span>
                        ))}
                        {profile.genres.length > 3 && (
                          <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                            +{profile.genres.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <Link href={`/profile/${profile.username}`} target="_blank" className="flex-1">
                      <Button variant="secondary" size="sm" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </Button>
                    </Link>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => toggleProfileVisibility(profile.id, profile.is_published)}
                      className="flex-1"
                    >
                      {profile.is_published ? (
                        <>
                          <EyeOff className="w-4 h-4 mr-2" />
                          Unpublish
                        </>
                      ) : (
                        <>
                          <Eye className="w-4 h-4 mr-2" />
                          Publish
                        </>
                      )}
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => deleteProfile(profile.id)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredProfiles.length === 0 && (
            <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
              <Database className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No profiles found</h3>
              <p className="text-gray-500">
                {searchQuery || filterPublished !== 'all' 
                  ? 'Try adjusting your search or filter criteria' 
                  : 'No profiles in the system yet'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  )
}