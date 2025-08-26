'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

declare global {
  interface Window {
    fbq: any
  }
}

interface FacebookPixelProps {
  pixelId: string
}

function FacebookPixelInner({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!pixelId) return

    // Initialize Facebook Pixel
    import('react-facebook-pixel')
      .then((x) => x.default)
      .then((ReactPixel) => {
        ReactPixel.init(pixelId)
        ReactPixel.pageView()

        // Set up global fbq function
        window.fbq = ReactPixel.fbq
      })
  }, [pixelId])

  useEffect(() => {
    if (!window.fbq) return

    // Track page views on route changes
    window.fbq('track', 'PageView')
  }, [pathname, searchParams])

  return null
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  return (
    <Suspense fallback={null}>
      <FacebookPixelInner pixelId={pixelId} />
    </Suspense>
  )
}

// Conversion tracking functions
export const trackEvent = (eventName: string, parameters?: object) => {
  if (typeof window !== 'undefined' && window.fbq) {
    window.fbq('track', eventName, parameters)
  }
}

// Predefined conversion events for BandSeeking
export const trackRegistration = (method: string = 'email') => {
  trackEvent('CompleteRegistration', {
    content_name: 'User Registration',
    content_category: 'account',
    value: 0,
    currency: 'USD',
    custom_data: { method }
  })
}

export const trackProfileComplete = () => {
  trackEvent('Lead', {
    content_name: 'Profile Completion',
    content_category: 'onboarding',
    value: 0,
    currency: 'USD'
  })
}

export const trackSearch = (searchQuery: string) => {
  trackEvent('Search', {
    search_string: searchQuery,
    content_category: 'musicians'
  })
}

export const trackContact = (contactType: string = 'message') => {
  trackEvent('Contact', {
    content_name: 'Musician Contact',
    content_category: 'engagement',
    value: 0,
    currency: 'USD',
    custom_data: { contactType }
  })
}

export const trackSave = (itemType: string = 'musician') => {
  trackEvent('AddToWishlist', {
    content_name: `Save ${itemType}`,
    content_category: 'engagement'
  })
}

export const trackVenueSearch = (searchQuery: string) => {
  trackEvent('Search', {
    search_string: searchQuery,
    content_category: 'venues'
  })
}