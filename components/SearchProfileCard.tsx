'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getLastActiveStatus } from '@/lib/auth-helpers'
import { useLocationDisplay } from '@/hooks/useLocationDisplay'

interface SearchProfileCardProps {
  profile: any
  currentUser: any
  savedProfiles: Set<string>
  onSave: (profileUserId: string) => void
  onMessage: (profileUserId: string) => void
}

export default function SearchProfileCard({ 
  profile, 
  currentUser, 
  savedProfiles, 
  onSave, 
  onMessage 
}: SearchProfileCardProps) {
  const locationDisplay = useLocationDisplay(profile.user.zip_code)

  return (
    <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
      {/* Header - Name, Photo, Status */}
      <div className="p-4 border-b-2 border-black">
        <div className="flex items-center gap-3">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.user.full_name}
                width={48}
                height={48}
                className="w-12 h-12 border-2 border-black object-cover"
                onError={(e) => {
                  console.error('Profile image failed to load:', profile.profile_image_url)
                }}
              />
            ) : (
              <div className="w-12 h-12 border-2 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <div className="text-lg font-black text-white">
                  {profile.user.full_name.charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Name & Core Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-lg leading-tight mb-1">{profile.user.full_name.toUpperCase()}</h3>
            <div className="flex items-center gap-2 flex-wrap">
              {/* Instrument - Most Important */}
              <span className="px-2 py-1 bg-pink-400 border-2 border-black font-black text-xs">
                {profile.main_instrument?.toUpperCase() || 'MUSICIAN'}
              </span>
              
              {/* Location - Secondary */}
              {profile.user.zip_code && (
                <span className="px-2 py-1 bg-cyan-300 border-2 border-black font-black text-xs">
                  📍 {locationDisplay}
                </span>
              )}
              
              {/* Status - Tertiary */}
              {profile.user.last_active && (() => {
                const activeStatus = getLastActiveStatus(profile.user.last_active)
                return (
                  <span className={`px-2 py-1 border-2 border-black font-black text-xs ${
                    activeStatus.status === 'online' ? 'bg-green-400' :
                    activeStatus.status === 'recent' ? 'bg-yellow-400' :
                    activeStatus.status === 'hours' ? 'bg-orange-400' :
                    activeStatus.status === 'days' ? 'bg-red-400' :
                    'bg-gray-400'
                  }`}>
                    {activeStatus.text}
                  </span>
                )
              })()}
            </div>
          </div>
        </div>
      </div>

      {/* Content - What they offer/want */}
      <div className="p-4">
        {/* Experience Level - Important for matching */}
        {profile.experience_level && (
          <div className="mb-3">
            <span className={`px-3 py-1 border-2 border-black font-black text-sm ${
              profile.experience_level === 'beginner' ? 'bg-green-300' :
              profile.experience_level === 'intermediate' ? 'bg-yellow-300' :
              profile.experience_level === 'advanced' ? 'bg-orange-400' :
              profile.experience_level === 'professional' ? 'bg-red-400 text-white' :
              'bg-gray-300'
            }`}>
              {profile.experience_level.toUpperCase()}
            </span>
          </div>
        )}

        {/* Bio - Key selling point */}
        {profile.bio && (
          <div className="mb-3 p-3 bg-gray-50 border-2 border-black">
            <p className="font-bold text-sm line-clamp-3">
              &quot;{profile.bio}&quot;
            </p>
          </div>
        )}

        {/* What they're seeking - Most relevant for search */}
        {profile.seeking && profile.seeking.length > 0 && (
          <div className="mb-3">
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

        {/* Genres - Secondary info */}
        {profile.genres && profile.genres.length > 0 && (
          <div className="mb-4">
            <p className="font-black text-sm mb-2">GENRES:</p>
            <div className="flex flex-wrap gap-1">
              {profile.genres.slice(0, 4).map((genre: string, index: number) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-blue-300 border-2 border-black font-black text-xs"
                >
                  {genre.toUpperCase()}
                </span>
              ))}
              {profile.genres.length > 4 && (
                <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                  +{profile.genres.length - 4} MORE
                </span>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2 pt-3 border-t-2 border-black">
          <Link 
            href={`/profile/${profile.user.username}`} 
            className="flex-1 px-4 py-2 bg-black text-white border-2 border-black font-black text-sm text-center hover:bg-cyan-400 hover:text-black transition-colors"
          >
            VIEW PROFILE
          </Link>
          {currentUser && currentUser.id !== profile.user_id && (
            <button
              onClick={() => onMessage(profile.user_id)} 
              className="flex-1 px-4 py-2 bg-yellow-300 border-2 border-black font-black text-sm text-center hover:bg-yellow-400 transition-colors"
            >
              MESSAGE
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => onSave(profile.user_id)}
              className={`px-4 py-2 border-2 border-black font-black text-lg transition-colors ${
                savedProfiles.has(profile.user_id)
                  ? 'bg-pink-400 hover:bg-pink-500' 
                  : 'bg-white hover:bg-lime-300'
              }`}
            >
              {savedProfiles.has(profile.user_id) ? '♥' : '♡'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}