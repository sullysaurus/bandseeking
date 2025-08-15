import { Profile } from './profiles'

export function isProfileComplete(profile: Profile | null): boolean {
  if (!profile) return false
  
  // Check required fields for a "complete" profile
  const hasBasics = Boolean(
    profile.full_name && 
    profile.username && 
    profile.bio
  )
  
  const hasInstruments = profile.instruments && profile.instruments.length > 0
  const hasGenres = profile.genres && profile.genres.length > 0
  const hasLookingFor = profile.looking_for && profile.looking_for.length > 0
  
  return hasBasics && hasInstruments && hasGenres && hasLookingFor
}

export function getProfileCompletionTasks(profile: Profile | null): string[] {
  const tasks: string[] = []
  
  if (!profile) {
    tasks.push('Create your profile')
    return tasks
  }
  
  if (!profile.full_name) {
    tasks.push('Add your full name')
  }
  
  if (!profile.bio) {
    tasks.push('Write a bio about yourself')
  }
  
  if (!profile.instruments || profile.instruments.length === 0) {
    tasks.push('Add your instruments')
  }
  
  if (!profile.genres || profile.genres.length === 0) {
    tasks.push('Add your favorite genres')
  }
  
  if (!profile.looking_for || profile.looking_for.length === 0) {
    tasks.push('Specify what you\'re looking for')
  }
  
  if (!profile.location) {
    tasks.push('Add your location (optional but helpful)')
  }
  
  return tasks
}

export function getProfileCompletionPercentage(profile: Profile | null): number {
  if (!profile) return 0
  
  const totalFields = 6 // full_name, bio, instruments, genres, looking_for, location
  let completedFields = 0
  
  if (profile.full_name) completedFields++
  if (profile.bio) completedFields++
  if (profile.instruments && profile.instruments.length > 0) completedFields++
  if (profile.genres && profile.genres.length > 0) completedFields++
  if (profile.looking_for && profile.looking_for.length > 0) completedFields++
  if (profile.location) completedFields++
  
  return (completedFields / totalFields) * 100
}