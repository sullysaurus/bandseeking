import { Metadata } from 'next'
import { supabase } from '@/lib/supabase'
import ProfileClient from './ProfileClient'

export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  // Fetch user and profile data for metadata
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('username', resolvedParams.username)
    .single()

  if (!userData) {
    return {
      title: 'Profile Not Found | BandSeeking',
      description: 'This musician profile could not be found.',
    }
  }

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData.id)
    .single()

  const instrument = profileData?.main_instrument || 'Musician'
  const secondaryInstruments = profileData?.secondary_instruments || []
  const allInstruments = secondaryInstruments.length > 0 
    ? `${instrument}${secondaryInstruments.length > 0 ? ` (also ${secondaryInstruments.join(', ')})` : ''}`
    : instrument
  const genres = profileData?.genres?.join(', ') || 'Various genres'
  const seeking = profileData?.seeking?.join(', ') || 'music collaborations'

  return {
    title: `${userData.full_name} - ${instrument} | BandSeeking`,
    description: `Connect with ${userData.full_name}, a ${profileData?.experience_level || 'talented'} ${allInstruments} player interested in ${genres}. Looking for ${seeking}.`,
    openGraph: {
      title: `${userData.full_name} - ${instrument} on BandSeeking`,
      description: `${profileData?.bio || `Connect with ${userData.full_name} for music collaborations`}`,
      type: 'profile',
      images: profileData?.profile_image_url ? [profileData.profile_image_url] : [],
    },
    twitter: {
      card: 'summary',
      title: `${userData.full_name} - ${instrument}`,
      description: `${profileData?.experience_level || 'Talented'} ${instrument} player on BandSeeking`,
    }
  }
}

export default async function ProfilePage({ 
  params 
}: { 
  params: Promise<{ username: string }> 
}) {
  const resolvedParams = await params
  // Fetch profile data for structured data
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('username', resolvedParams.username)
    .single()

  const { data: profileData } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userData?.id)
    .single()

  // Generate structured data for SEO
  const structuredData = userData && profileData ? {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: userData.full_name,
    url: `https://www.bandseeking.com/profile/${userData.username}`,
    image: profileData.profile_image_url,
    jobTitle: `${profileData.main_instrument} Player`,
    description: profileData.bio,
    address: {
      '@type': 'PostalAddress',
      postalCode: userData.zip_code,
    },
    knowsAbout: profileData.genres,
    skills: [profileData.main_instrument, ...(profileData.secondary_instruments || [])],
  } : null

  return (
    <>
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      )}
      <ProfileClient />
    </>
  )
}