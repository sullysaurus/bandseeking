'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import ProfileCard from '@/components/ProfileCard'
import Button from '@/components/ui/Button'
import Link from 'next/link'
import { Heart, ArrowLeft } from 'lucide-react'

export default function SavedProfilesPage() {
  const router = useRouter()
  const [savedProfiles, setSavedProfiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedProfiles()
  }, [])

  const fetchSavedProfiles = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('saved_profiles')
        .select(`
          *,
          saved_user:users!saved_user_id(
            *,
            profiles(*)
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match ProfileCard format
      const transformedProfiles = data?.map(item => ({
        ...item.saved_user.profiles[0],
        user: item.saved_user
      })) || []

      setSavedProfiles(transformedProfiles)
    } catch (error) {
      console.error('Error fetching saved profiles:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/dashboard" className="inline-flex items-center text-gray-600 hover:text-black mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Link>
          <div className="flex items-center">
            <Heart className="w-8 h-8 mr-3" />
            <div>
              <h1 className="text-3xl font-bold">Saved Musicians</h1>
              <p className="text-gray-600">Musicians you&apos;ve saved for future collaboration</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-lg"></div>
              </div>
            ))}
          </div>
        ) : savedProfiles.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {savedProfiles.map((profile) => (
              <ProfileCard key={profile.id} profile={profile} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No saved musicians yet</h2>
            <p className="text-gray-600 mb-6">
              Start browsing and save musicians you&apos;d like to connect with
            </p>
            <Link href="/search">
              <Button>Browse Musicians</Button>
            </Link>
          </div>
        )}
      </div>
    </>
  )
}