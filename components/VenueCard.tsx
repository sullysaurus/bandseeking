'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, Globe, Mail, Users, Music, Coffee, Beer, Flag, Heart } from 'lucide-react'
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
  music_venue: 'bg-purple-100 text-purple-800 border-purple-300',
  brewery: 'bg-amber-100 text-amber-800 border-amber-300',
  coffee_shop: 'bg-orange-100 text-orange-800 border-orange-300',
  restaurant: 'bg-green-100 text-green-800 border-green-300',
  bar: 'bg-blue-100 text-blue-800 border-blue-300',
  event_space: 'bg-pink-100 text-pink-800 border-pink-300',
  amphitheater: 'bg-red-100 text-red-800 border-red-300',
  theater: 'bg-indigo-100 text-indigo-800 border-indigo-300',
  arena: 'bg-gray-100 text-gray-800 border-gray-300'
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
      <div className="p-4 border-b-4 border-black bg-gradient-to-r from-gray-50 to-white">
        <div className="flex justify-between items-start mb-2">
          <h3 className={`text-xl font-bold ${isSelected ? 'text-blue-600' : 'text-gray-900 group-hover:text-blue-600'} transition-colors ${onSelect ? 'ml-6' : ''}`}>
            {venue.name}
          </h3>
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border-2 ${venueTypeColors[venue.venue_type]}`}>
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
        
        {/* Location */}
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <MapPin className="w-4 h-4 mr-1" />
          {venue.city}, {venue.state}
        </div>

        {/* Capacity */}
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-1" />
          Capacity: {formatCapacity()}
        </div>
      </div>

      {/* Description */}
      {venue.description && (
        <div className="p-4 border-b-2 border-gray-200">
          <p className="text-sm text-gray-700 line-clamp-3">
            {venue.description}
          </p>
        </div>
      )}

      {/* Genres */}
      {venue.genres && venue.genres.length > 0 && (
        <div className="px-4 py-3 border-b-2 border-gray-200">
          <div className="flex flex-wrap gap-1">
            {venue.genres.slice(0, 4).map((genre, idx) => (
              <span
                key={idx}
                className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md border border-gray-300"
              >
                {genre}
              </span>
            ))}
            {venue.genres.length > 4 && (
              <span className="inline-block px-2 py-1 text-gray-500 text-xs">
                +{venue.genres.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Contact Info */}
      <div className="p-4 bg-gray-50 space-y-2">
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
            <span className="truncate">{venue.social_handle} ({venue.social_platform})</span>
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