'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import Navigation from '@/components/layout/Navigation'
import VenueCard from '@/components/VenueCard'
import Link from 'next/link'
import type { Database } from '@/lib/database.types'

type Venue = Database['public']['Tables']['venues']['Row']

export default function SavedVenuesPage() {
  const router = useRouter()
  const [savedVenues, setSavedVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSavedVenues()
  }, [])

  const fetchSavedVenues = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/auth/login')
        return
      }

      const { data, error } = await supabase
        .from('saved_venues')
        .select(`
          *,
          saved_venue:venues!saved_venue_id(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Transform the data to match VenueCard format
      const transformedVenues = data?.map(item => item.saved_venue).filter(Boolean) || []

      setSavedVenues(transformedVenues)
    } catch (error) {
      console.error('Error fetching saved venues:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-purple-300">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <Link 
              href="/dashboard" 
              className="inline-flex items-center font-black text-lg mb-4 hover:text-pink-400 transition-colors"
            >
              ← BACK TO DASHBOARD
            </Link>
            <h1 className="text-4xl md:text-5xl font-black mb-2">SAVED VENUES</h1>
            <p className="font-bold text-xl">Your saved venues for future bookings.</p>
          </div>

          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white border-4 border-black p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] animate-pulse">
                  <div className="bg-gray-200 h-6 mb-4"></div>
                  <div className="bg-gray-200 h-4 mb-2"></div>
                  <div className="bg-gray-200 h-4 mb-4"></div>
                  <div className="bg-gray-200 h-20 mb-4"></div>
                  <div className="bg-gray-200 h-8"></div>
                </div>
              ))}
            </div>
          ) : savedVenues.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedVenues.map((venue) => (
                <VenueCard key={venue.id} venue={venue} />
              ))}
            </div>
          ) : (
            <div className="bg-white border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
              <div className="mb-6">
                <div className="w-16 h-16 bg-pink-400 border-4 border-black mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl">♡</span>
                </div>
                <h2 className="text-2xl font-black mb-2">NO SAVED VENUES YET</h2>
                <p className="font-bold mb-6">
                  Start browsing and save venues you&apos;d like to book for your shows.
                </p>
                <Link 
                  href="/venues" 
                  className="inline-block px-6 py-3 bg-black text-white border-4 border-black font-black hover:bg-cyan-400 hover:text-black transition-colors shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                >
                  FIND VENUES →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  )
}