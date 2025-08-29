import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import VenueProfileClient from './VenueProfileClient'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']

interface VenueProfilePageProps {
  params: Promise<{ id: string }>
}

// Generate the same slug format used in the venue list
function generateVenueSlug(name: string, city: string, state: string): string {
  const baseSlug = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim() // Remove leading/trailing spaces

  // Add city for uniqueness if needed (for similar venue names)
  const citySlug = city.toLowerCase().replace(/[^a-z0-9]/g, '')
  return `${baseSlug}-${citySlug}-${state.toLowerCase()}`
}

async function getVenue(slug: string): Promise<Venue | null> {
  // First check if it's an old-style UUID for backward compatibility
  const uuidPattern = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i
  if (uuidPattern.test(slug)) {
    const { data: venue, error } = await supabase
      .from('venues')
      .select('*')
      .eq('id', slug)
      .single()

    if (!error && venue) return venue
  }

  // Otherwise, get all venues and find the one with matching slug
  const { data: venues, error } = await supabase
    .from('venues')
    .select('*')

  if (error) {
    console.error('Error fetching venues:', error)
    return null
  }

  // Find venue with matching slug
  const venue = venues?.find(v => 
    generateVenueSlug(v.name, v.city, v.state) === slug
  )

  return venue || null
}

export async function generateMetadata({ params }: VenueProfilePageProps): Promise<Metadata> {
  const resolvedParams = await params
  const venue = await getVenue(resolvedParams.id)

  if (!venue) {
    return {
      title: 'Venue Not Found | BandSeeking',
      description: 'The requested venue could not be found.',
    }
  }

  return {
    title: `${venue.name} | BandSeeking`,
    description: venue.description || `${venue.name} - ${venue.venue_type.replace('_', ' ')} in ${venue.city}, ${venue.state}`,
    openGraph: {
      title: `${venue.name} | BandSeeking`,
      description: venue.description || `${venue.name} - ${venue.venue_type.replace('_', ' ')} in ${venue.city}, ${venue.state}`,
      type: 'website',
    },
  }
}

export default async function VenueProfilePage({ params }: VenueProfilePageProps) {
  const resolvedParams = await params
  const venue = await getVenue(resolvedParams.id)

  if (!venue) {
    notFound()
  }

  return <VenueProfileClient venue={venue} />
}