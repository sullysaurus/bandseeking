'use client'

import { MapPin, Eye, MessageSquare, Clock, Activity } from 'lucide-react'
import Link from 'next/link'
import { Profile } from '@/lib/profiles'
import { getActivityStatus, getResponseSpeedInfo } from '@/lib/activity-utils'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface MusicianCardProps {
  profile: Profile
  onContact?: () => void
}

export default function MusicianCard({ profile, onContact }: MusicianCardProps) {
  const [isContacting, setIsContacting] = useState(false)
  const router = useRouter()

  const activityStatus = getActivityStatus(profile.last_active_at)
  const responseInfo = getResponseSpeedInfo(profile.response_time_type, profile.avg_response_minutes)
  
  const mainInstrument = profile.instruments[0] || 'Musician'
  const displayGenres = profile.genres.slice(0, 2)
  const mainLookingFor = profile.looking_for[0] || 'Opportunities'

  const handleContact = async () => {
    if (onContact) {
      onContact()
      return
    }

    setIsContacting(true)
    try {
      console.log('Starting conversation with:', profile.username || profile.id)
      // Direct to private conversation with this user
      router.push(`/messages?user=${profile.id}`)
    } catch (error) {
      console.error('Error navigating to chat:', error)
    } finally {
      setIsContacting(false)
    }
  }

  return (
    <div className="bg-card rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold text-base md:text-lg">
            {profile.full_name?.charAt(0).toUpperCase() || profile.username.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-white truncate">{profile.full_name || profile.username}</h3>
            <p className="text-secondary text-sm truncate">@{profile.username}</p>
            {profile.location && (
              <div className="flex items-center gap-1 text-medium text-sm mt-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate">{profile.location}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end gap-1">
          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs ${activityStatus.color}`}>
            <Activity className="w-3 h-3" />
            {activityStatus.label}
          </div>
        </div>
      </div>

      {/* Primary Info */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="bg-accent-teal/20 text-accent-teal px-3 py-1 rounded-full text-sm font-medium">
          {mainInstrument}
        </span>
        {profile.experience_level && (
          <span className="bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full text-xs">
            {profile.experience_level}
          </span>
        )}
      </div>

      {/* Response Time Info */}
      <div className={`flex items-center gap-1 text-xs ${responseInfo.color}`}>
        <Clock className="w-3 h-3" />
        <span>{responseInfo.icon} {responseInfo.label}</span>
      </div>

      {/* Genres */}
      {profile.genres.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {displayGenres.map((genre) => (
            <span 
              key={genre}
              className="bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full text-xs"
            >
              {genre}
            </span>
          ))}
          {profile.genres.length > 2 && (
            <span className="text-medium text-xs px-2 py-1">
              +{profile.genres.length - 2} more
            </span>
          )}
        </div>
      )}

      {/* Bio */}
      {profile.bio && (
        <p className="text-secondary text-sm leading-relaxed line-clamp-2 md:line-clamp-3">{profile.bio}</p>
      )}

      {/* Looking For */}
      {profile.looking_for.length > 0 && (
        <div>
          <div className="text-white text-sm font-medium mb-2">Looking for</div>
          <div className="flex flex-wrap gap-2">
            <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs">
              {mainLookingFor}
            </span>
            {profile.looking_for.slice(1, 3).map((item) => (
              <span 
                key={item}
                className="bg-success/20 text-success px-2 py-1 rounded-full text-xs"
              >
                {item}
              </span>
            ))}
            {profile.looking_for.length > 3 && (
              <span className="text-medium text-xs px-2 py-1">
                +{profile.looking_for.length - 3} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* All Instruments */}
      {profile.instruments.length > 0 && (
        <div>
          <div className="text-white text-sm font-medium mb-2">Instruments</div>
          <div className="flex flex-wrap gap-1">
            {profile.instruments.slice(0, 4).map((instrument) => (
              <span 
                key={instrument}
                className="bg-accent-teal/10 text-accent-teal px-2 py-1 rounded text-xs border border-accent-teal/20"
              >
                {instrument}
              </span>
            ))}
            {profile.instruments.length > 4 && (
              <span className="text-medium text-xs px-2 py-1">
                +{profile.instruments.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 md:gap-3 pt-2">
        <Link 
          href={`/profile/${profile.username}`}
          className="flex-1 bg-button-secondary hover:bg-opacity-80 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Profile
        </Link>
        <button 
          onClick={handleContact}
          disabled={isContacting}
          className="flex-1 bg-accent-teal hover:bg-opacity-90 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
        >
          <MessageSquare className="w-4 h-4" />
          {isContacting ? 'Messaging...' : 'Message'}
        </button>
      </div>
    </div>
  )
}