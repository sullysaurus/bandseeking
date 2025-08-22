'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { MapPin, Music, Star, Heart } from 'lucide-react'
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
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="aspect-square relative bg-gradient-to-br from-gray-50 to-gray-100">
        {profile.profile_image_url ? (
          <Image
            src={profile.profile_image_url}
            alt={user.full_name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              console.error('Profile image failed to load:', profile.profile_image_url)
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-4xl font-bold text-gray-400">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
          </div>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <h3 className="font-semibold text-base sm:text-lg mb-1 truncate">{user.full_name}</h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3">@{user.username}</p>

        <div className="space-y-1.5 mb-3">
          <div className="flex items-center text-xs sm:text-sm text-gray-700">
            <Music className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            <span className="truncate font-medium">{profile.main_instrument}</span>
          </div>
          {user.zip_code && (
            <div className="flex items-center text-xs sm:text-sm text-gray-600">
              <MapPin className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
              <span>{user.zip_code}</span>
            </div>
          )}
          <div className="flex items-center text-xs sm:text-sm text-gray-600">
            <Star className="w-3.5 h-3.5 mr-2 flex-shrink-0" />
            <span className="capitalize">{profile.experience_level}</span>
          </div>
        </div>

        {profile.seeking && profile.seeking.length > 0 && (
          <div className="mb-3">
            <p className="text-xs text-gray-500 mb-1.5">Looking for:</p>
            <div className="flex flex-wrap gap-1">
              {profile.seeking.slice(0, 2).map((item: string, index: number) => (
                <span
                  key={index}
                  className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md"
                >
                  {item}
                </span>
              ))}
              {profile.seeking.length > 2 && (
                <span className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-md">
                  +{profile.seeking.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <div className="flex gap-2">
            <Link href={`/profile/${user.username}`} className="flex-1">
              <Button variant="primary" size="sm" className="w-full text-xs sm:text-sm">
                View Profile
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleSave}
              className="px-2"
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current text-red-500' : 'text-gray-400'}`} />
            </Button>
          </div>
          {currentUser && currentUser.id !== user.id && (
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full text-xs sm:text-sm"
              onClick={handleMessage}
            >
              Message
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}