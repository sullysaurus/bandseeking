'use client'

import { useEffect } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import Script from 'next/script'

declare global {
  interface Window {
    fbq: any
    _fbq: any
  }
}

interface FacebookPixelProps {
  pixelId: string
}

function FacebookPixelInner({ pixelId }: FacebookPixelProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (!window.fbq) return

    // Track page views on route changes
    window.fbq('track', 'PageView')
  }, [pathname, searchParams])

  return null
}

export default function FacebookPixel({ pixelId }: FacebookPixelProps) {
  if (!pixelId) return null

  return (
    <>
      <Script
        id="facebook-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${pixelId}');
            fbq('track', 'PageView');
          `
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
      <Suspense fallback={null}>
        <FacebookPixelInner pixelId={pixelId} />
      </Suspense>
    </>
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