// Zip code to city/state lookup using Zippopotam.us API
// This provides comprehensive coverage of all US zip codes

interface LocationInfo {
  city: string
  state: string
  lat?: number
  lng?: number
}

// Cache for API results to avoid repeated calls
const locationCache = new Map<string, LocationInfo | null>()

/**
 * Fetches location data from Zippopotam.us API
 * @param zipCode - 5-digit US zip code
 * @returns LocationInfo object with city and state, or null if not found
 */
async function fetchLocationFromAPI(zipCode: string): Promise<LocationInfo | null> {
  try {
    const response = await fetch(`https://api.zippopotam.us/us/${zipCode}`)
    
    if (!response.ok) {
      return null
    }
    
    const data = await response.json()
    
    if (data.places && data.places.length > 0) {
      const place = data.places[0]
      return {
        city: place['place name'],
        state: place['state abbreviation'],
        lat: parseFloat(place.latitude),
        lng: parseFloat(place.longitude)
      }
    }
    
    return null
  } catch (error) {
    console.warn('Failed to fetch location for zip code:', zipCode, error)
    return null
  }
}

// Basic fallback lookup for offline/error cases - just major cities
const FALLBACK_ZIP_TO_LOCATION: Record<string, LocationInfo> = {
  // New York
  '10001': { city: 'New York', state: 'NY' },
  '10002': { city: 'New York', state: 'NY' },
  '10003': { city: 'New York', state: 'NY' },
  
  // Los Angeles  
  '90001': { city: 'Los Angeles', state: 'CA' },
  '90210': { city: 'Beverly Hills', state: 'CA' },
  
  // Chicago
  '60601': { city: 'Chicago', state: 'IL' },
  '60602': { city: 'Chicago', state: 'IL' },
  
  // Houston
  '77001': { city: 'Houston', state: 'TX' },
  '77002': { city: 'Houston', state: 'TX' },
  
  // Phoenix
  '85001': { city: 'Phoenix', state: 'AZ' },
  '85002': { city: 'Phoenix', state: 'AZ' },
  
  // Philadelphia
  '19101': { city: 'Philadelphia', state: 'PA' },
  '19102': { city: 'Philadelphia', state: 'PA' },
  
  // San Antonio
  '78201': { city: 'San Antonio', state: 'TX' },
  '78202': { city: 'San Antonio', state: 'TX' },
  
  // San Diego
  '92101': { city: 'San Diego', state: 'CA' },
  '92102': { city: 'San Diego', state: 'CA' },
  
  // Dallas
  '75201': { city: 'Dallas', state: 'TX' },
  '75202': { city: 'Dallas', state: 'TX' },
  
  // San Jose
  '95101': { city: 'San Jose', state: 'CA' },
  '95102': { city: 'San Jose', state: 'CA' },
  
  // Austin
  '78701': { city: 'Austin', state: 'TX' },
  '78702': { city: 'Austin', state: 'TX' },
  
  // San Francisco
  '94102': { city: 'San Francisco', state: 'CA' },
  '94103': { city: 'San Francisco', state: 'CA' },
  
  // Miami
  '33101': { city: 'Miami', state: 'FL' },
  '33102': { city: 'Miami', state: 'FL' },
  
  // Seattle
  '98101': { city: 'Seattle', state: 'WA' },
  '98102': { city: 'Seattle', state: 'WA' },
  
  // Denver
  '80201': { city: 'Denver', state: 'CO' },
  '80202': { city: 'Denver', state: 'CO' },
  
  // Brooklyn
  '11201': { city: 'Brooklyn', state: 'NY' },
  '11215': { city: 'Brooklyn', state: 'NY' },
  
  // Queens
  '11101': { city: 'Queens', state: 'NY' },
  '11354': { city: 'Queens', state: 'NY' },
  
  // Bronx
  '10451': { city: 'Bronx', state: 'NY' },
  '10452': { city: 'Bronx', state: 'NY' },
}

/**
 * Converts a zip code to city and state using API with caching
 * @param zipCode - 5-digit US zip code
 * @returns Promise<LocationInfo | null>
 */
export async function getLocationFromZipCode(zipCode: string): Promise<LocationInfo | null> {
  if (!zipCode || zipCode.length !== 5) {
    return null
  }
  
  // Check cache first
  if (locationCache.has(zipCode)) {
    return locationCache.get(zipCode) || null
  }
  
  // Try API first
  const apiResult = await fetchLocationFromAPI(zipCode)
  if (apiResult) {
    locationCache.set(zipCode, apiResult)
    return apiResult
  }
  
  // Fall back to local lookup
  const fallbackResult = FALLBACK_ZIP_TO_LOCATION[zipCode] || null
  locationCache.set(zipCode, fallbackResult)
  return fallbackResult
}

/**
 * Synchronous version using fallback data only
 * @param zipCode - 5-digit US zip code
 * @returns LocationInfo object with city and state, or null if not found
 */
export function getLocationFromZipCodeSync(zipCode: string): LocationInfo | null {
  if (!zipCode || zipCode.length !== 5) {
    return null
  }
  
  // Check cache first
  if (locationCache.has(zipCode)) {
    return locationCache.get(zipCode) || null
  }
  
  // Use fallback data
  return FALLBACK_ZIP_TO_LOCATION[zipCode] || null
}

/**
 * Formats location for display - tries cached/fallback lookup first, then zip code
 * @param zipCode - 5-digit US zip code
 * @returns Formatted location string (e.g., "Los Angeles, CA" or "12345")
 */
export function formatLocationDisplay(zipCode: string): string {
  if (!zipCode) return ''
  
  // Try synchronous lookup first (cache + fallback)
  const location = getLocationFromZipCodeSync(zipCode)
  if (location) {
    return `${location.city}, ${location.state}`
  }
  
  // Fallback to zip code if not found
  return zipCode
}

/**
 * Async version that tries API lookup then caches result
 * @param zipCode - 5-digit US zip code
 * @returns Promise<string> - Formatted location string
 */
export async function formatLocationDisplayAsync(zipCode: string): Promise<string> {
  if (!zipCode) return ''
  
  const location = await getLocationFromZipCode(zipCode)
  if (location) {
    return `${location.city}, ${location.state}`
  }
  
  return zipCode
}

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 * @param lat1 - Latitude of first point
 * @param lng1 - Longitude of first point  
 * @param lat2 - Latitude of second point
 * @param lng2 - Longitude of second point
 * @returns Distance in miles
 */
function calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLng = (lng2 - lng1) * Math.PI / 180
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLng/2) * Math.sin(dLng/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return R * c
}

/**
 * Parse location input to determine if it's a zip code, city, or city/state
 * @param locationInput - User input like "90210", "Los Angeles", or "Los Angeles, CA"
 * @returns object with parsed location data
 */
export function parseLocationInput(locationInput: string): {
  type: 'zipcode' | 'city' | 'city_state' | 'invalid'
  zipCode?: string
  city?: string
  state?: string
} {
  const trimmed = locationInput.trim()
  if (!trimmed) return { type: 'invalid' }
  
  // Check if it's a zip code (5 digits)
  if (/^\d{5}$/.test(trimmed)) {
    return { type: 'zipcode', zipCode: trimmed }
  }
  
  // Check if it contains a comma (city, state format)
  if (trimmed.includes(',')) {
    const parts = trimmed.split(',').map(p => p.trim())
    if (parts.length === 2 && parts[0] && parts[1]) {
      return { 
        type: 'city_state', 
        city: parts[0].toLowerCase(),
        state: parts[1].toLowerCase()
      }
    }
  }
  
  // Otherwise treat as city name
  return { type: 'city', city: trimmed.toLowerCase() }
}

/**
 * Check if a profile matches the location search criteria
 * @param profile - Profile with user data including zip_code
 * @param locationInput - User's location search input
 * @param radius - Search radius in miles
 * @returns Promise<boolean> - Whether the profile matches
 */
export async function matchesLocationSearch(profile: any, locationInput: string, radius: number): Promise<boolean> {
  if (!locationInput.trim()) return true // No location filter
  
  const profileZip = profile.user?.zip_code
  if (!profileZip) {
    console.log(`Profile ${profile.user?.username} has no zip code`)
    return false
  }
  
  const parsedInput = parseLocationInput(locationInput)
  console.log(`Parsed location input:`, parsedInput)
  
  if (parsedInput.type === 'zipcode' && parsedInput.zipCode) {
    // Get coordinates for both zip codes for precise distance calculation
    const searchLocation = await getLocationFromZipCode(parsedInput.zipCode)
    const profileLocation = await getLocationFromZipCode(profileZip)
    
    console.log(`Search location for ${parsedInput.zipCode}:`, searchLocation)
    console.log(`Profile location for ${profileZip} (${profile.user?.username}):`, profileLocation)
    
    // If both locations have coordinates, use precise distance calculation
    if (searchLocation?.lat && searchLocation?.lng && profileLocation?.lat && profileLocation?.lng) {
      const distance = calculateDistance(
        searchLocation.lat, searchLocation.lng,
        profileLocation.lat, profileLocation.lng
      )
      console.log(`Distance between ${parsedInput.zipCode} and ${profileZip}: ${distance.toFixed(2)} miles (radius: ${radius})`)
      return distance <= radius
    } else {
      console.log(`Missing coordinates - search: ${!!searchLocation}, profile: ${!!profileLocation}`)
    }
    
    // Fallback to improved zip code matching if coordinates unavailable
    if (radius <= 10) {
      // For small radius, only exact match or very close zip codes
      return profileZip === parsedInput.zipCode || 
             Math.abs(parseInt(profileZip) - parseInt(parsedInput.zipCode)) <= 5
    } else if (radius <= 25) {
      // Medium radius - check if first 4 digits match or close numeric range
      return profileZip.substring(0, 4) === parsedInput.zipCode.substring(0, 4) ||
             Math.abs(parseInt(profileZip) - parseInt(parsedInput.zipCode)) <= 500
    } else {
      // Large radius - first 3 digits or broader range
      return profileZip.substring(0, 3) === parsedInput.zipCode.substring(0, 3) ||
             Math.abs(parseInt(profileZip) - parseInt(parsedInput.zipCode)) <= 2000
    }
  }
  
  // For city or city/state searches, get the profile's location
  const profileLocation = await getLocationFromZipCode(profileZip)
  if (!profileLocation) return false
  
  if (parsedInput.type === 'city' && parsedInput.city) {
    // Match city name (case insensitive)
    return profileLocation.city.toLowerCase().includes(parsedInput.city)
  }
  
  if (parsedInput.type === 'city_state' && parsedInput.city && parsedInput.state) {
    // Match both city and state
    const cityMatch = profileLocation.city.toLowerCase().includes(parsedInput.city)
    
    // Improved state matching - handle both abbreviations and full names
    const inputState = parsedInput.state.toLowerCase()
    const profileState = profileLocation.state.toLowerCase()
    
    // Create a mapping of full state names to abbreviations
    const stateMap: Record<string, string> = {
      'north carolina': 'nc', 'south carolina': 'sc', 'california': 'ca',
      'new york': 'ny', 'florida': 'fl', 'texas': 'tx', 'illinois': 'il',
      'pennsylvania': 'pa', 'ohio': 'oh', 'georgia': 'ga', 'michigan': 'mi',
      'new jersey': 'nj', 'virginia': 'va', 'washington': 'wa', 'arizona': 'az',
      'massachusetts': 'ma', 'tennessee': 'tn', 'indiana': 'in', 'missouri': 'mo',
      'maryland': 'md', 'wisconsin': 'wi', 'colorado': 'co', 'minnesota': 'mn',
      'south dakota': 'sd', 'north dakota': 'nd', 'oregon': 'or', 'oklahoma': 'ok',
      'connecticut': 'ct', 'arkansas': 'ar', 'utah': 'ut', 'nevada': 'nv',
      'new mexico': 'nm', 'west virginia': 'wv', 'nebraska': 'ne', 'idaho': 'id',
      'hawaii': 'hi', 'new hampshire': 'nh', 'maine': 'me', 'rhode island': 'ri',
      'montana': 'mt', 'delaware': 'de', 'kansas': 'ks', 'louisiana': 'la',
      'wyoming': 'wy', 'alaska': 'ak', 'vermont': 'vt', 'alabama': 'al',
      'kentucky': 'ky', 'iowa': 'ia', 'mississippi': 'ms'
    }
    
    // Check direct match first
    const stateMatch = profileState === inputState ||
                      profileState.includes(inputState) ||
                      inputState.includes(profileState) ||
                      // Check if input is full name and profile is abbreviation
                      stateMap[inputState] === profileState ||
                      // Check if input is abbreviation and profile is full name
                      stateMap[profileState] === inputState
    
    console.log(`City/State matching: "${parsedInput.city}" in "${profileLocation.city}" = ${cityMatch}, "${inputState}" matches "${profileState}" = ${stateMatch}`)
    return cityMatch && stateMatch
  }
  
  return false
}