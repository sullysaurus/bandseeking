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
    <svg
      viewBox="0 0 280 60"
      className={`${sizeClasses[size]} w-auto ${className}`}
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Band text in teal */}
      <text
        x="0"
        y="45"
        className="fill-accent-teal"
        style={{
          fontSize: '36px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: '600'
        }}
      >
        Band
      </text>
      
      {/* Seeking text in gray */}
      <text
        x="90"
        y="45"
        className="fill-secondary"
        style={{
          fontSize: '36px',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          fontWeight: '600'
        }}
      >
        Seeking
      </text>
    </svg>
  )
}

// Alternative version with a more stylized design
export function StylizedLogo({ className = '', size = 'md' }: LogoProps) {
  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl', 
    lg: 'text-3xl',
    xl: 'text-4xl'
  }

  return (
    <div className={`flex items-center ${className}`}>
      <span className={`text-accent-teal font-semibold ${textSizeClasses[size]}`}>Band</span>
      <span className={`text-secondary font-semibold ${textSizeClasses[size]}`}>Seeking</span>
    </div>
  )
}