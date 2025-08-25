import { Metadata } from 'next'
import { Suspense } from 'react'
import { getRecentProfiles } from '@/lib/server-functions'
import HomeClient from './HomeClient'
import LoadingCards from '@/components/LoadingCards'

export const metadata: Metadata = {
  title: 'BandSeeking - Connect with Musicians',
  description: 'Find and connect with musicians in your area for bands, collaborations, and music projects. Join the community of passionate musicians.',
  keywords: 'musicians, band members, find musicians, music collaboration, band seeking, find band members',
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'BandSeeking - Connect with Musicians',
    description: 'Find and connect with musicians in your area for bands, collaborations, and music projects.',
    type: 'website',
    url: 'https://www.bandseeking.com',
    images: [
      {
        url: '/logo.png',
        width: 1200,
        height: 1200,
        alt: 'BandSeeking Logo',
      }
    ],
    siteName: 'BandSeeking',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BandSeeking - Connect with Musicians',
    description: 'Find and connect with musicians in your area for bands, collaborations, and music projects.',
    images: ['/logo.png'],
    creator: '@bandseeking',
    site: '@bandseeking',
  }
}

// Force dynamic rendering to always show latest profiles
export const dynamic = 'force-dynamic'

export default async function HomePage() {
  // Fetch profiles server-side
  const profiles = await getRecentProfiles(6)
  
  return <HomeClient initialProfiles={profiles} />
}