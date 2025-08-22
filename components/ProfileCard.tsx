'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MapPin, Music, Star, Heart, MessageSquare } from 'lucide-react'
import Button from '@/components/ui/Button'

interface ProfileCardProps {
  profile: any
}

export default function ProfileCard({ profile }: ProfileCardProps) {
  const router = useRouter()
  const user = profile.user
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    setCurrentUser(authUser)
    
    if (authUser && profile) {
      const { data } = await supabase
        .from('saved_profiles')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('saved_user_id', profile.user_id)
        .single()
      
      setIsSaved(!!data)
    }
  }

  const handleSave = async () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }

    if (isSaved) {
      await supabase
        .from('saved_profiles')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('saved_user_id', profile.user_id)
    } else {
      await supabase
        .from('saved_profiles')
        .insert({
          user_id: currentUser.id,
          saved_user_id: profile.user_id
        })
    }
    setIsSaved(!isSaved)
  }

  const handleMessage = () => {
    if (!currentUser) {
      router.push('/auth/login')
      return
    }
    router.push(`/dashboard/messages/${profile.user_id}`)
  }

  return (
    <div className="group bg-white rounded-2xl border border-gray-200 overflow-hidden hover:shadow-xl hover:border-blue-500/50 transition-all duration-300 hover:-translate-y-1">
      {/* Profile Header */}
      <div className="p-6 pb-4">
        <div className="flex items-start gap-4">
          <div className="relative">
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={user.full_name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-gray-100"
                onError={(e) => {
                  console.error('Profile image failed to load:', profile.profile_image_url)
                }}
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center ring-2 ring-gray-100">
                <div className="text-xl font-bold text-white">
                  {user.full_name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
            {/* Online indicator */}
            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white"></div>
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg text-gray-900 truncate">{user.full_name}</h3>
            <p className="text-sm text-gray-600 mb-2">@{user.username}</p>
            
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <Music className="w-4 h-4 text-blue-600 flex-shrink-0" />
              <span className="truncate font-medium">{profile.main_instrument}</span>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleSave}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-2 hover:bg-gray-50"
          >
            <Heart className={`w-5 h-5 ${isSaved ? 'fill-current text-red-500' : 'text-gray-400 hover:text-red-400'}`} />
          </Button>
        </div>
      </div>

      {/* Profile Details */}
      <div className="px-6 pb-6">
        <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
          {user.zip_code && (
            <div className="flex items-center text-gray-600">
              <MapPin className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
              <span className="truncate">{user.zip_code}</span>
            </div>
          )}
          <div className="flex items-center text-gray-600">
            <Star className="w-4 h-4 mr-2 text-gray-400 flex-shrink-0" />
            <span className="capitalize truncate">{profile.experience_level}</span>
          </div>
        </div>

        {profile.seeking && profile.seeking.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-gray-500 mb-2 font-medium">Looking for:</p>
            <div className="flex flex-wrap gap-1.5">
              {profile.seeking.slice(0, 3).map((item: string, index: number) => (
                <span
                  key={index}
                  className="text-xs px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200"
                >
                  {item}
                </span>
              ))}
              {profile.seeking.length > 3 && (
                <span className="text-xs px-2.5 py-1 bg-gray-100 text-gray-600 rounded-lg border border-gray-200">
                  +{profile.seeking.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Link href={`/profile/${user.username}`} className="block">
            <Button variant="primary" size="sm" className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-xl">
              View Profile
            </Button>
          </Link>
          {currentUser && currentUser.id !== user.id && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 rounded-xl"
              onClick={handleMessage}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Message
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}