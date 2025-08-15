'use client'

import { useEffect } from 'react'
import { enableFetchDebugging } from '@/lib/debug-fetch'

export default function DebugProvider() {
  useEffect(() => {
    // Only enable in development or when debugging is needed
    if (process.env.NODE_ENV === 'development' || 
        typeof window !== 'undefined' && window.location.search.includes('debug=true')) {
      enableFetchDebugging()
    }
  }, [])

  return null
}