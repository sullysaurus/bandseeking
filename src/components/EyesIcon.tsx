'use client'

interface EyesIconProps {
  className?: string
  color?: string
}

export default function EyesIcon({ className = "w-6 h-6", color = "currentColor" }: EyesIconProps) {
  return (
    <svg 
      viewBox="0 0 24 24" 
      fill="none" 
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Left Eye */}
      <ellipse 
        cx="7" 
        cy="12" 
        rx="3.5" 
        ry="2.5" 
        fill={color}
        opacity="0.9"
      />
      <circle 
        cx="7" 
        cy="12" 
        r="1.2" 
        fill="white"
      />
      
      {/* Right Eye */}
      <ellipse 
        cx="17" 
        cy="12" 
        rx="3.5" 
        ry="2.5" 
        fill={color}
        opacity="0.9"
      />
      <circle 
        cx="17" 
        cy="12" 
        r="1.2" 
        fill="white"
      />
    </svg>
  )
}