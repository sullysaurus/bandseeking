import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const location = searchParams.get('location')

  if (!location) {
    return NextResponse.json({ error: 'Location parameter is required' }, { status: 400 })
  }

  try {
    // Use Nominatim API with proper headers
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(location)},USA&format=json&limit=1`,
      {
        headers: {
          'User-Agent': 'BandSeeking/1.0'
        }
      }
    )

    if (!response.ok) {
      throw new Error('Geocoding failed')
    }

    const data = await response.json()
    
    if (data && data.length > 0) {
      return NextResponse.json({
        lat: parseFloat(data[0].lat),
        lon: parseFloat(data[0].lon),
        display_name: data[0].display_name
      })
    } else {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 })
    }
  } catch (error) {
    console.error('Geocoding error:', error)
    return NextResponse.json({ error: 'Failed to geocode location' }, { status: 500 })
  }
}