import Image from 'next/image'

interface LogoProps {
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export default function Logo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12',
    xl: 'h-16'
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`} style={{ aspectRatio: '200/60' }}>
      <Image
        src="/logo-eyes.png"
        alt="BandSeeking"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 120px, 200px"
      />
    </div>
  )
}

// Alternative version with the same logo image
export function StylizedLogo({ className = '', size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8', 
    lg: 'h-12',
    xl: 'h-16'
  }

  return (
    <div className={`${sizeClasses[size]} relative ${className}`} style={{ aspectRatio: '200/60' }}>
      <Image
        src="/logo-eyes.png"
        alt="BandSeeking"
        fill
        className="object-contain"
        priority
        sizes="(max-width: 768px) 120px, 200px"
      />
    </div>
  )
}