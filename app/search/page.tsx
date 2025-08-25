import { Metadata } from 'next'
import NeoBrutalistSearchClient from './NeoBrutalistSearchClient'

export const metadata: Metadata = {
  title: 'Find Musicians Near You | BandSeeking',
  description: 'Search and connect with talented musicians in your area. Find guitarists, drummers, vocalists, bassists, and more for your next band or music project. Filter by location, instruments, experience level, and availability.',
  keywords: 'find musicians, search musicians, local musicians, band members near me, music collaborators, instrumentalists, vocalists',
  alternates: {
    canonical: '/search',
  },
  openGraph: {
    title: 'Find Musicians Near You | BandSeeking',
    description: 'Search and connect with talented musicians in your area for bands and music projects.',
    type: 'website',
    url: 'https://www.bandseeking.com/search',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Musicians Near You | BandSeeking',
    description: 'Search and connect with talented musicians in your area for bands and music projects.',
  }
}

export default function SearchPage() {
  return <NeoBrutalistSearchClient />
}