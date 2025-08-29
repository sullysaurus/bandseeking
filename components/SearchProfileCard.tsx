'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { getLastActiveStatus } from '@/lib/auth-helpers'
import { useLocationDisplay } from '@/hooks/useLocationDisplay'
import { Eye, MessageSquare, Heart, MapPin, Music } from 'lucide-react'

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
    <div className="bg-white border-2 sm:border-4 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] sm:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] sm:hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all">
      
      <div className="p-3 sm:p-6">
        {/* Mobile Layout */}
        <div className="sm:hidden">
          <div className="flex items-center gap-3">
            {/* Profile Photo - Compact */}
            <div className="flex-shrink-0">
              {profile.profile_image_url ? (
                <Image
                  src={profile.profile_image_url}
                  alt={profile.username}
                  width={40}
                  height={40}
                  className="w-10 h-10 border-2 border-black object-cover rounded"
                  onError={(e) => {
                    console.error('Profile image failed to load:', profile.profile_image_url)
                  }}
                />
              ) : (
                <div className="w-10 h-10 border-2 border-black bg-gradient-to-br from-pink-400 to-purple-500 flex items-center justify-center rounded">
                  <div className="text-xs font-black text-white">
                    {(profile.username || 'M').charAt(0).toUpperCase()}
                  </div>
                </div>
              )}
            </div>

            {/* Name and Compact Info - Single Row */}
            <div className="flex-1 min-w-0">
              <div className="mb-1">
                <h3 className="font-black text-sm">@{profile.username || 'musician'}</h3>
              </div>
              
              {/* Instrument and Location with subtle indicators */}
              <div className="flex items-center gap-3 text-xs text-gray-600">
                <div className="flex items-center gap-1">
                  <Music className="w-3.5 h-3.5" />
                  <span className="font-bold">{profile.main_instrument || 'Musician'}</span>
                  {profile.experience_level && (
                    <span className={`ml-1 text-xs font-black ${
                      profile.experience_level === 'beginner' ? 'text-green-600' :
                      profile.experience_level === 'intermediate' ? 'text-yellow-600' :
                      profile.experience_level === 'advanced' ? 'text-orange-600' :
                      profile.experience_level === 'professional' ? 'text-red-600' :
                      'text-gray-600'
                    }`}>
                      ({profile.experience_level.charAt(0).toUpperCase()})
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  <span className="font-bold">{locationDisplay || 'Planet Earth'}</span>
                  {profile.last_active && (() => {
                    const activeStatus = getLastActiveStatus(profile.last_active)
                    return (
                      <span className={`ml-1 w-2 h-2 rounded-full inline-block ${
                        activeStatus.status === 'online' ? 'bg-green-400' :
                        activeStatus.status === 'recent' ? 'bg-yellow-400' :
                        activeStatus.status === 'hours' ? 'bg-orange-400' :
                        activeStatus.status === 'days' ? 'bg-red-400' :
                        'bg-gray-400'
                      }`} title={activeStatus.text}></span>
                    )
                  })()}
                </div>
              </div>
            </div>

            {/* Action Icons - Horizontal Row */}
            <div className="flex gap-1 flex-shrink-0">
              <Link 
                href={`/profile/${profile.username}`} 
                className="inline-flex items-center justify-center w-8 h-8 bg-blue-400 border-2 border-black hover:bg-blue-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                title={`View ${profile.username}`}
              >
                <Eye className="w-4 h-4 text-black" />
              </Link>
              {currentUser && currentUser.id !== profile.user_id && (
                <button
                  onClick={() => onMessage(profile.user_id)} 
                  className="inline-flex items-center justify-center w-8 h-8 bg-yellow-400 border-2 border-black hover:bg-yellow-500 transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)]"
                  title={`Message ${profile.username}`}
                >
                  <MessageSquare className="w-4 h-4 text-black" />
                </button>
              )}
              {currentUser && (
                <button
                  onClick={() => onSave(profile.id)}
                  className={`inline-flex items-center justify-center w-8 h-8 border-2 border-black transition-colors shadow-[1px_1px_0px_0px_rgba(0,0,0,1)] ${
                    savedProfiles.has(profile.id)
                      ? 'bg-pink-400 hover:bg-pink-500' 
                      : 'bg-white hover:bg-lime-300'
                  }`}
                  title={savedProfiles.has(profile.id) ? 'Remove from saved' : 'Save profile'}
                >
                  <Heart className={`w-4 h-4 text-black ${savedProfiles.has(profile.id) ? 'fill-current' : ''}`} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Desktop Layout - Hidden on mobile */}
        <div className="hidden sm:block">
          {/* Musician Header */}
          <div className="mb-4">
            <div className="flex items-start gap-4 mb-3">
              {/* Profile Photo */}
              <div className="flex-shrink-0">
                {profile.profile_image_url ? (
                  <Image
                    src={profile.profile_image_url}
                    alt={profile.username}
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
                      {(profile.username || 'M').charAt(0).toUpperCase()}
                    </div>
                  </div>
                )}
              </div>

              {/* Name and Username */}
              <div className="flex-1 min-w-0">
                <h3 className="font-black text-xl leading-tight">@{profile.username || 'musician'}</h3>
                <p className="font-bold text-sm text-gray-600">
                  {locationDisplay || 'Planet Earth'}
                </p>
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
            </div>
          </div>

          {/* Bio in highlighted box */}
          <div className="mb-4 p-3 bg-gray-50 border-2 border-black">
            <p className="font-bold text-sm line-clamp-3">
              &quot;{profile.bio || `I'm an awesome musician${locationDisplay ? ` in ${locationDisplay}` : ''} looking to collab! Send me a DM.`}&quot;
            </p>
          </div>

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
      </div>
    </div>
  )
}