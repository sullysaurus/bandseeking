import { Metadata } from 'next'
import { Suspense } from 'react'
import AdminReportsClient from './AdminReportsClient'

export const metadata: Metadata = {
  title: 'Admin - Venue Reports | BandSeeking',
  description: 'Manage venue reports in the BandSeeking platform',
}

export default function AdminReportsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <AdminReportsClient />
      </Suspense>
    </div>
  )
}