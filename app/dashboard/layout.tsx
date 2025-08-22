import { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s | Dashboard - BandSeeking',
    default: 'Dashboard | BandSeeking',
  },
  description: 'Manage your BandSeeking profile, messages, and connections.',
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}