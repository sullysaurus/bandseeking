'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  MapPin, 
  Calendar, 
  DollarSign, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  ExternalLink,
  Eye,
  Users,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import Sidebar from '@/components/Sidebar'
import ProtectedRoute from '@/components/ProtectedRoute'
import { opportunityService, Opportunity } from '@/lib/opportunities'
import { useAuth } from '@/contexts/AuthContext'

export default function OpportunityPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const [opportunity, setOpportunity] = useState<Opportunity | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [applying, setApplying] = useState(false)
  const [hasApplied, setHasApplied] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [showApplicationForm, setShowApplicationForm] = useState(false)

  const opportunityId = params.id as string

  useEffect(() => {
    if (opportunityId) {
      loadOpportunity()
    }
  }, [opportunityId])

  const loadOpportunity = async () => {
    try {
      setLoading(true)
      setError('')
      
      const data = await opportunityService.getOpportunity(opportunityId)
      
      if (data) {
        setOpportunity(data)
        // TODO: Check if user has already applied
        // setHasApplied(await opportunityService.hasUserApplied(opportunityId))
      } else {
        setError('Opportunity not found')
      }
    } catch (err) {
      console.error('Error loading opportunity:', err)
      setError('Failed to load opportunity')
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!opportunity || !user || !applicationMessage.trim()) return

    try {
      setApplying(true)
      // TODO: Implement application functionality
      // await opportunityService.applyToOpportunity(opportunity.id, applicationMessage.trim())
      
      setHasApplied(true)
      setShowApplicationForm(false)
      setApplicationMessage('')
    } catch (err) {
      console.error('Error applying to opportunity:', err)
      setError('Failed to submit application')
    } finally {
      setApplying(false)
    }
  }

  const getTypeColor = (type: string) => {
    const colors = {
      'gig': 'bg-success/20 text-success',
      'session': 'bg-accent-teal/20 text-accent-teal',
      'audition': 'bg-accent-purple/20 text-accent-purple',
      'collaboration': 'bg-orange-500/20 text-orange-400',
      'teaching': 'bg-blue-500/20 text-blue-400',
      'recording': 'bg-pink-500/20 text-pink-400',
      'other': 'bg-medium/20 text-medium'
    }
    return colors[type as keyof typeof colors] || colors.other
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success'
      case 'filled': return 'text-complete'
      case 'cancelled': return 'text-red-400'
      case 'expired': return 'text-medium'
      default: return 'text-medium'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle
      case 'filled': return Users
      case 'cancelled': return XCircle
      case 'expired': return AlertCircle
      default: return AlertCircle
    }
  }

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8 flex items-center justify-center">
            <div className="text-white">Loading opportunity...</div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  if (error || !opportunity) {
    return (
      <ProtectedRoute>
        <div className="flex min-h-screen bg-background">
          <Sidebar />
          <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center gap-4 mb-6">
                <button 
                  onClick={() => router.back()}
                  className="flex items-center gap-2 text-secondary hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </button>
              </div>
              
              <div className="text-center py-12">
                <div className="text-red-400 text-xl mb-2">
                  {error || 'Opportunity not found'}
                </div>
                <Link 
                  href="/opportunities"
                  className="text-accent-teal hover:text-opacity-80 transition-colors"
                >
                  Back to Opportunities
                </Link>
              </div>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    )
  }

  const StatusIcon = getStatusIcon(opportunity.status)
  const isOwnOpportunity = user?.id === opportunity.creator_id
  const canApply = !isOwnOpportunity && opportunity.status === 'active' && !hasApplied

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        
        <main className="flex-1 p-4 md:p-8 pb-20 md:pb-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="flex items-center gap-4 mb-6">
              <button 
                onClick={() => router.back()}
                className="flex items-center gap-2 text-secondary hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Back
              </button>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Main Details */}
              <div className="lg:col-span-2 space-y-6">
                {/* Title and Type */}
                <div>
                  <div className="flex items-start gap-3 mb-4">
                    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(opportunity.type)}`}>
                      {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${getStatusColor(opportunity.status)}`}>
                      <StatusIcon className="w-4 h-4" />
                      {opportunity.status.charAt(0).toUpperCase() + opportunity.status.slice(1)}
                    </div>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                    {opportunity.title}
                  </h1>
                </div>

                {/* Description */}
                <div className="bg-card rounded-lg p-6">
                  <h2 className="text-xl font-semibold text-white mb-4">Description</h2>
                  <div className="text-secondary leading-relaxed whitespace-pre-wrap">
                    {opportunity.description}
                  </div>
                </div>

                {/* Requirements */}
                {opportunity.requirements?.length > 0 && (
                  <div className="bg-card rounded-lg p-6">
                    <h2 className="text-xl font-semibold text-white mb-4">Requirements</h2>
                    <ul className="space-y-2">
                      {opportunity.requirements.map((req, index) => (
                        <li key={index} className="flex items-start gap-2 text-secondary">
                          <div className="w-2 h-2 bg-accent-teal rounded-full mt-2 flex-shrink-0" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Musical Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Genres */}
                  {opportunity.genres?.length > 0 && (
                    <div className="bg-card rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-3">Genres</h3>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.genres.map((genre, index) => (
                          <span 
                            key={index}
                            className="bg-accent-purple/20 text-accent-purple px-3 py-1 rounded-full text-sm"
                          >
                            {genre}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Instruments Needed */}
                  {opportunity.instruments_needed?.length > 0 && (
                    <div className="bg-card rounded-lg p-6">
                      <h3 className="text-white font-semibold mb-3">Instruments Needed</h3>
                      <div className="flex flex-wrap gap-2">
                        {opportunity.instruments_needed.map((instrument, index) => (
                          <span 
                            key={index}
                            className="bg-accent-teal/20 text-accent-teal px-3 py-1 rounded-full text-sm"
                          >
                            {instrument}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Details & Actions */}
              <div className="space-y-6">
                {/* Quick Details */}
                <div className="bg-card rounded-lg p-6 space-y-4">
                  <h3 className="text-white font-semibold mb-4">Details</h3>
                  
                  {/* Location */}
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-medium" />
                    <div>
                      <div className="text-white">
                        {opportunity.is_remote ? 'Remote' : opportunity.location || 'Location not specified'}
                      </div>
                      {opportunity.is_remote && opportunity.location && (
                        <div className="text-secondary text-sm">+ {opportunity.location}</div>
                      )}
                    </div>
                  </div>

                  {/* Payment */}
                  <div className="flex items-center gap-3">
                    <DollarSign className="w-5 h-5 text-medium" />
                    <div className="text-white">
                      {opportunity.is_paid ? (
                        opportunity.payment_amount || 'Paid position'
                      ) : (
                        'Unpaid / Volunteer'
                      )}
                    </div>
                  </div>

                  {/* Date/Time */}
                  {opportunity.date_time && (
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-medium" />
                      <div className="text-white">
                        {new Date(opportunity.date_time).toLocaleString()}
                      </div>
                    </div>
                  )}

                  {/* Deadline */}
                  {opportunity.deadline && (
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-medium" />
                      <div>
                        <div className="text-secondary text-sm">Apply by:</div>
                        <div className="text-white">
                          {new Date(opportunity.deadline).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Experience Level */}
                  {opportunity.experience_level && (
                    <div className="flex items-center gap-3">
                      <User className="w-5 h-5 text-medium" />
                      <div>
                        <div className="text-secondary text-sm">Experience Level:</div>
                        <div className="text-white">{opportunity.experience_level}</div>
                      </div>
                    </div>
                  )}

                  {/* Views & Applications */}
                  <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border">
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                        <Eye className="w-4 h-4" />
                        {opportunity.views_count}
                      </div>
                      <div className="text-secondary text-sm">Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-semibold text-white flex items-center justify-center gap-2">
                        <Users className="w-4 h-4" />
                        {opportunity.applications_count}
                      </div>
                      <div className="text-secondary text-sm">Applications</div>
                    </div>
                  </div>
                </div>

                {/* Creator Info */}
                {(opportunity.creator_name || opportunity.creator_username) && (
                  <div className="bg-card rounded-lg p-6">
                    <h3 className="text-white font-semibold mb-4">Posted by</h3>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-12 h-12 bg-accent-teal/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-accent-teal" />
                      </div>
                      <div>
                        <div className="text-white font-medium">
                          {opportunity.creator_name || opportunity.creator_username}
                        </div>
                        {opportunity.creator_location && (
                          <div className="text-secondary text-sm">{opportunity.creator_location}</div>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  {canApply && (
                    <>
                      {!showApplicationForm ? (
                        <button
                          onClick={() => setShowApplicationForm(true)}
                          className="w-full bg-accent-teal hover:bg-opacity-90 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                        >
                          Apply for this Opportunity
                        </button>
                      ) : (
                        <div className="bg-card rounded-lg p-4 space-y-4">
                          <h4 className="text-white font-medium">Send Application</h4>
                          <textarea
                            value={applicationMessage}
                            onChange={(e) => setApplicationMessage(e.target.value)}
                            placeholder="Write a message to the opportunity creator..."
                            rows={4}
                            className="w-full bg-background border border-border rounded-lg px-3 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal resize-none"
                          />
                          <div className="flex gap-2">
                            <button
                              onClick={handleApply}
                              disabled={applying || !applicationMessage.trim()}
                              className="flex-1 bg-success hover:bg-opacity-90 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {applying ? 'Sending...' : 'Send Application'}
                            </button>
                            <button
                              onClick={() => {
                                setShowApplicationForm(false)
                                setApplicationMessage('')
                              }}
                              className="bg-button-secondary hover:bg-opacity-80 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {hasApplied && (
                    <div className="bg-success/20 border border-success/20 text-success px-4 py-3 rounded-lg text-center">
                      ✓ Application sent successfully
                    </div>
                  )}

                  {isOwnOpportunity && (
                    <Link
                      href={`/opportunities/${opportunity.id}/edit`}
                      className="w-full bg-button-secondary hover:bg-opacity-80 text-white font-medium py-3 px-4 rounded-lg transition-colors text-center block"
                    >
                      Edit Opportunity
                    </Link>
                  )}

                  {/* Contact Info */}
                  {opportunity.contact_method !== 'platform' && opportunity.contact_info && (
                    <div className="bg-card rounded-lg p-4">
                      <h4 className="text-white font-medium mb-2">Contact</h4>
                      <div className="flex items-center gap-2">
                        {opportunity.contact_method === 'email' ? (
                          <Mail className="w-4 h-4 text-medium" />
                        ) : opportunity.contact_method === 'phone' ? (
                          <Phone className="w-4 h-4 text-medium" />
                        ) : (
                          <ExternalLink className="w-4 h-4 text-medium" />
                        )}
                        <span className="text-secondary text-sm">{opportunity.contact_info}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}