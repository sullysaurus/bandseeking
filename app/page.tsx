import { Metadata } from 'next'
import { Suspense } from 'react'
import { getRecentProfiles } from '@/lib/server-functions'
import HomeClient from './HomeClient'
import LoadingCards from '@/components/LoadingCards'

export const metadata: Metadata = {
  title: 'BandSeeking - Connect with Musicians',
  description: 'Find and connect with musicians in your area for bands, collaborations, and music projects. Join the community of passionate musicians.',
  keywords: 'musicians, band members, find musicians, music collaboration, band seeking, find band members',
  openGraph: {
    title: 'BandSeeking - Connect with Musicians',
    description: 'Find and connect with musicians in your area for bands, collaborations, and music projects.',
    type: 'website',
    url: 'https://www.bandseeking.com',
    images: ['/og-image.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BandSeeking - Connect with Musicians',
    description: 'Find your perfect bandmate today',
  }
}

export default async function HomePage() {
  // Fetch profiles server-side
  const profiles = await getRecentProfiles(12)
  
  return <HomeClient initialProfiles={profiles} />
}