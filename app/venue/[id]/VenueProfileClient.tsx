'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { 
  MapPin, 
  Globe, 
  Mail, 
  Users, 
  Music, 
  Share2, 
  Heart,
  Instagram,
  Facebook,
  Twitter,
  ArrowLeft,
  Flag,
  ExternalLink
} from 'lucide-react'
import Link from 'next/link'
import ReportVenueModal from '@/components/ReportVenueModal'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']

interface VenueProfileClientProps {
  venue: Venue
}

export default function VenueProfileClient({ venue }: VenueProfileClientProps) {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showReportModal, setShowReportModal] = useState(false)
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    checkAuthAndSavedStatus()
  }, [venue.id])

  const checkAuthAndSavedStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data } = await supabase
          .from('saved_venues')
          .select('id')
          .eq('user_id', user.id)
          .eq('saved_venue_id', venue.id)
          .single()
        
        setIsSaved(!!data)
      }
    } catch (error) {
      console.error('Error checking saved status:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    if (!user) {
      alert('Please log in to save venues')
      return
    }

    try {
      if (isSaved) {
        const { error } = await supabase
          .from('saved_venues')
          .delete()
          .eq('user_id', user.id)
          .eq('saved_venue_id', venue.id)

        if (error) throw error
        setIsSaved(false)
      } else {
        const { error } = await supabase
          .from('saved_venues')
          .insert({
            user_id: user.id,
            saved_venue_id: venue.id
          })

        if (error) throw error
        setIsSaved(true)
      }
    } catch (error) {
      console.error('Error updating saved status:', error)
      alert('Error updating saved status. Please try again.')
    }
  }

  const handleShare = async () => {
    const shareData = {
      title: `${venue.name} | BandSeeking`,
      text: `Check out ${venue.name} - ${venue.venue_type.replace('_', ' ')} in ${venue.city}, ${venue.state}`,
      url: window.location.href,
    }

    try {
      if (navigator.share && navigator.canShare(shareData)) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(window.location.href)
        alert('Venue URL copied to clipboard!')
      }
    } catch (error) {
      console.error('Error sharing venue:', error)
      try {
        await navigator.clipboard.writeText(window.location.href)
        alert('Venue URL copied to clipboard!')
      } catch (clipboardError) {
        console.error('Error copying to clipboard:', clipboardError)
      }
    }
  }

  const formatVenueType = (type: string) => {
    return type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  const getSocialIcon = (platform: string) => {
    const platformLower = platform.toLowerCase()
    if (platformLower.includes('instagram')) return <Instagram className="w-5 h-5" />
    if (platformLower.includes('facebook')) return <Facebook className="w-5 h-5" />
    if (platformLower.includes('twitter') || platformLower.includes('x.com')) return <Twitter className="w-5 h-5" />
    return <Globe className="w-5 h-5" />
  }

  const getSocialUrl = (platform: string, handle: string) => {
    const platformLower = platform.toLowerCase()
    const cleanHandle = handle.replace('@', '')
    
    if (platformLower.includes('instagram')) return `https://instagram.com/${cleanHandle}`
    if (platformLower.includes('facebook')) return `https://facebook.com/${cleanHandle}`
    if (platformLower.includes('twitter')) return `https://twitter.com/${cleanHandle}`
    if (platformLower.includes('x.com')) return `https://x.com/${cleanHandle}`
    
    return handle.startsWith('http') ? handle : `https://${handle}`
  }

  return (
    <div className="min-h-screen bg-lime-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Navigation */}
        <div className="mb-6">
          <Link 
            href="/venues"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border-4 border-black font-black text-black hover:bg-gray-100 transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
          >
            <ArrowLeft className="w-4 h-4" />
            BACK TO VENUES
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Header */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-gray-900 mb-2">
                    {venue.name}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{venue.city}, {venue.state}</span>
                    </div>
                    {venue.capacity && (
                      <div className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        <span>{venue.capacity.toLocaleString()} capacity</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-blue-400 border-2 border-black font-black text-black hover:bg-blue-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                  >
                    <Share2 className="w-4 h-4" />
                    SHARE
                  </button>
                  
                  {user && (
                    <button
                      onClick={handleSave}
                      disabled={isLoading}
                      className={`px-4 py-2 border-2 border-black font-black transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2 ${
                        isSaved
                          ? 'bg-pink-400 text-black hover:bg-pink-500'
                          : 'bg-gray-200 text-black hover:bg-gray-300'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                      {isSaved ? 'SAVED' : 'SAVE'}
                    </button>
                  )}

                  <button
                    onClick={() => setShowReportModal(true)}
                    className="px-4 py-2 bg-red-300 border-2 border-black font-black text-black hover:bg-red-400 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] flex items-center gap-2"
                  >
                    <Flag className="w-4 h-4" />
                    REPORT
                  </button>
                </div>
              </div>

              {/* Venue Type Badge */}
              <div className="mb-6">
                <span className="px-3 py-1 text-sm font-black bg-cyan-400 text-black border-2 border-black rounded-full">
                  {formatVenueType(venue.venue_type)}
                </span>
              </div>

              {/* Description */}
              {venue.description && (
                <div className="mb-6">
                  <h3 className="text-xl font-black mb-3">ABOUT</h3>
                  <p className="text-gray-700 leading-relaxed">{venue.description}</p>
                </div>
              )}

              {/* Genres */}
              {venue.genres && venue.genres.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-black mb-3">MUSIC GENRES</h3>
                  <div className="flex flex-wrap gap-2">
                    {venue.genres.map((genre, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 text-sm font-bold bg-purple-200 text-purple-800 border border-purple-400 rounded"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Booking Info */}
              {venue.booking_info && (
                <div>
                  <h3 className="text-xl font-black mb-3">BOOKING INFORMATION</h3>
                  <p className="text-gray-700 leading-relaxed">{venue.booking_info}</p>
                </div>
              )}
            </div>

            {/* Map Section */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
              <h3 className="text-xl font-black mb-4">LOCATION</h3>
              <div className="mb-4">
                <p className="text-gray-700 font-medium">
                  {venue.address}<br />
                  {venue.city}, {venue.state} {venue.zip_code}
                </p>
              </div>
              
              {/* Map Placeholder - Google Maps requires valid API key */}
              <div className="border-2 border-gray-300 rounded-lg bg-gray-100 flex items-center justify-center h-[300px]">
                <div className="text-center p-8">
                  <MapPin className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h4 className="text-lg font-black mb-2">MAP LOCATION</h4>
                  <p className="text-gray-600 mb-4">
                    {venue.address}<br />
                    {venue.city}, {venue.state} {venue.zip_code}
                  </p>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue.address + ', ' + venue.city + ', ' + venue.state + ' ' + venue.zip_code)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-400 border-2 border-black font-black text-black hover:bg-blue-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                  >
                    <MapPin className="w-4 h-4" />
                    OPEN IN GOOGLE MAPS
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
              <h3 className="text-xl font-black mb-4">CONTACT</h3>
              <div className="space-y-4">
                {venue.contact_email && (
                  <a
                    href={`mailto:${venue.contact_email}`}
                    className="flex items-center gap-3 p-3 bg-yellow-100 border-2 border-yellow-400 hover:bg-yellow-200 transition-colors"
                  >
                    <Mail className="w-5 h-5 text-yellow-700" />
                    <div>
                      <div className="font-bold text-sm text-yellow-800">EMAIL</div>
                      <div className="text-sm text-yellow-700">{venue.contact_email}</div>
                    </div>
                  </a>
                )}

                {venue.website && (
                  <a
                    href={venue.website.startsWith('http') ? venue.website : `https://${venue.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-blue-100 border-2 border-blue-400 hover:bg-blue-200 transition-colors"
                  >
                    <Globe className="w-5 h-5 text-blue-700" />
                    <div className="flex-1">
                      <div className="font-bold text-sm text-blue-800">WEBSITE</div>
                      <div className="text-sm text-blue-700 truncate">Visit Website</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-blue-600" />
                  </a>
                )}

                {venue.social_platform && venue.social_handle && (
                  <a
                    href={getSocialUrl(venue.social_platform, venue.social_handle)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-pink-100 border-2 border-pink-400 hover:bg-pink-200 transition-colors"
                  >
                    {getSocialIcon(venue.social_platform)}
                    <div className="flex-1">
                      <div className="font-bold text-sm text-pink-800 uppercase">
                        {venue.social_platform}
                      </div>
                      <div className="text-sm text-pink-700">{venue.social_handle}</div>
                    </div>
                    <ExternalLink className="w-4 h-4 text-pink-600" />
                  </a>
                )}

                {!venue.contact_email && !venue.website && !venue.social_handle && (
                  <div className="text-center py-6 text-gray-500">
                    <Music className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No contact information available</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6">
              <h3 className="text-xl font-black mb-4">QUICK STATS</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b-2 border-gray-200">
                  <span className="font-bold text-sm">TYPE</span>
                  <span className="text-sm">{formatVenueType(venue.venue_type)}</span>
                </div>
                
                <div className="flex justify-between items-center py-2 border-b-2 border-gray-200">
                  <span className="font-bold text-sm">CAPACITY</span>
                  <span className="text-sm">
                    {venue.capacity ? venue.capacity.toLocaleString() : 'Not specified'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b-2 border-gray-200">
                  <span className="font-bold text-sm">LOCATION</span>
                  <span className="text-sm">{venue.city}, {venue.state}</span>
                </div>

                {venue.genres && venue.genres.length > 0 && (
                  <div className="flex justify-between items-center py-2">
                    <span className="font-bold text-sm">GENRES</span>
                    <span className="text-sm">{venue.genres.length} genres</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Report Modal */}
      {showReportModal && (
        <ReportVenueModal
          venueId={venue.id}
          venueName={venue.name}
          onClose={() => setShowReportModal(false)}
        />
      )}
    </div>
  )
}