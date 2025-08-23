import { useState, useEffect } from 'react'
import { formatLocationDisplayAsync, getLocationFromZipCodeSync } from '@/lib/zipcode-utils'

/**
 * Hook to display location with API lookup and fallback
 * @param zipCode - 5-digit US zip code
 * @returns formatted location string
 */
export function useLocationDisplay(zipCode: string): string {
  const [location, setLocation] = useState<string>('')
  
  useEffect(() => {
    if (!zipCode) {
      setLocation('')
      return
    }
    
    // Try synchronous lookup first (cache + fallback)
    const syncResult = getLocationFromZipCodeSync(zipCode)
    if (syncResult) {
      setLocation(`${syncResult.city}, ${syncResult.state}`)
      return
    }
    
    // Set zip code as placeholder while API loads
    setLocation(zipCode)
    
    // Try API lookup in background
    formatLocationDisplayAsync(zipCode).then(result => {
      setLocation(result)
    }).catch(() => {
      // Keep zip code if API fails
      setLocation(zipCode)
    })
  }, [zipCode])
  
  return location
}