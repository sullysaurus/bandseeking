'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X, Flag, AlertTriangle } from 'lucide-react'

interface ReportVenueModalProps {
  venueId: string
  venueName: string
  onClose: () => void
}

type ReportReason = 'incorrect_info' | 'closed_permanently' | 'wrong_location' | 'inappropriate_content' | 'duplicate' | 'suggestion' | 'other'

const REPORT_REASONS: { value: ReportReason; label: string; description: string }[] = [
  {
    value: 'incorrect_info',
    label: 'Incorrect Information',
    description: 'Wrong details about capacity, type, or other info'
  },
  {
    value: 'closed_permanently',
    label: 'Permanently Closed',
    description: 'This venue is no longer operating'
  },
  {
    value: 'wrong_location',
    label: 'Wrong Location',
    description: 'Address or location details are incorrect'
  },
  {
    value: 'inappropriate_content',
    label: 'Inappropriate Content',
    description: 'Contains offensive or inappropriate information'
  },
  {
    value: 'duplicate',
    label: 'Duplicate Listing',
    description: 'This venue already exists in the system'
  },
  {
    value: 'other',
    label: 'Other',
    description: 'Something else needs attention'
  }
]

export default function ReportVenueModal({ venueId, venueName, onClose }: ReportVenueModalProps) {
  const [reason, setReason] = useState<ReportReason | ''>('')
  const [description, setDescription] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!reason) return

    setIsSubmitting(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()

      const { error } = await supabase
        .from('venue_reports')
        .insert({
          venue_id: venueId,
          reporter_id: user?.id || null, // Allow null for anonymous reports
          reason: reason as ReportReason,
          description: description.trim() || null
        })

      if (error) throw error

      setIsSubmitted(true)
    } catch (error) {
      console.error('Error submitting report:', error)
      alert('Error submitting report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6">
          <div className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-green-400 border-2 border-black rounded-full flex items-center justify-center">
              <Flag className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-xl font-black mb-2">REPORT SUBMITTED</h3>
            <p className="text-gray-600 mb-6">
              Thanks for helping keep venue information accurate! We&apos;ll review your report and take appropriate action.
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
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-400 border-2 border-black">
              <Flag className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black">REPORT VENUE</h2>
              <p className="text-sm text-gray-600">{venueName}</p>
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
          <div className="mb-6">
            <label className="block font-black text-sm mb-3">
              WHAT&apos;S THE ISSUE?
            </label>
            <div className="space-y-2">
              {REPORT_REASONS.map((reasonOption) => (
                <label
                  key={reasonOption.value}
                  className="flex items-start gap-3 p-3 border-2 border-gray-300 hover:border-black transition-colors cursor-pointer"
                >
                  <input
                    type="radio"
                    name="reason"
                    value={reasonOption.value}
                    checked={reason === reasonOption.value}
                    onChange={(e) => setReason(e.target.value as ReportReason)}
                    className="mt-1"
                  />
                  <div>
                    <div className="font-bold text-sm">{reasonOption.label}</div>
                    <div className="text-xs text-gray-600">{reasonOption.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="mb-6">
            <label htmlFor="description" className="block font-black text-sm mb-2">
              ADDITIONAL DETAILS (OPTIONAL)
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide any additional information that might help us address this issue..."
              className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
              rows={4}
              maxLength={500}
            />
            <div className="text-xs text-gray-500 mt-1">
              {description.length}/500 characters
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
              disabled={!reason || isSubmitting}
              className="flex-1 px-4 py-3 bg-red-400 border-2 border-black font-black text-black hover:bg-red-500 transition-colors shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'SUBMITTING...' : 'SUBMIT REPORT'}
            </button>
          </div>
        </form>

        {/* Warning */}
        <div className="p-4 bg-yellow-50 border-t-4 border-yellow-300">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-yellow-700">
              Reports are reviewed by our team. False or malicious reports may result in account restrictions.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}