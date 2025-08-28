'use client'

import { useState, useEffect } from 'react'

export default function MagicLinkInfo() {
  const [isLocal, setIsLocal] = useState(false)

  useEffect(() => {
    setIsLocal(window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  }, [])

  if (!isLocal) return null

  return (
    <div className="mt-4 p-4 bg-yellow-100 border-2 border-black">
      <p className="font-bold text-sm">
        🚧 <span className="font-black">LOCAL DEVELOPMENT MODE</span>
      </p>
      <p className="font-bold text-xs mt-2">
        Emails are captured locally. View them at:{' '}
        <a 
          href="http://127.0.0.1:54324" 
          target="_blank" 
          rel="noopener noreferrer"
          className="underline text-blue-600 hover:text-blue-800"
        >
          http://127.0.0.1:54324
        </a>
      </p>
    </div>
  )
}