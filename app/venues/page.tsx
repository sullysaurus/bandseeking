import { Metadata } from 'next'
import VenuesClient from './VenuesClient'

export const metadata: Metadata = {
  title: 'Music Venue Database | BandSeeking',
  description: 'Discover 50+ music venues in the Raleigh-Durham area. Find breweries, coffee shops, music halls, and bars that host live music. Perfect for booking your next show.',
  keywords: 'raleigh music venues, durham music venues, live music venues, brewery shows, coffee shop gigs, concert venues, indie music venues',
  alternates: {
    canonical: '/venues',
  },
  openGraph: {
    title: 'Music Venue Database | BandSeeking',
    description: 'Discover 50+ music venues perfect for booking shows in the Raleigh-Durham area.',
    type: 'website',
    url: 'https://www.bandseeking.com/venues',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Music Venue Database | BandSeeking',
    description: 'Discover 50+ music venues perfect for booking shows in the Raleigh-Durham area.',
  }
}

export default function VenuesPage() {
  return <VenuesClient />
}