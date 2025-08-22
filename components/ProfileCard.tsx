'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

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
    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
      
      {/* Header with Photo and Name */}
      <div className="flex items-start gap-4 mb-4">
        {/* Profile Photo */}
        <div className="flex-shrink-0">
          {profile.profile_image_url ? (
            <Image
              src={profile.profile_image_url}
              alt={user.full_name}
              width={80}
              height={80}
              className="w-20 h-20 border-4 border-black object-cover"
              onError={(e) => {
                console.error('Profile image failed to load:', profile.profile_image_url)
              }}
            />
          ) : (
            <div className="w-20 h-20 border-4 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
              <div className="text-2xl font-black text-white">
                {user.full_name.charAt(0).toUpperCase()}
              </div>
            </div>
          )}
        </div>

        {/* Name and Basic Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-black text-xl mb-2 leading-tight">{user.full_name.toUpperCase()}</h3>
          <p className="font-bold text-sm text-gray-600 mb-2">@{user.username}</p>
          
          {/* Primary Tags Row */}
          <div className="flex flex-wrap gap-2">
            {/* Instrument Tag */}
            <span className="px-2 py-1 bg-pink-400 border-2 border-black font-black text-xs">
              {profile.main_instrument?.toUpperCase() || 'MUSICIAN'}
            </span>
            
            {/* Experience Level Tag */}
            {profile.experience_level && (
              <span className={`px-2 py-1 border-2 border-black font-black text-xs ${
                profile.experience_level === 'beginner' ? 'bg-green-300' :
                profile.experience_level === 'intermediate' ? 'bg-yellow-300' :
                profile.experience_level === 'advanced' ? 'bg-orange-400' :
                profile.experience_level === 'professional' ? 'bg-red-400 text-white' :
                'bg-gray-300'
              }`}>
                {profile.experience_level.toUpperCase()}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Location */}
      {user.zip_code && (
        <div className="mb-4">
          <span className="px-2 py-1 bg-cyan-300 border-2 border-black font-black text-xs">
            📍 {user.zip_code}
          </span>
        </div>
      )}

      {/* Seeking Section */}
      {profile.seeking && profile.seeking.length > 0 && (
        <div className="mb-4">
          <p className="font-black text-sm mb-2">LOOKING FOR:</p>
          <div className="flex flex-wrap gap-1">
            {profile.seeking.slice(0, 4).map((item: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-300 border-2 border-black font-black text-xs"
              >
                {item.toUpperCase()}
              </span>
            ))}
            {profile.seeking.length > 4 && (
              <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                +{profile.seeking.length - 4} MORE
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t-2 border-black">
        <Link 
          href={`/profile/${user.username}`} 
          className="flex-1 px-3 py-1 bg-black text-white border-2 border-black font-black text-sm text-center hover:bg-cyan-400 hover:text-black transition-colors"
        >
          VIEW →
        </Link>
        {currentUser && currentUser.id !== user.id && (
          <button 
            onClick={handleMessage}
            className="flex-1 px-3 py-1 bg-yellow-300 border-2 border-black font-black text-sm text-center hover:bg-yellow-400 transition-colors"
          >
            MESSAGE →
          </button>
        )}
        {currentUser && (
          <button 
            onClick={handleSave}
            className={`px-3 py-1 border-2 border-black font-black text-sm transition-colors ${
              isSaved 
                ? 'bg-pink-400 hover:bg-pink-500' 
                : 'bg-white hover:bg-lime-300'
            }`}
          >
            {isSaved ? '♥' : '♡'}
          </button>
        )}
      </div>
    </div>
  )
}