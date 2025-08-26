import { Metadata } from 'next'
import { Suspense } from 'react'
import AdminSettingsClient from './AdminSettingsClient'

export const metadata: Metadata = {
  title: 'Admin - Settings | BandSeeking',
  description: 'Manage application settings',
}

export default function AdminSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Suspense fallback={<div>Loading...</div>}>
        <AdminSettingsClient />
      </Suspense>
    </div>
  )
}