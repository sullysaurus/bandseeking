'use client'

import { useState, useEffect } from 'react'
import { MapPin, Eye, Plus, Check, Music, X, UserMinus, Clock } from 'lucide-react'
import Link from 'next/link'
import { bandService } from '@/lib/bands'
import { useAuth } from '@/contexts/AuthContext'

interface BandCardProps {
  id: string
  name: string
  slug: string
  location: string | null
  status: 'recruiting' | 'complete' | 'on_hold'
  genre: string | null
  description: string | null
  formed_year: number | null
  looking_for: string[]
  created_at: string
  isApplied?: boolean
}

export default function BandCard({ 
  id,
  name,
  slug,
  location, 
  status, 
  genre, 
  description,
  formed_year,
  looking_for,
  isApplied = false 
}: BandCardProps) {
  const { user } = useAuth()
  const [applying, setApplying] = useState(false)
  const [leaving, setLeaving] = useState(false)
  const [hasApplied, setHasApplied] = useState(isApplied)
  const [isMember, setIsMember] = useState(false)
  const [applicationStatus, setApplicationStatus] = useState<string>('')
  const [showApplicationModal, setShowApplicationModal] = useState(false)
  const [applicationMessage, setApplicationMessage] = useState('')
  const [loading, setLoading] = useState(true)

  // Load membership and application status
  useEffect(() => {
    if (user) {
      loadUserStatus()
    } else {
      setLoading(false)
    }
  }, [user, id])

  const loadUserStatus = async () => {
    try {
      setLoading(true)
      
      // Check if user is a member
      const memberStatus = await bandService.isMemberOfBand(id)
      setIsMember(memberStatus)
      
      // Check if user has applied
      const applicationStatus = await bandService.hasAppliedToBand(id)
      setHasApplied(applicationStatus.applied)
      setApplicationStatus(applicationStatus.status || '')
      
    } catch (error) {
      console.error('Error loading user status:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApply = async () => {
    if (!user || !applicationMessage.trim()) return

    setApplying(true)
    
    const application = await bandService.applyToBand(id, applicationMessage.trim())
    
    if (application) {
      setHasApplied(true)
      setApplicationStatus('pending')
      setShowApplicationModal(false)
      setApplicationMessage('')
      alert('Application sent successfully!')
    } else {
      alert('Failed to send application. Please try again.')
    }
    
    setApplying(false)
  }

  const handleLeaveBand = async () => {
    if (!user) return

    const confirmed = confirm(`Are you sure you want to leave ${name}? This action cannot be undone.`)
    if (!confirmed) return

    setLeaving(true)
    
    const success = await bandService.leaveBand(id)
    
    if (success) {
      setIsMember(false)
      alert('You have successfully left the band.')
    } else {
      alert('Failed to leave band. Please try again.')
    }
    
    setLeaving(false)
  }

  const handleCancelApplication = async () => {
    if (!user) return

    const confirmed = confirm('Are you sure you want to cancel your application?')
    if (!confirmed) return

    setApplying(true)
    
    const success = await bandService.cancelApplication(id)
    
    if (success) {
      setHasApplied(false)
      setApplicationStatus('')
      alert('Application cancelled successfully.')
    } else {
      alert('Failed to cancel application. Please try again.')
    }
    
    setApplying(false)
  }

  const openApplicationModal = () => {
    setApplicationMessage('')
    setShowApplicationModal(true)
  }
  const genreColors = {
    'Alternative Rock': 'bg-accent-purple',
    'Blues': 'bg-blue-500',
    'Metal': 'bg-red-500',
    'Jazz': 'bg-amber-500',
    'Folk': 'bg-emerald-500',
    'Indie': 'bg-pink-500',
    'Rock': 'bg-gray-500',
    'Pop': 'bg-purple-500',
    'Electronic': 'bg-cyan-500',
    'Hip Hop': 'bg-orange-500',
    'R&B': 'bg-rose-500',
    'Country': 'bg-yellow-500',
    'Punk': 'bg-red-600',
    'Reggae': 'bg-green-500',
    'Classical': 'bg-indigo-500'
  }

  const genreColor = genreColors[genre as keyof typeof genreColors] || 'bg-accent-purple'

  return (
    <>
    <div className="bg-card rounded-lg p-4 md:p-6 space-y-3 md:space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1 pr-2">
          <h3 className="text-lg md:text-xl font-semibold text-white mb-1 truncate">{name}</h3>
          {location && (
            <div className="flex items-center gap-1 text-muted text-sm">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{location}</span>
            </div>
          )}
        </div>
        
        <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-sm ${
          status === 'recruiting' 
            ? 'bg-success/20 text-success' 
            : status === 'complete'
            ? 'bg-complete/20 text-complete'
            : 'bg-orange-500/20 text-orange-400'
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            status === 'recruiting' 
              ? 'bg-success' 
              : status === 'complete'
              ? 'bg-complete'
              : 'bg-orange-400'
          }`} />
          {status === 'recruiting' ? 'Recruiting' : status === 'complete' ? 'Complete' : 'On Hold'}
        </div>
      </div>

      {/* Genre Tag */}
      {genre && (
        <div className={`inline-flex items-center px-3 py-1 rounded-full text-white text-sm ${genreColor}`}>
          <Music className="w-4 h-4 mr-1" />
          {genre}
        </div>
      )}

      {/* Description */}
      {description && (
        <p className="text-secondary text-sm leading-relaxed line-clamp-2 md:line-clamp-3">{description}</p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 py-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-white">--</div>
          <div className="text-xs text-medium">Members</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{formed_year || '--'}</div>
          <div className="text-xs text-medium">Formed</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-white">{looking_for.length}</div>
          <div className="text-xs text-medium">Openings</div>
        </div>
      </div>

      {/* Looking For */}
      {looking_for.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-medium">Looking for</span>
            <span className="text-accent-teal text-sm">{status === 'recruiting' ? 'Open to applications' : 'Not recruiting'}</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {looking_for.slice(0, 4).map((role, index) => (
              <span 
                key={index}
                className="bg-success/20 text-success px-2 py-1 rounded-full text-xs"
              >
                {role}
              </span>
            ))}
            {looking_for.length > 4 && (
              <span className="text-medium text-xs px-2 py-1">
                +{looking_for.length - 4} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 md:gap-3 pt-2">
        <Link
          href={`/bands/${slug}`}
          className="flex-1 bg-button-secondary hover:bg-opacity-80 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          View Band
        </Link>
        
        {loading ? (
          <button className="flex-1 bg-medium text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2" disabled>
            <Clock className="w-4 h-4" />
            Loading...
          </button>
        ) : isMember ? (
          // User is a member - show Leave Band button
          <button 
            onClick={handleLeaveBand}
            disabled={leaving}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <UserMinus className="w-4 h-4" />
            {leaving ? 'Leaving...' : 'Leave Band'}
          </button>
        ) : hasApplied ? (
          // User has applied - show status and cancel option
          <div className="flex-1 flex gap-1">
            <button 
              className={`flex-1 py-3 px-2 rounded-lg flex items-center justify-center gap-1 text-sm ${
                applicationStatus === 'pending' 
                  ? 'bg-orange-500/20 text-orange-400' 
                  : applicationStatus === 'accepted'
                  ? 'bg-success/20 text-success'
                  : 'bg-red-500/20 text-red-400'
              }`}
              disabled
            >
              <Check className="w-4 h-4" />
              {applicationStatus === 'pending' ? 'Pending' : applicationStatus === 'accepted' ? 'Accepted' : 'Rejected'}
            </button>
            {applicationStatus === 'pending' && (
              <button
                onClick={handleCancelApplication}
                disabled={applying}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-3 rounded-lg transition-colors disabled:opacity-50"
                title="Cancel application"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ) : status === 'recruiting' ? (
          // Band is recruiting and user hasn't applied - show Apply button
          <button 
            onClick={openApplicationModal}
            className="flex-1 bg-accent-teal hover:bg-opacity-90 text-black font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Apply
          </button>
        ) : status === 'complete' ? (
          <button className="flex-1 bg-complete text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2" disabled>
            <Check className="w-4 h-4" />
            Complete
          </button>
        ) : (
          <button className="flex-1 bg-orange-500 text-white py-3 px-4 rounded-lg flex items-center justify-center gap-2" disabled>
            <Clock className="w-4 h-4" />
            On Hold
          </button>
        )}
      </div>
    </div>

    {/* Application Modal */}
    {showApplicationModal && (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
        <div className="bg-card rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl font-semibold text-white mb-4">Apply to {name}</h3>
          
          <div className="mb-4">
            <label className="block text-white mb-2">
              Tell them why you'd be a great fit
            </label>
            <textarea
              value={applicationMessage}
              onChange={(e) => setApplicationMessage(e.target.value)}
              rows={4}
              className="w-full bg-background border border-border rounded-lg px-4 py-2 text-white placeholder-medium focus:outline-none focus:ring-2 focus:ring-accent-teal resize-none"
              placeholder="Hi! I'm interested in joining your band. I play guitar and have been performing for 5 years..."
              maxLength={500}
            />
            <div className="text-xs text-medium mt-1">
              {applicationMessage.length}/500 characters
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setShowApplicationModal(false)}
              className="flex-1 bg-button-secondary hover:bg-opacity-80 text-white py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              disabled={applying || !applicationMessage.trim()}
              className="flex-1 bg-accent-teal hover:bg-opacity-90 text-black font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {applying ? 'Sending...' : 'Send Application'}
            </button>
          </div>
        </div>
      </div>
    )}
  </>
  )
}