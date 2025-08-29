'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Globe, Mail, Users, Music, Coffee, Beer, Flag, Heart, Instagram } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { trackSave } from '@/components/FacebookPixel'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']

interface VenueCardProps {
  venue: Venue
  onReport?: (venueId: string, venueName: string) => void
  onSelect?: (venueId: string) => void
  isSelected?: boolean
}

const venueTypeColors: Record<Venue['venue_type'], string> = {
  music_venue: 'bg-purple-400 text-white border-black',
  brewery: 'bg-amber-400 text-black border-black',
  coffee_shop: 'bg-orange-400 text-white border-black',
  restaurant: 'bg-green-400 text-black border-black',
  bar: 'bg-blue-400 text-white border-black',
  event_space: 'bg-pink-400 text-black border-black',
  amphitheater: 'bg-red-400 text-white border-black',
  theater: 'bg-indigo-400 text-white border-black',
  arena: 'bg-cyan-400 text-black border-black'
}

const venueTypeLabels: Record<Venue['venue_type'], string> = {
  music_venue: 'Music Venue',
  brewery: 'Brewery',
  coffee_shop: 'Coffee Shop',
  restaurant: 'Restaurant',
  bar: 'Bar',
  event_space: 'Event Space',
  amphitheater: 'Amphitheater',
  theater: 'Theater',
  arena: 'Arena'
}

const venueTypeIcons: Record<Venue['venue_type'], React.ReactNode> = {
  music_venue: <Music className="w-3 h-3" />,
  brewery: <Beer className="w-3 h-3" />,
  coffee_shop: <Coffee className="w-3 h-3" />,
  restaurant: <Music className="w-3 h-3" />,
  bar: <Beer className="w-3 h-3" />,
  event_space: <Music className="w-3 h-3" />,
  amphitheater: <Music className="w-3 h-3" />,
  theater: <Music className="w-3 h-3" />,
  arena: <Music className="w-3 h-3" />
}

export default function VenueCard({ venue, onReport, onSelect, isSelected = false }: VenueCardProps) {
  const router = useRouter()
  const [currentUser, setCurrentUser] = useState<any>(null)
  const [isSaved, setIsSaved] = useState(false)

  useEffect(() => {
    getCurrentUser()
  }, [])

  const getCurrentUser = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser()
    setCurrentUser(authUser)
    
    if (authUser && venue) {
      const { data } = await supabase
        .from('saved_venues')
        .select('*')
        .eq('user_id', authUser.id)
        .eq('saved_venue_id', venue.id)
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
        .from('saved_venues')
        .delete()
        .eq('user_id', currentUser.id)
        .eq('saved_venue_id', venue.id)
    } else {
      await supabase
        .from('saved_venues')
        .insert({
          user_id: currentUser.id,
          saved_venue_id: venue.id
        })
      
      // Track save action for Facebook Pixel
      trackSave('venue')
    }
    setIsSaved(!isSaved)
  }

  const formatCapacity = () => {
    if (venue.capacity) {
      return venue.capacity.toString()
    }
    return 'Variable'
  }

  return (
    <div className={`bg-white rounded-xl border-4 ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-black'} shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] transition-all duration-200 overflow-hidden group relative`}>
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => onSelect(venue.id)}
            className="w-4 h-4 text-blue-600 bg-white border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
          />
        </div>
      )}
      
      {/* Header with venue type badge */}
      <div className="p-4 border-b-4 border-black bg-gradient-to-r from-yellow-200 to-lime-200">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-xl font-black ${isSelected ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'} transition-colors ${onSelect ? 'ml-6' : ''}`}>
            {venue.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-black border-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${venueTypeColors[venue.venue_type]}`}>
              {venueTypeIcons[venue.venue_type]}
              {venueTypeLabels[venue.venue_type]}
            </span>
            <button
              onClick={handleSave}
              className={`p-1 rounded transition-colors ${
                isSaved 
                  ? 'text-red-600 hover:text-red-700 hover:bg-red-50' 
                  : 'text-gray-400 hover:text-red-600 hover:bg-red-50'
              }`}
              title={isSaved ? "Remove from saved venues" : "Save venue"}
            >
              <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
            </button>
            {onReport && (
              <button
                onClick={() => {
                  if (!currentUser) {
                    router.push('/auth/login')
                    return
                  }
                  onReport(venue.id, venue.name)
                }}
                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                title={currentUser ? "Report inaccurate information" : "Sign in to report inaccurate information"}
              >
                <Flag className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
        
        {/* Location and Capacity Tags */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-cyan-400 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <MapPin className="w-3 h-3" />
            {venue.city.toUpperCase()}, {venue.state}
          </span>
          <span className="inline-flex items-center gap-1 px-2 py-1 bg-lime-400 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
            <Users className="w-3 h-3" />
            {formatCapacity().toUpperCase()}
          </span>
        </div>
      </div>

      {/* Description */}
      {venue.description && (
        <div className="p-4 border-b-2 border-black bg-gradient-to-r from-pink-100 to-yellow-100">
          <p className="text-sm text-gray-800 font-bold line-clamp-3">
            &quot;{venue.description}&quot;
          </p>
        </div>
      )}

      {/* Genres */}
      {venue.genres && venue.genres.length > 0 && (
        <div className="px-4 py-3 border-b-2 border-black bg-gradient-to-r from-cyan-100 to-blue-100">
          <p className="text-xs font-black mb-2 text-gray-700">GENRES:</p>
          <div className="flex flex-wrap gap-1">
            {venue.genres.slice(0, 4).map((genre, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 bg-purple-300 text-black text-xs font-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
              >
                {genre.toUpperCase()}
              </span>
            ))}
            {venue.genres.length > 4 && (
              <span className="inline-block px-2 py-1 bg-gray-200 text-gray-700 text-xs font-black border-2 border-black">
                +{venue.genres.length - 4} MORE
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="p-4 bg-gradient-to-r from-orange-100 to-red-100 space-y-2">
        {/* Website */}
        {venue.website && (
          <a
            href={venue.website}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Globe className="w-4 h-4 mr-2" />
            <span className="truncate">{venue.website.replace(/^https?:\/\//, '')}</span>
          </a>
        )}

        {/* Email */}
        {venue.contact_email && (
          <a
            href={`mailto:${venue.contact_email}`}
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Mail className="w-4 h-4 mr-2" />
            <span className="truncate">{venue.contact_email}</span>
          </a>
        )}

        {/* Social */}
        {venue.social_handle && venue.social_platform && (
          <a
            href={`https://www.instagram.com/${venue.social_handle.replace('@', '')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Instagram className="w-4 h-4 mr-2" />
            <span className="truncate">{venue.social_handle}</span>
          </a>
        )}

        {/* Address */}
        <div className="pt-2 border-t border-gray-200">
          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(venue.address + ', ' + venue.city + ', ' + venue.state + ' ' + venue.zip_code)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-gray-600 hover:text-gray-800 transition-colors flex items-start"
          >
            <MapPin className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
            <span>{venue.address}, {venue.city}, {venue.state} {venue.zip_code}</span>
          </a>
        </div>
      </div>
    </div>
  )
}