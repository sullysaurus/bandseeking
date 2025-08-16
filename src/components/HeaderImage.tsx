'use client'

import { getDefaultHeaderImage, isValidImageUrl } from '@/lib/avatar-utils'

interface HeaderImageProps {
  src?: string
  selectedHeaderId?: string
  className?: string
  children?: React.ReactNode
  height?: 'sm' | 'md' | 'lg'
}

const heightClasses = {
  sm: 'h-32 md:h-40',
  md: 'h-40 md:h-48', 
  lg: 'h-48 md:h-56'
}

export default function HeaderImage({ 
  src, 
  selectedHeaderId,
  className = '',
  children,
  height = 'md'
}: HeaderImageProps) {
  const hasValidImage = isValidImageUrl(src)
  const defaultHeader = getDefaultHeaderImage(selectedHeaderId)
  
  if (hasValidImage) {
    return (
      <div className={`relative overflow-hidden ${heightClasses[height]} ${className}`}>
        <img 
          src={src} 
          alt="Header image"
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show default
            e.currentTarget.style.display = 'none'
          }}
        />
        {/* Dark overlay for better text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
        {children && (
          <div className="absolute inset-0">{children}</div>
        )}
      </div>
    )
  }

  // Show default header pattern
  return (
    <div className={`relative overflow-hidden ${heightClasses[height]} ${className}`}>
      {/* Background Pattern */}
      <div className={`absolute inset-0 ${defaultHeader.gradient}`}>
        {defaultHeader.pattern && (
          <div className={`absolute inset-0 ${defaultHeader.pattern}`}></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
      </div>
      
      {children && (
        <div className="absolute inset-0">{children}</div>
      )}
    </div>
  )
}