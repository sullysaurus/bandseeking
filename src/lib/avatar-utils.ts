// Avatar utility functions for default avatars and placeholders

export interface AvatarOption {
  id: string
  name: string
  bgColor: string
  iconColor: string
  pattern?: 'solid' | 'gradient' | 'music-notes' | 'waves' | 'geometric'
}

// Default avatar options that users can choose from
export const defaultAvatarOptions: AvatarOption[] = [
  {
    id: 'bandseeking-logo',
    name: 'BandSeeking Logo',
    bgColor: 'bg-accent-teal',
    iconColor: 'text-black',
    pattern: 'solid'
  },
  {
    id: 'purple-gradient',
    name: 'Purple Gradient',
    bgColor: 'bg-gradient-to-br from-accent-purple to-accent-purple/60',
    iconColor: 'text-white',
    pattern: 'gradient'
  },
  {
    id: 'music-notes',
    name: 'Music Notes',
    bgColor: 'bg-gradient-to-br from-success to-success/60',
    iconColor: 'text-white',
    pattern: 'music-notes'
  },
  {
    id: 'orange-waves',
    name: 'Orange Waves',
    bgColor: 'bg-gradient-to-br from-orange-500 to-orange-400',
    iconColor: 'text-white',
    pattern: 'waves'
  },
  {
    id: 'teal-geometric',
    name: 'Teal Geometric',
    bgColor: 'bg-gradient-to-br from-accent-teal to-accent-teal/70',
    iconColor: 'text-black',
    pattern: 'geometric'
  },
  {
    id: 'dark-minimal',
    name: 'Dark Minimal',
    bgColor: 'bg-gradient-to-br from-gray-700 to-gray-600',
    iconColor: 'text-white',
    pattern: 'solid'
  }
]

// Header/cover image options
export interface HeaderImageOption {
  id: string
  name: string
  gradient: string
  pattern: string
  description: string
}

export const headerImageOptions: HeaderImageOption[] = [
  {
    id: 'music-studio',
    name: 'Music Studio',
    gradient: 'bg-gradient-to-br from-accent-teal/30 via-accent-purple/20 to-success/30',
    pattern: 'bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] bg-[length:20px_20px]',
    description: 'Professional studio vibe with subtle dots'
  },
  {
    id: 'concert-stage',
    name: 'Concert Stage', 
    gradient: 'bg-gradient-to-br from-accent-purple/30 via-orange-500/20 to-accent-teal/30',
    pattern: 'bg-[linear-gradient(45deg,rgba(255,255,255,0.1)_25%,transparent_25%),linear-gradient(-45deg,rgba(255,255,255,0.1)_25%,transparent_25%)] bg-[length:12px_12px]',
    description: 'Dynamic stage lighting with geometric patterns'
  },
  {
    id: 'vinyl-records',
    name: 'Vinyl Records',
    gradient: 'bg-gradient-to-br from-gray-800/40 via-accent-teal/20 to-gray-700/40',
    pattern: 'bg-[radial-gradient(circle_at_25%_25%,rgba(255,255,255,0.05)_0%,transparent_40%),radial-gradient(circle_at_75%_75%,rgba(255,255,255,0.05)_0%,transparent_40%)] bg-[length:40px_40px]',
    description: 'Classic vinyl aesthetic with circular patterns'
  },
  {
    id: 'sound-waves',
    name: 'Sound Waves',
    gradient: 'bg-gradient-to-br from-success/30 via-accent-teal/20 to-accent-purple/20',
    pattern: 'bg-[linear-gradient(90deg,rgba(255,255,255,0.05)_50%,transparent_50%)] bg-[length:8px_100%]',
    description: 'Audio waveform pattern'
  },
  {
    id: 'festival-crowd',
    name: 'Festival Crowd',
    gradient: 'bg-gradient-to-br from-orange-500/30 via-accent-purple/25 to-success/25',
    pattern: 'bg-[conic-gradient(from_45deg,rgba(255,255,255,0.05),transparent,rgba(255,255,255,0.05))] bg-[length:16px_16px]',
    description: 'Energetic festival atmosphere'
  },
  {
    id: 'minimal-dark',
    name: 'Minimal Dark',
    gradient: 'bg-gradient-to-br from-gray-800/50 via-gray-700/30 to-gray-900/50',
    pattern: '',
    description: 'Clean and minimal design'
  }
]

// Get default avatar for a user based on their initials
export const getDefaultAvatar = (name: string, selectedAvatarId?: string): AvatarOption => {
  if (selectedAvatarId) {
    const selected = defaultAvatarOptions.find(option => option.id === selectedAvatarId)
    if (selected) return selected
  }
  
  // Default to BandSeeking logo
  return defaultAvatarOptions[0]
}

// Get header image for profile/band
export const getDefaultHeaderImage = (selectedHeaderId?: string): HeaderImageOption => {
  if (selectedHeaderId) {
    const selected = headerImageOptions.find(option => option.id === selectedHeaderId)
    if (selected) return selected
  }
  
  // Default to music studio
  return headerImageOptions[0]
}

// Generate initials from name
export const getInitials = (name: string): string => {
  if (!name) return 'BS' // BandSeeking initials as fallback
  
  const parts = name.trim().split(' ')
  if (parts.length === 1) {
    return parts[0].substring(0, 2).toUpperCase()
  }
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

// Check if URL is valid image
export const isValidImageUrl = (url?: string): boolean => {
  if (!url) return false
  return url.startsWith('http') || url.startsWith('/') || url.startsWith('data:image')
}