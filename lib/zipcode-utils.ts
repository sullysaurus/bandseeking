// Zip code to city/state lookup using Zippopotam.us API
// This provides comprehensive coverage of all US zip codes

interface LocationInfo {
  city: string
  state: string
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
        state: place['state abbreviation']
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