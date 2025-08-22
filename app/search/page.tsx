import { Metadata } from 'next'
import SearchClient from './SearchClient'

export const metadata: Metadata = {
  title: 'Find Musicians Near You | BandSeeking',
  description: 'Search and connect with talented musicians in your area. Filter by instrument, genre, experience level, and availability to find the perfect bandmate for your music project.',
  keywords: 'find musicians, local musicians, band members, music collaboration, find guitarist, find drummer, find bassist, find vocalist',
  openGraph: {
    title: 'Find Musicians Near You | BandSeeking',
    description: 'Connect with talented musicians in your area for bands, collaborations, and music projects.',
    type: 'website',
    images: ['/og-search.png'],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Musicians Near You | BandSeeking',
    description: 'Connect with talented musicians in your area.',
  }
}

export default function SearchPage() {
  return <SearchClient />
}