'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Save, Plus, Trash2 } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']
type VenueType = Venue['venue_type']

const VENUE_TYPES: VenueType[] = [
  'music_venue',
  'brewery', 
  'coffee_shop',
  'restaurant',
  'bar',
  'event_space',
  'amphitheater',
  'theater',
  'arena'
]

const SOCIAL_PLATFORMS = [
  'Instagram',
  'Facebook',
  'Twitter',
  'TikTok',
  'YouTube',
  'LinkedIn'
]

interface VenueFormProps {
  venue: Venue | null
  onClose: () => void
}

export default function VenueForm({ venue, onClose }: VenueFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: 'NC',
    zip_code: '',
    capacity: '',
    venue_type: 'music_venue' as VenueType,
    website: '',
    social_platform: '',
    social_handle: '',
    contact_email: '',
    description: '',
    booking_info: '',
    genres: [] as string[]
  })
  const [genres, setGenres] = useState<string[]>([])
  const [newGenre, setNewGenre] = useState('')
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (venue) {
      setFormData({
        name: venue.name || '',
        address: venue.address || '',
        city: venue.city || '',
        state: venue.state || 'NC',
        zip_code: venue.zip_code || '',
        capacity: venue.capacity?.toString() || '',
        venue_type: venue.venue_type || 'music_venue',
        website: venue.website || '',
        social_platform: venue.social_platform || '',
        social_handle: venue.social_handle || '',
        contact_email: venue.contact_email || '',
        description: venue.description || '',
        booking_info: venue.booking_info || '',
        genres: venue.genres || []
      })
      setGenres(venue.genres || [])
    }
  }, [venue])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Venue name is required'
    }
    if (!formData.address.trim()) {
      newErrors.address = 'Address is required'
    }
    if (!formData.city.trim()) {
      newErrors.city = 'City is required'
    }
    if (!formData.zip_code.trim()) {
      newErrors.zip_code = 'Zip code is required'
    }
    if (formData.capacity && isNaN(Number(formData.capacity))) {
      newErrors.capacity = 'Capacity must be a valid number'
    }
    if (formData.contact_email && !formData.contact_email.includes('@')) {
      newErrors.contact_email = 'Please enter a valid email address'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const venueData = {
        ...formData,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        genres,
        website: formData.website || null,
        social_platform: formData.social_platform || null,
        social_handle: formData.social_handle || null,
        contact_email: formData.contact_email || null,
        description: formData.description || null,
        booking_info: formData.booking_info || null
      }

      if (venue) {
        // Update existing venue
        const { error } = await supabase
          .from('venues')
          .update(venueData)
          .eq('id', venue.id)

        if (error) throw error
      } else {
        // Create new venue
        const { error } = await supabase
          .from('venues')
          .insert([venueData])

        if (error) throw error
      }

      onClose()
    } catch (error) {
      console.error('Error saving venue:', error)
      setErrors({ submit: 'Failed to save venue. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  const addGenre = () => {
    if (newGenre.trim() && !genres.includes(newGenre.trim())) {
      const updatedGenres = [...genres, newGenre.trim()]
      setGenres(updatedGenres)
      setNewGenre('')
    }
  }

  const removeGenre = (genre: string) => {
    setGenres(genres.filter(g => g !== genre))
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b-4 border-black p-6 flex justify-between items-center">
          <h2 className="text-2xl font-black">
            {venue ? 'EDIT VENUE' : 'ADD NEW VENUE'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="bg-red-100 border-2 border-red-300 text-red-800 px-4 py-3 rounded font-bold">
              {errors.submit}
            </div>
          )}

          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                VENUE NAME *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.name ? 'border-red-300' : 'border-gray-300 focus:border-black'
                }`}
                placeholder="e.g., The Ritz"
              />
              {errors.name && <p className="text-red-600 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                VENUE TYPE *
              </label>
              <select
                value={formData.venue_type}
                onChange={(e) => handleInputChange('venue_type', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              >
                {VENUE_TYPES.map(type => (
                  <option key={type} value={type}>
                    {type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">
              ADDRESS *
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                errors.address ? 'border-red-300' : 'border-gray-300 focus:border-black'
              }`}
              placeholder="e.g., 2820 Industrial Dr"
            />
            {errors.address && <p className="text-red-600 text-sm mt-1">{errors.address}</p>}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                CITY *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => handleInputChange('city', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.city ? 'border-red-300' : 'border-gray-300 focus:border-black'
                }`}
                placeholder="e.g., Raleigh"
              />
              {errors.city && <p className="text-red-600 text-sm mt-1">{errors.city}</p>}
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                STATE
              </label>
              <input
                type="text"
                value={formData.state}
                onChange={(e) => handleInputChange('state', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="e.g., NC"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                ZIP CODE *
              </label>
              <input
                type="text"
                value={formData.zip_code}
                onChange={(e) => handleInputChange('zip_code', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.zip_code ? 'border-red-300' : 'border-gray-300 focus:border-black'
                }`}
                placeholder="e.g., 27609"
              />
              {errors.zip_code && <p className="text-red-600 text-sm mt-1">{errors.zip_code}</p>}
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">
              CAPACITY
            </label>
            <input
              type="number"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                errors.capacity ? 'border-red-300' : 'border-gray-300 focus:border-black'
              }`}
              placeholder="e.g., 1400"
            />
            {errors.capacity && <p className="text-red-600 text-sm mt-1">{errors.capacity}</p>}
          </div>

          {/* Contact Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                WEBSITE
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="e.g., https://www.theritzraleigh.com"
              />
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                CONTACT EMAIL
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={(e) => handleInputChange('contact_email', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors ${
                  errors.contact_email ? 'border-red-300' : 'border-gray-300 focus:border-black'
                }`}
                placeholder="e.g., booking@venue.com"
              />
              {errors.contact_email && <p className="text-red-600 text-sm mt-1">{errors.contact_email}</p>}
            </div>
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                SOCIAL PLATFORM
              </label>
              <select
                value={formData.social_platform}
                onChange={(e) => handleInputChange('social_platform', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              >
                <option value="">Select platform</option>
                {SOCIAL_PLATFORMS.map(platform => (
                  <option key={platform} value={platform}>{platform}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-black text-gray-900 mb-2">
                SOCIAL HANDLE
              </label>
              <input
                type="text"
                value={formData.social_handle}
                onChange={(e) => handleInputChange('social_handle', e.target.value)}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="e.g., @theritzraleigh"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">
              DESCRIPTION
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              placeholder="Describe the venue, atmosphere, and what makes it special..."
            />
          </div>

          {/* Booking Info */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">
              BOOKING INFO
            </label>
            <textarea
              value={formData.booking_info}
              onChange={(e) => handleInputChange('booking_info', e.target.value)}
              rows={3}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
              placeholder="Information about booking shows at this venue..."
            />
          </div>

          {/* Genres */}
          <div>
            <label className="block text-sm font-black text-gray-900 mb-2">
              GENRES
            </label>
            
            {/* Current genres */}
            <div className="flex flex-wrap gap-2 mb-4">
              {genres.map((genre, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 rounded font-bold text-sm flex items-center gap-2"
                >
                  {genre}
                  <button
                    type="button"
                    onClick={() => removeGenre(genre)}
                    className="hover:text-red-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Add genre */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newGenre}
                onChange={(e) => setNewGenre(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addGenre())}
                className="flex-1 px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
                placeholder="e.g., Rock, Jazz, Electronic"
              />
              <button
                type="button"
                onClick={addGenre}
                className="px-4 py-2 bg-blue-400 border-2 border-black font-black text-sm hover:bg-blue-500 transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end gap-4 pt-6 border-t-2 border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 border-2 border-black font-black text-black hover:bg-gray-300 transition-colors"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-400 border-2 border-black font-black text-black hover:bg-green-500 transition-colors disabled:bg-gray-200 disabled:text-gray-400 flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-black"></div>
                  SAVING...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  {venue ? 'UPDATE VENUE' : 'CREATE VENUE'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}