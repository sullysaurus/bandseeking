// Profile completion and smart defaults utilities

export interface ProfileCompletion {
  percentage: number
  completedFields: string[]
  missingFields: string[]
  isUsingDefaults: boolean
}

export function calculateProfileCompletion(profile: any): ProfileCompletion {
  const defaultBio = 'Super cool person looking to collaborate. Shoot me a dm!'
  const defaultZipCode = '27601'
  
  const fields = {
    'Profile Photo': !!profile.profile_image_url,
    'Custom Bio': profile.bio && profile.bio !== defaultBio,
    'Location': profile.zip_code && profile.zip_code !== defaultZipCode,
    'Social Links': profile.social_links && Object.values(profile.social_links).some(Boolean),
    'Secondary Instrument': !!profile.secondary_instrument,
    'Influences': profile.influences && profile.influences.trim() !== '' && profile.influences !== 'The Beatles, Led Zeppelin, Pink Floyd',
    'Looking For': profile.seeking && profile.seeking.length > 0 && !profile.seeking.every((s: string) => s === 'Band members' || s === 'Collaborators'),
    'Custom Username': profile.username && !profile.username.match(/^(guitarist|drummer|vocalist|bassist|keyboardist|producer|songwriter|rockstar)_\d+$/)
  }
  
  const completedFields = Object.entries(fields)
    .filter(([_, completed]) => completed)
    .map(([field, _]) => field)
  
  const missingFields = Object.entries(fields)
    .filter(([_, completed]) => !completed)
    .map(([field, _]) => field)
  
  const percentage = Math.round((completedFields.length / Object.keys(fields).length) * 100)
  
  const isUsingDefaults = 
    profile.bio === defaultBio ||
    profile.zip_code === defaultZipCode ||
    profile.influences === 'The Beatles, Led Zeppelin, Pink Floyd' ||
    (profile.seeking && profile.seeking.length === 2 && profile.seeking.includes('Band members') && profile.seeking.includes('Collaborators')) ||
    (profile.username && profile.username.match(/^(guitarist|drummer|vocalist|bassist|keyboardist|producer|songwriter|rockstar)_\d+$/))
  
  return {
    percentage,
    completedFields,
    missingFields,
    isUsingDefaults
  }
}

export function getProfileCompletionMessage(completion: ProfileCompletion): string {
  if (completion.percentage === 100) {
    return "🎉 Your profile is complete and looks amazing!"
  }
  
  if (completion.percentage >= 80) {
    return "🎸 Almost there! Your profile looks great."
  }
  
  if (completion.percentage >= 60) {
    return "🎵 Good progress! A few more details will make you stand out."
  }
  
  if (completion.percentage >= 40) {
    return "📝 Your profile is taking shape. Keep customizing!"
  }
  
  return "⚡ Customize your defaults to get noticed by other musicians!"
}

export function getRandomEncouragingMessage(): string {
  const messages = [
    "Make your profile pop! 🎸",
    "Stand out from the crowd! 🌟", 
    "Show off your musical personality! 🎵",
    "Let other musicians know who you are! 🎤",
    "Complete profiles get 3x more messages! 📨"
  ]
  
  return messages[Math.floor(Math.random() * messages.length)]
}