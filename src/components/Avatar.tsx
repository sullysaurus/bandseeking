'use client'

interface AvatarProps {
  src?: string
  name: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base', 
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-xl'
}

export default function Avatar({ 
  src, 
  name, 
  size = 'md', 
  className = ''
}: AvatarProps) {
  const hasValidImage = src && (src.startsWith('http') || src.startsWith('/') || src.startsWith('data:image'))
  
  if (hasValidImage) {
    return (
      <div className={`${sizeClasses[size]} ${className} rounded-full overflow-hidden`}>
        <img 
          src={src} 
          alt={`${name} avatar`}
          className="w-full h-full object-cover"
          onError={(e) => {
            // If image fails to load, hide it and show fallback
            e.currentTarget.style.display = 'none'
          }}
        />
      </div>
    )
  }

  // Show "BS" text fallback
  return (
    <div className={`
      ${sizeClasses[size]} 
      bg-accent-teal
      text-black
      ${className}
      rounded-full 
      flex 
      items-center 
      justify-center 
      font-bold
    `}>
      BS
    </div>
  )
}