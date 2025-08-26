import { Metadata } from 'next'
import { Suspense } from 'react'
import { getRecentProfiles, getRandomVenues } from '@/lib/server-functions'
import HomeClient from './HomeClient'
import LoadingCards from '@/components/LoadingCards'

export const metadata: Metadata = {
  title: 'BandSeeking - Connect with Musicians',
  description: 'A better way to connect with musicians. Find band members, collaborate on music projects, and join the community of passionate musicians.',
  keywords: 'musicians, band members, find musicians, music collaboration, band seeking, find band members',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BandSeeking - Connect with Musicians',
    description: 'A better way to connect with musicians. Find band members, collaborate on music projects, and join the musician community.',
    type: 'website',
    url: 'https://www.bandseeking.com',
    images: [
      {
        url: '/social.png',
        width: 1200,
        height: 630,
        alt: 'BandSeeking - Connect with Musicians',
      }
    ],
    siteName: 'BandSeeking',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BandSeeking - Connect with Musicians',
    description: 'A better way to connect with musicians. Find band members, collaborate on music projects, and join the musician community.',
    images: ['/social.png'],
    creator: '@bandseeking',
    site: '@bandseeking',
  }
}

// Force dynamic rendering to always show latest profiles
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch profiles and venues server-side
  const [profiles, venues] = await Promise.all([
    getRecentProfiles(6),
    getRandomVenues(4)
  ])
  
  return <HomeClient initialProfiles={profiles} initialVenues={venues} />
}