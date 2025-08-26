import { Metadata } from 'next'
import { Suspense } from 'react'
import AdminVenuesClient from './AdminVenuesClient'

export const metadata: Metadata = {
  title: 'Admin - Venues Management | BandSeeking',
  description: 'Manage venues in the BandSeeking platform',
}

export default function AdminVenuesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <AdminVenuesClient />
      </Suspense>
    </div>
  )
}