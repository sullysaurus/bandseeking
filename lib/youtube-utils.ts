// YouTube URL utilities for handling different URL formats

/**
 * Extracts YouTube video ID from various YouTube URL formats
 * Supports:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID  
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 * - https://m.youtube.com/watch?v=VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null
  
  // Remove any whitespace
  url = url.trim()
  
  // Various YouTube URL patterns
  const patterns = [
    // Standard watch URLs
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([^&\n?#]+)/,
    // Mobile URLs
    /m\.youtube\.com\/watch\?v=([^&\n?#]+)/,
    // Shortened URLs
    /youtu\.be\/([^&\n?#]+)/
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match && match[1]) {
      // Return the video ID (remove any additional parameters)
      return match[1].split('&')[0].split('?')[0]
    }
  }
  
  return null
}

/**
 * Converts any YouTube URL to an embeddable format
 */
export function getYouTubeEmbedUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null
  
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Validates if a URL is a valid YouTube URL
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}

/**
 * Normalizes a YouTube URL to the standard watch format
 */
export function normalizeYouTubeUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url)
  if (!videoId) return null
  
  return `https://www.youtube.com/watch?v=${videoId}`
}