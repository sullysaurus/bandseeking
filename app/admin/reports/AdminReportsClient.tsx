'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Flag, Search, Filter, Eye, CheckCircle, X, AlertTriangle, Clock } from 'lucide-react'
import type { Database } from '@/lib/database.types'

type VenueReport = Database['public']['Tables']['venue_reports']['Row'] & {
  venues: {
    name: string
    city: string
    state: string
  } | null
}

type ReportStatus = 'pending' | 'reviewed' | 'resolved' | 'dismissed'

const STATUS_COLORS: Record<ReportStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  reviewed: 'bg-blue-100 text-blue-800 border-blue-300',
  resolved: 'bg-green-100 text-green-800 border-green-300',
  dismissed: 'bg-gray-100 text-gray-800 border-gray-300'
}

const STATUS_ICONS: Record<ReportStatus, React.ReactNode> = {
  pending: <Clock className="w-4 h-4" />,
  reviewed: <Eye className="w-4 h-4" />,
  resolved: <CheckCircle className="w-4 h-4" />,
  dismissed: <X className="w-4 h-4" />
}

const REASON_LABELS: Record<string, string> = {
  incorrect_info: 'Incorrect Information',
  closed_permanently: 'Permanently Closed',
  wrong_location: 'Wrong Location',
  inappropriate_content: 'Inappropriate Content',
  duplicate: 'Duplicate Listing',
  other: 'Other'
}

export default function AdminReportsClient() {
  const [reports, setReports] = useState<VenueReport[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<ReportStatus | 'all'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [selectedReport, setSelectedReport] = useState<VenueReport | null>(null)
  const itemsPerPage = 20

  useEffect(() => {
    fetchReports()
  }, [currentPage, searchText, selectedStatus])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const from = (currentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      let query = supabase
        .from('venue_reports')
        .select(`
          *,
          venues (
            name,
            city,
            state
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to)

      // Apply filters
      if (searchText.trim()) {
        query = query.or(`reason.ilike.%${searchText}%,description.ilike.%${searchText}%`)
      }

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus)
      }

      const { data, error, count } = await query

      if (error) throw error
      
      setReports(data || [])
      setTotalCount(count || 0)
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateReportStatus = async (reportId: string, status: ReportStatus, adminNotes?: string) => {
    try {
      const { error } = await supabase
        .from('venue_reports')
        .update({ 
          status,
          admin_notes: adminNotes || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', reportId)

      if (error) throw error

      // Refresh the list
      fetchReports()
      setSelectedReport(null)
    } catch (error) {
      console.error('Error updating report:', error)
      alert('Error updating report. Please try again.')
    }
  }

  const totalPages = Math.ceil(totalCount / itemsPerPage)

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          VENUE REPORTS
        </h1>
        <p className="text-lg text-gray-600">
          Manage user-submitted venue reports and feedback
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-6 mb-8">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="Search reports by reason or description..."
              value={searchText}
              onChange={(e) => {
                setSearchText(e.target.value)
                setCurrentPage(1)
              }}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>

          {/* Status Filter */}
          <div className="w-48 relative">
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value as ReportStatus | 'all')
                setCurrentPage(1)
              }}
              className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black transition-colors appearance-none bg-white"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="reviewed">Reviewed</option>
              <option value="resolved">Resolved</option>
              <option value="dismissed">Dismissed</option>
            </select>
            <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="mb-6">
        <p className="text-gray-600">
          {loading ? 'Loading reports...' : (
            <>
              Showing {reports.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, totalCount)} of {totalCount} reports
              {(searchText || selectedStatus !== 'all') && (
                <span className="ml-2 text-gray-500">
                  (filtered)
                </span>
              )}
            </>
          )}
        </p>
      </div>

      {/* Reports Table */}
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-black"></div>
          </div>
        ) : reports.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-100 border-b-4 border-black">
                <tr>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Venue</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Submitted</th>
                  <th className="px-6 py-4 text-left font-black text-sm text-gray-900 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-4 divide-black">
                {reports.map((report, index) => (
                  <tr key={report.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-black text-gray-900">
                          {report.venues?.name || 'Unknown Venue'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {report.venues?.city}, {report.venues?.state}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <span className="px-2 py-1 text-xs font-black bg-red-100 text-red-800 border border-red-300 rounded">
                          {REASON_LABELS[report.reason]}
                        </span>
                        {report.description && (
                          <div className="text-sm text-gray-600 mt-1 truncate max-w-xs">
                            {report.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold border-2 ${STATUS_COLORS[report.status]}`}>
                        {STATUS_ICONS[report.status]}
                        {report.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(report.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => setSelectedReport(report)}
                        className="px-3 py-1 bg-blue-300 border-2 border-black font-black text-xs hover:bg-blue-400 transition-colors"
                      >
                        VIEW DETAILS
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12">
            <Flag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-black text-gray-900 mb-2">No reports found</h3>
            <p className="text-gray-600">
              {searchText || selectedStatus !== 'all' 
                ? 'Try adjusting your filters' 
                : 'No venue reports have been submitted yet'}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalCount > itemsPerPage && (
        <div className="mt-8 flex justify-center">
          <div className="bg-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-lg px-6 py-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-4 py-2 font-black text-sm border-2 border-black transition-colors ${
                  currentPage === 1
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-cyan-300'
                }`}
              >
                ← PREV
              </button>

              <span className="px-4 py-2 font-black text-sm">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage >= totalPages}
                className={`px-4 py-2 font-black text-sm border-2 border-black transition-colors ${
                  currentPage >= totalPages
                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    : 'bg-white text-black hover:bg-cyan-300'
                }`}
              >
                NEXT →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Details Modal */}
      {selectedReport && (
        <ReportDetailsModal
          report={selectedReport}
          onClose={() => setSelectedReport(null)}
          onStatusUpdate={updateReportStatus}
        />
      )}
    </div>
  )
}

interface ReportDetailsModalProps {
  report: VenueReport
  onClose: () => void
  onStatusUpdate: (reportId: string, status: ReportStatus, adminNotes?: string) => void
}

function ReportDetailsModal({ report, onClose, onStatusUpdate }: ReportDetailsModalProps) {
  const [adminNotes, setAdminNotes] = useState(report.admin_notes || '')
  const [isUpdating, setIsUpdating] = useState(false)

  const handleStatusUpdate = async (status: ReportStatus) => {
    setIsUpdating(true)
    await onStatusUpdate(report.id, status, adminNotes)
    setIsUpdating(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b-4 border-black">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-400 border-2 border-black">
              <Flag className="w-5 h-5 text-black" />
            </div>
            <div>
              <h2 className="text-xl font-black">VENUE REPORT DETAILS</h2>
              <p className="text-sm text-gray-600">{report.venues?.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Venue Info */}
          <div>
            <h3 className="font-black text-sm mb-2">VENUE INFORMATION</h3>
            <div className="bg-gray-50 p-4 border-2 border-gray-200">
              <p className="font-bold">{report.venues?.name || 'Unknown Venue'}</p>
              <p className="text-gray-600">{report.venues?.city}, {report.venues?.state}</p>
            </div>
          </div>

          {/* Report Details */}
          <div>
            <h3 className="font-black text-sm mb-2">REPORT DETAILS</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-bold">Reason: </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border-2 bg-red-100 text-red-800 border-red-300`}>
                  {REASON_LABELS[report.reason]}
                </span>
              </div>
              
              {report.description && (
                <div>
                  <span className="text-sm font-bold">Description:</span>
                  <div className="mt-1 p-3 bg-gray-50 border-2 border-gray-200 text-sm">
                    {report.description}
                  </div>
                </div>
              )}

              <div>
                <span className="text-sm font-bold">Status: </span>
                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-semibold border-2 ${STATUS_COLORS[report.status]}`}>
                  {STATUS_ICONS[report.status]}
                  {report.status.toUpperCase()}
                </span>
              </div>

              <div>
                <span className="text-sm font-bold">Submitted: </span>
                <span className="text-sm">{new Date(report.created_at).toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div>
            <h3 className="font-black text-sm mb-2">ADMIN NOTES</h3>
            <textarea
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              placeholder="Add notes about how this report was handled..."
              className="w-full px-3 py-2 border-2 border-gray-300 focus:outline-none focus:border-black transition-colors resize-none"
              rows={4}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleStatusUpdate('reviewed')}
              disabled={isUpdating}
              className="px-4 py-2 bg-blue-400 border-2 border-black font-black text-sm hover:bg-blue-500 transition-colors disabled:opacity-50"
            >
              MARK REVIEWED
            </button>
            <button
              onClick={() => handleStatusUpdate('resolved')}
              disabled={isUpdating}
              className="px-4 py-2 bg-green-400 border-2 border-black font-black text-sm hover:bg-green-500 transition-colors disabled:opacity-50"
            >
              MARK RESOLVED
            </button>
            <button
              onClick={() => handleStatusUpdate('dismissed')}
              disabled={isUpdating}
              className="px-4 py-2 bg-gray-400 border-2 border-black font-black text-sm hover:bg-gray-500 transition-colors disabled:opacity-50"
            >
              DISMISS
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}