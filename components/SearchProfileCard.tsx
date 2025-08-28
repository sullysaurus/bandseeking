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
  const locationDisplay = useLocationDisplay(profile.zip_code)

  return (
    <div className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
      
      {/* Musician Header */}
      <div className="mb-4">
        <div className="flex items-start gap-4 mb-3">
          {/* Profile Photo */}
          <div className="flex-shrink-0">
            {profile.profile_image_url ? (
              <Image
                src={profile.profile_image_url}
                alt={profile.full_name}
                width={64}
                height={64}
                className="w-16 h-16 border-4 border-black object-cover"
                onError={(e) => {
                  console.error('Profile image failed to load:', profile.profile_image_url)
                }}
              />
            ) : (
              <div className="w-16 h-16 border-4 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center">
                <div className="text-xl font-black text-white">
                  {(profile.full_name || 'M').charAt(0).toUpperCase()}
                </div>
              </div>
            )}
          </div>

          {/* Name and Username */}
          <div className="flex-1 min-w-0">
            <h3 className="font-black text-xl mb-1 leading-tight">{(profile.full_name || 'Musician').toUpperCase()}</h3>
            <p className="font-bold text-sm text-gray-600">@{profile.username}</p>
          </div>
        </div>

        {/* Key Tags Row */}
        <div className="flex flex-wrap gap-2">
          {/* Last Active Status */}
          {profile.last_active && (() => {
            const activeStatus = getLastActiveStatus(profile.last_active)
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
          
          {/* Primary Instrument */}
          <span className="px-2 py-1 bg-pink-400 border-2 border-black font-black text-xs">
            {profile.main_instrument?.toUpperCase() || 'MUSICIAN'}
          </span>
          
          {/* Experience Level */}
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

          {/* Location */}
          {profile.zip_code && (
            <span className="px-2 py-1 bg-cyan-300 border-2 border-black font-black text-xs">
              📍 {locationDisplay}
            </span>
          )}
        </div>
      </div>

      {/* Bio in highlighted box */}
      {profile.bio && (
        <div className="mb-4 p-3 bg-gray-50 border-2 border-black">
          <p className="font-bold text-sm line-clamp-3">
            &quot;{profile.bio}&quot;
          </p>
        </div>
      )}

      {/* Instruments Section */}
      {profile.secondary_instruments && profile.secondary_instruments.length > 0 && (
        <div className="mb-4">
          <p className="font-black text-sm mb-2">ALSO PLAYS:</p>
          <div className="flex flex-wrap gap-1">
            {profile.secondary_instruments.slice(0, 3).map((instrument: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-purple-300 border-2 border-black font-black text-xs"
              >
                {instrument.toUpperCase()}
              </span>
            ))}
            {profile.secondary_instruments.length > 3 && (
              <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                +{profile.secondary_instruments.length - 3} MORE
              </span>
            )}
          </div>
        </div>
      )}

      {/* Looking For */}
      {profile.seeking && profile.seeking.length > 0 && (
        <div className="mb-4">
          <p className="font-black text-sm mb-2">LOOKING FOR:</p>
          <div className="flex flex-wrap gap-1">
            {profile.seeking.slice(0, 3).map((item: string, index: number) => (
              <span
                key={index}
                className="px-2 py-1 bg-lime-300 border-2 border-black font-black text-xs"
              >
                {item.toUpperCase()}
              </span>
            ))}
            {profile.seeking.length > 3 && (
              <span className="px-2 py-1 bg-gray-200 border-2 border-black font-black text-xs">
                +{profile.seeking.length - 3} MORE
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex gap-2 pt-2 border-t-2 border-black">
        <Link 
          href={`/profile/${profile.username}`} 
          className="flex-1 px-3 py-1 bg-black text-white border-2 border-black font-black text-sm text-center hover:bg-cyan-400 hover:text-black transition-colors"
        >
          VIEW →
        </Link>
        {currentUser && currentUser.id !== profile.user_id && (
          <button
            onClick={() => onMessage(profile.user_id)} 
            className="flex-1 px-3 py-1 bg-yellow-300 border-2 border-black font-black text-sm text-center hover:bg-yellow-400 transition-colors"
          >
            MESSAGE →
          </button>
        )}
        {currentUser && (
          <button
            onClick={() => onSave(profile.id)}
            className={`px-3 py-1 border-2 border-black font-black text-sm transition-colors ${
              savedProfiles.has(profile.id)
                ? 'bg-pink-400 hover:bg-pink-500' 
                : 'bg-white hover:bg-lime-300'
            }`}
          >
            {savedProfiles.has(profile.id) ? '♥' : '♡'}
          </button>
        )}
      </div>
    </div>
  )
}