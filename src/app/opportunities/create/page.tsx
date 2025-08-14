'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Calendar, MapPin, DollarSign, Clock, User, Mail, Phone, ExternalLink } from 'lucide-react'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { opportunityService, CreateOpportunityData } from '@/lib/opportunities'
import { MUSIC_GENRES, COMMON_INSTRUMENTS } from '@/lib/constants/music'

const opportunityTypes = [
  { value: 'gig', label: 'Gig' },
  { value: 'session', label: 'Session' },
  { value: 'audition', label: 'Audition' },
  { value: 'collaboration', label: 'Collaboration' },
  { value: 'teaching', label: 'Teaching' },
  { value: 'recording', label: 'Recording' },
  { value: 'other', label: 'Other' }
] as const

const experienceLevels = [
  'Beginner',
  'Intermediate', 
  'Advanced',
  'Professional'
]

const contactMethods = [
  { value: 'platform', label: 'Through BandSeeking messages' },
  { value: 'email', label: 'Email address' },
  { value: 'phone', label: 'Phone number' },
  { value: 'external', label: 'External link/website' }
] as const

export default function CreateOpportunityPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState<CreateOpportunityData>({
    title: '',
    description: '',
    type: 'gig',
    location: '',
    is_remote: false,
    is_paid: false,
    payment_amount: '',
    date_time: '',
    deadline: '',
    requirements: [],
    genres: [],
    instruments_needed: [],
    experience_level: '',
    contact_method: 'platform',
    contact_info: ''
  })

  const [currentRequirement, setCurrentRequirement] = useState('')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }))
    }
  }

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre]
    }))
  }

  const handleInstrumentToggle = (instrument: string) => {
    setFormData(prev => ({
      ...prev,
      instruments_needed: prev.instruments_needed.includes(instrument)
        ? prev.instruments_needed.filter(i => i !== instrument)
        : [...prev.instruments_needed, instrument]
    }))
  }

  const addRequirement = () => {
    if (currentRequirement.trim() && !formData.requirements.includes(currentRequirement.trim())) {
      setFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, currentRequirement.trim()]
      }))
      setCurrentRequirement('')
    }
  }

  const removeRequirement = (requirement: string) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter(r => r !== requirement)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.title || !formData.description) {
      setError('Title and description are required')
      return
    }

    setLoading(true)
    setError('')

    try {
      const opportunity = await opportunityService.createOpportunity(formData)
      
      if (opportunity) {
        router.push(`/opportunities/${opportunity.id}`)
      } else {
        setError('Failed to create opportunity. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create opportunity. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6 md:mb-8">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
              <div>
                <h1 className="text-2xl md:text-4xl font-bold text-white">Post Opportunity</h1>
                <p className="text-secondary">Share a musical opportunity with the community</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/20 border border-red-500 text-red-400 px-4 py-3 rounded-lg mb-6">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-card rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Basic Information</h2>
                
                <div>
                  <label className="block text-white mb-2">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    placeholder="e.g., Guitarist Needed for Wedding Band"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white mb-2">
                    Description <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={6}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal resize-none"
                    placeholder="Describe the opportunity in detail..."
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">Type</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    >
                      {opportunityTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-white mb-2">Experience Level</label>
                    <select
                      name="experience_level"
                      value={formData.experience_level}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    >
                      <option value="">Any level</option>
                      {experienceLevels.map(level => (
                        <option key={level} value={level}>{level}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Location & Schedule */}
              <div className="bg-card rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Location & Schedule</h2>
                
                <div className="flex items-center gap-3 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_remote"
                      checked={formData.is_remote}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border border-card bg-background text-accent-teal focus:ring-accent-teal focus:ring-2"
                    />
                    <span className="text-white">Remote opportunity</span>
                  </label>
                </div>

                {!formData.is_remote && (
                  <div>
                    <label className="block text-white mb-2">
                      <MapPin className="inline w-4 h-4 mr-1" />
                      Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      placeholder="City, State"
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white mb-2">
                      <Calendar className="inline w-4 h-4 mr-1" />
                      Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      name="date_time"
                      value={formData.date_time}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    />
                  </div>

                  <div>
                    <label className="block text-white mb-2">
                      <Clock className="inline w-4 h-4 mr-1" />
                      Application Deadline
                    </label>
                    <input
                      type="date"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-card rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Payment</h2>
                
                <div className="flex items-center gap-3 mb-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      name="is_paid"
                      checked={formData.is_paid}
                      onChange={handleInputChange}
                      className="w-4 h-4 rounded border border-card bg-background text-accent-teal focus:ring-accent-teal focus:ring-2"
                    />
                    <span className="text-white">This is a paid opportunity</span>
                  </label>
                </div>

                {formData.is_paid && (
                  <div>
                    <label className="block text-white mb-2">
                      <DollarSign className="inline w-4 h-4 mr-1" />
                      Payment Amount
                    </label>
                    <input
                      type="text"
                      name="payment_amount"
                      value={formData.payment_amount}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      placeholder="e.g., $200 per gig, $50/hour"
                    />
                  </div>
                )}
              </div>

              {/* Musical Details */}
              <div className="bg-card rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Musical Details</h2>
                
                {/* Genres */}
                <div>
                  <label className="block text-white mb-3">Genres</label>
                  <div className="flex flex-wrap gap-2">
                    {MUSIC_GENRES.map(genre => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.genres.includes(genre)
                            ? 'bg-accent-purple text-white'
                            : 'bg-background text-secondary hover:text-white border border-border'
                        }`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Instruments */}
                <div>
                  <label className="block text-white mb-3">Instruments Needed</label>
                  <div className="flex flex-wrap gap-2">
                    {COMMON_INSTRUMENTS.map(instrument => (
                      <button
                        key={instrument}
                        type="button"
                        onClick={() => handleInstrumentToggle(instrument)}
                        className={`px-3 py-1 rounded-full text-sm transition-colors ${
                          formData.instruments_needed.includes(instrument)
                            ? 'bg-accent-teal text-black'
                            : 'bg-background text-secondary hover:text-white border border-border'
                        }`}
                      >
                        {instrument}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div className="bg-card rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
                
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={currentRequirement}
                    onChange={(e) => setCurrentRequirement(e.target.value)}
                    className="flex-1 bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                    placeholder="Add a requirement..."
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
                  />
                  <button
                    type="button"
                    onClick={addRequirement}
                    className="bg-accent-teal hover:bg-opacity-90 text-black font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    Add
                  </button>
                </div>

                {formData.requirements.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {formData.requirements.map((req, index) => (
                      <span
                        key={index}
                        className="bg-background text-white px-3 py-1 rounded-full text-sm flex items-center gap-2"
                      >
                        {req}
                        <button
                          type="button"
                          onClick={() => removeRequirement(req)}
                          className="text-red-400 hover:text-red-300"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="bg-card rounded-lg p-6 space-y-4">
                <h2 className="text-xl font-semibold text-white mb-4">Contact Information</h2>
                
                <div>
                  <label className="block text-white mb-2">How should people contact you?</label>
                  <select
                    name="contact_method"
                    value={formData.contact_method}
                    onChange={handleInputChange}
                    className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-accent-teal mb-3"
                  >
                    {contactMethods.map(method => (
                      <option key={method.value} value={method.value}>{method.label}</option>
                    ))}
                  </select>
                </div>

                {formData.contact_method !== 'platform' && (
                  <div>
                    <label className="block text-white mb-2">
                      {formData.contact_method === 'email' && <Mail className="inline w-4 h-4 mr-1" />}
                      {formData.contact_method === 'phone' && <Phone className="inline w-4 h-4 mr-1" />}
                      {formData.contact_method === 'external' && <ExternalLink className="inline w-4 h-4 mr-1" />}
                      Contact {formData.contact_method === 'email' ? 'Email' : formData.contact_method === 'phone' ? 'Phone' : 'Link'}
                    </label>
                    <input
                      type={formData.contact_method === 'email' ? 'email' : formData.contact_method === 'phone' ? 'tel' : 'url'}
                      name="contact_info"
                      value={formData.contact_info}
                      onChange={handleInputChange}
                      className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal"
                      placeholder={
                        formData.contact_method === 'email' ? 'your@email.com' :
                        formData.contact_method === 'phone' ? '(555) 123-4567' :
                        'https://yourwebsite.com'
                      }
                    />
                  </div>
                )}
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-6 py-3 bg-button-secondary text-white rounded-lg hover:bg-opacity-80 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-3 bg-accent-teal text-black font-medium rounded-lg hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating...' : 'Post Opportunity'}
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}