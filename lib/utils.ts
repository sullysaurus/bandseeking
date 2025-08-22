import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const instruments = [
  'Guitar',
  'Bass',
  'Drums',
  'Vocals',
  'Keyboards/Piano',
  'Violin',
  'Saxophone',
  'Trumpet',
  'Trombone',
  'Flute',
  'Cello',
  'Harmonica',
  'Banjo',
  'Mandolin',
  'Ukulele',
  'DJ/Turntables',
  'Production/DAW',
  'Other'
]

export const genres = [
  'Rock',
  'Pop',
  'Jazz',
  'Blues',
  'Country',
  'Hip-Hop',
  'R&B/Soul',
  'Electronic/EDM',
  'Classical',
  'Folk',
  'Metal',
  'Punk',
  'Indie',
  'Alternative',
  'Reggae',
  'Latin',
  'World',
  'Experimental'
]

export const seekingOptions = [
  'Original Band Formation',
  'Cover Band',
  'Session Work',
  'Songwriting Collaboration',
  'Recording Projects',
  'Live Performance',
  'Music Lessons/Teaching',
  'Jam Sessions',
  'Studio Partnership',
  'Music Production'
]

export const experienceLevels = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'intermediate', label: 'Intermediate' },
  { value: 'advanced', label: 'Advanced' },
  { value: 'professional', label: 'Professional' }
]

export const availabilityOptions = [
  { value: 'weekdays', label: 'Weekdays' },
  { value: 'weekends', label: 'Weekends' },
  { value: 'evenings', label: 'Evenings' },
  { value: 'flexible', label: 'Flexible' }
]