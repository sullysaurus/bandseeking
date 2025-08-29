'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Plus, MapPin, Music, Globe, Mail } from 'lucide-react'

interface SuggestVenueModalProps {
  onClose: () => void
}

type VenueType = 'music_venue' | 'brewery' | 'coffee_shop' | 'restaurant' | 'bar' | 'event_space' | 'amphitheater' | 'theater' | 'arena'

const VENUE_TYPES: { value: VenueType; label: string }[] = [
  { value: 'music_venue', label: 'Music Venue' },
  { value: 'brewery', label: 'Brewery' },
  { value: 'coffee_shop', label: 'Coffee Shop' },
  { value: 'restaurant', label: 'Restaurant' },
  { value: 'bar', label: 'Bar' },
  { value: 'event_space', label: 'Event Space' },
  { value: 'amphitheater', label: 'Amphitheater' },
  { value: 'theater', label: 'Theater' },
  { value: 'arena', label: 'Arena' }
]

const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

export default function SuggestVenueModal({ onClose }: SuggestVenueModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    venue_type: '' as VenueType | '',
    website: '',
    contact_email: '',
    description: '',
    capacity: '',
    notes: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.city || !formData.state || !formData.venue_type) {
      alert('Please fill in all required fields (name, city, state, type)')
      return
    }

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      // Create a venue suggestion record - this could go to a separate table
      const suggestionData = {
        name: formData.name.trim(),
        address: formData.address.trim() || null,
        city: formData.city.trim(),
        state: formData.state,
        zip_code: formData.zip_code.trim() || null,
        venue_type: formData.venue_type,
        website: formData.website.trim() || null,
        contact_email: formData.contact_email.trim() || null,
        description: formData.description.trim() || null,
        capacity: formData.capacity ? parseInt(formData.capacity) : null,
        // Add metadata for suggestions
        suggested_by: user?.id || null,
        suggestion_notes: formData.notes.trim() || null,
        status: 'pending' // This would be handled by admin
      }

      // Create a venue report with 'other' reason and special description format
      const { error } = await supabase
        .from('venue_reports')
        .insert({
          venue_id: null, // No existing venue
          reporter_id: user?.id || null,
          reason: 'other',
          description: `[VENUE SUGGESTION] ${suggestionData.name}

VENUE DETAILS:
- Name: ${suggestionData.name}
- Type: ${suggestionData.venue_type}
- Address: ${suggestionData.address || 'Not provided'}
- City: ${suggestionData.city}
- State: ${suggestionData.state}
- ZIP: ${suggestionData.zip_code || 'Not provided'}
- Website: ${suggestionData.website || 'Not provided'}
- Email: ${suggestionData.contact_email || 'Not provided'}
- Capacity: ${suggestionData.capacity || 'Not provided'}
- Description: ${suggestionData.description || 'Not provided'}

ADDITIONAL NOTES:
${suggestionData.suggestion_notes || 'None provided'}

This is a venue suggestion submitted by a user.`
        })

      if (error) throw error

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting suggestion:', error)
      alert('Error submitting suggestion. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (field: keyof typeof formData) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData(prev => ({ ...prev, [field]: e.target.value }))
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-400 border-2 border-black rounded-full flex items-center justify-center">
              <Plus className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-black mb-2">SUGGESTION SUBMITTED!</h3>
            <p className="text-gray-600 mb-6">
              Thanks for suggesting a venue! Our team will review it and add it to the database if it meets our criteria.
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-400 border-2 border-black font-black text-black hover:bg-blue-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
            >
              CLOSE
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-400 border-2 border-black">
              <Plus className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black">SUGGEST A VENUE</h2>
              <p className="text-sm text-gray-600">Help us grow the database</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Venue Name */}
            <div className="md:col-span-2">
              <label className="block font-black text-sm mb-2">
                VENUE NAME *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={handleChange('name')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="The Blue Note"
                required
              />
            </div>

            {/* Venue Type */}
            <div>
              <label className="block font-black text-sm mb-2">
                TYPE *
              </label>
              <select
                value={formData.venue_type}
                onChange={handleChange('venue_type')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                required
              >
                <option value="">Select type...</option>
                {VENUE_TYPES.map(type => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Capacity */}
            <div>
              <label className="block font-black text-sm mb-2">
                CAPACITY
              </label>
              <input
                type="number"
                value={formData.capacity}
                onChange={handleChange('capacity')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="500"
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className="block font-black text-sm mb-2">
                ADDRESS
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={handleChange('address')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="131 W 3rd St"
              />
            </div>

            {/* City */}
            <div>
              <label className="block font-black text-sm mb-2">
                CITY *
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={handleChange('city')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="New York"
                required
              />
            </div>

            {/* State */}
            <div>
              <label className="block font-black text-sm mb-2">
                STATE *
              </label>
              <select
                value={formData.state}
                onChange={handleChange('state')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                required
              >
                <option value="">Select state...</option>
                {US_STATES.map(state => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </select>
            </div>

            {/* Website */}
            <div>
              <label className="block font-black text-sm mb-2">
                WEBSITE
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={handleChange('website')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="https://thebluenote.net"
              />
            </div>

            {/* Contact Email */}
            <div>
              <label className="block font-black text-sm mb-2">
                CONTACT EMAIL
              </label>
              <input
                type="email"
                value={formData.contact_email}
                onChange={handleChange('contact_email')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors"
                placeholder="booking@venue.com"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block font-black text-sm mb-2">
                DESCRIPTION
              </label>
              <textarea
                value={formData.description}
                onChange={handleChange('description')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
                rows={3}
                placeholder="Legendary jazz club in Greenwich Village..."
                maxLength={500}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.description.length}/500 characters
              </div>
            </div>

            {/* Additional Notes */}
            <div className="md:col-span-2">
              <label className="block font-black text-sm mb-2">
                ADDITIONAL NOTES
              </label>
              <textarea
                value={formData.notes}
                onChange={handleChange('notes')}
                className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
                rows={2}
                placeholder="Any additional information for our review team..."
                maxLength={300}
              />
              <div className="text-xs text-gray-500 mt-1">
                {formData.notes.length}/300 characters
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border-2 border-gray-300 font-black text-gray-700 hover:bg-gray-100 transition-colors"
              disabled={isSubmitting}
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-3 bg-purple-400 border-2 border-black font-black text-black hover:bg-purple-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUGGEST VENUE'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}