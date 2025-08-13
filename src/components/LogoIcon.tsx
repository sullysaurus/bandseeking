interface LogoIconProps {
  className?: string
  size?: number
}

export default function LogoIcon({ className = '', size = 24 }: LogoIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Musical note symbol with brand colors */}
      <circle 
        cx="6" 
        cy="18" 
        r="2" 
        className="fill-accent-teal"
      />
      <circle 
        cx="18" 
        cy="14" 
        r="2" 
        className="fill-secondary"
      />
      <path 
        d="M8 18V6l10-2v10" 
        className="stroke-accent-teal" 
        strokeWidth="2" 
        fill="none"
      />
      <path 
        d="M18 12V2" 
        className="stroke-secondary" 
        strokeWidth="2" 
        fill="none"
      />
    </svg>
  )
}

// Simplified version for very small sizes
export function LogoIconSimple({ className = '', size = 16 }: LogoIconProps) {
  return (
    <div 
      className={`rounded-full flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      <div className="w-2 h-2 bg-accent-teal rounded-full" />
    </div>
  )
}