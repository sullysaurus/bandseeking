'use client'

import { MapPin, Eye, Plus, Music, Calendar, MessageSquare } from 'lucide-react'
import Link from 'next/link'

interface MusicianCardProps {
  id: string
  name: string
  username: string
  location: string
  instruments: string[]
  genres: string[]
  experienceLevel: string
  bio: string
  lookingFor: string[]
  yearsExperience: number
  availability: 'available' | 'busy' | 'not-looking'
  avatar?: string
}

export default function MusicianCard({ 
  name,
  username,
  location, 
  instruments,
  genres,
  experienceLevel,
  bio,
  lookingFor,
  yearsExperience,
  availability
}: MusicianCardProps) {
  const availabilityConfig = {
    available: { color: 'bg-success/20 text-success', dot: 'bg-success', label: 'Available' },
    busy: { color: 'bg-orange-500/20 text-orange-400', dot: 'bg-orange-400', label: 'Busy' },
    'not-looking': { color: 'bg-complete/20 text-complete', dot: 'bg-complete', label: 'Not Looking' }
  }

  const config = availabilityConfig[availability]
  const mainInstrument = instruments[0] || 'Musician'
  const displayGenres = genres.slice(0, 2)
  const mainLookingFor = lookingFor[0] || 'Opportunities'

  return (
    <div className="bg-card rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 bg-accent-teal rounded-full flex items-center justify-center text-black font-bold text-base md:text-lg">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-lg md:text-xl font-semibold text-white truncate">{name}</h3>
            <p className="text-secondary text-sm truncate">@{username}</p>
            <div className="flex items-center gap-1 text-medium text-sm mt-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate">{location}</span>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${config.color}`}>
          <div className={`w-2 h-2 rounded-full ${config.dot}`} />
          {config.label}
        </div>
      </div>

      {/* Primary Info */}
      <div className="flex items-center gap-2">
        <span className="bg-accent-teal/20 text-accent-teal px-3 py-1 rounded-full text-sm font-medium">
          {mainInstrument}
        </span>
        <span className="bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full text-xs">
          {experienceLevel}
        </span>
        <span className="text-medium text-sm">
          {yearsExperience} years exp
        </span>
      </div>

      {/* Genres */}
      <div className="flex flex-wrap gap-2">
        {displayGenres.map((genre) => (
          <span 
            key={genre}
            className="bg-accent-purple/20 text-accent-purple px-2 py-1 rounded-full text-xs"
          >
            {genre}
          </span>
        ))}
        {genres.length > 2 && (
          <span className="text-medium text-xs px-2 py-1">
            +{genres.length - 2} more
          </span>
        )}
      </div>

      {/* Bio */}
      <p className="text-secondary text-sm leading-relaxed line-clamp-2 md:line-clamp-3">{bio}</p>

      {/* Looking For */}
      <div>
        <div className="text-white text-sm font-medium mb-2">Looking for</div>
        <div className="flex flex-wrap gap-2">
          <span className="bg-success/20 text-success px-2 py-1 rounded-full text-xs">
            {mainLookingFor}
          </span>
          {lookingFor.slice(1, 3).map((item) => (
            <span 
              key={item}
              className="bg-success/20 text-success px-2 py-1 rounded-full text-xs"
            >
              {item}
            </span>
          ))}
          {lookingFor.length > 3 && (
            <span className="text-medium text-xs px-2 py-1">
              +{lookingFor.length - 3} more
            </span>
          )}
        </div>
      </div>

      {/* All Instruments */}
      <div>
        <div className="text-white text-sm font-medium mb-2">Instruments</div>
        <div className="flex flex-wrap gap-1">
          {instruments.slice(0, 4).map((instrument) => (
            <span 
              key={instrument}
              className="bg-accent-teal/10 text-accent-teal px-2 py-1 rounded text-xs border border-accent-teal/20"
            >
              {instrument}
            </span>
          ))}
          {instruments.length > 4 && (
            <span className="text-medium text-xs px-2 py-1">
              +{instruments.length - 4} more
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 md:gap-3 pt-2">
        <Link 
          href={`/profile/${username}`}
          className="flex-1 bg-button-secondary hover:bg-opacity-80 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Profile
        </Link>
        {availability === 'available' ? (
          <button className="flex-1 bg-accent-teal hover:bg-opacity-90 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Contact
          </button>
        ) : (
          <button className="flex-1 bg-complete text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2" disabled>
            <MessageSquare className="w-4 h-4" />
            {availability === 'busy' ? 'Busy' : 'Unavailable'}
          </button>
        )}
      </div>
    </div>
  )
}