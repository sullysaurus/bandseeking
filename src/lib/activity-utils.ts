// Utility functions for activity status and response time indicators

export function getActivityStatus(lastActiveAt: string | null) {
  if (!lastActiveAt) return { status: 'inactive', label: 'Last seen unknown', color: 'text-medium' }
  
  const now = new Date()
  const lastActive = new Date(lastActiveAt)
  const diffInMinutes = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 5) {
    return { status: 'online', label: 'Active now', color: 'text-success' }
  } else if (diffInMinutes < 30) {
    return { status: 'recent', label: `Active ${diffInMinutes}m ago`, color: 'text-success' }
  } else if (diffInMinutes < 120) {
    const hours = Math.floor(diffInMinutes / 60)
    return { status: 'recent', label: `Active ${hours}h ago`, color: 'text-orange-400' }
  } else if (diffInMinutes < 1440) { // 24 hours
    const hours = Math.floor(diffInMinutes / 60)
    return { status: 'away', label: `Active ${hours}h ago`, color: 'text-orange-400' }
  } else {
    const days = Math.floor(diffInMinutes / 1440)
    return { status: 'inactive', label: `Active ${days}d ago`, color: 'text-medium' }
  }
}

export function getResponseSpeedInfo(responseTimeType: 'quick' | 'standard' | 'slow' | null, avgResponseMinutes: number | null) {
  if (!responseTimeType || !avgResponseMinutes) {
    return { label: 'Response time unknown', color: 'text-medium', icon: '?' }
  }
  
  switch (responseTimeType) {
    case 'quick':
      return { 
        label: `Usually responds in ${formatResponseTime(avgResponseMinutes)}`, 
        color: 'text-success', 
        icon: '⚡' 
      }
    case 'standard':
      return { 
        label: `Usually responds in ${formatResponseTime(avgResponseMinutes)}`, 
        color: 'text-orange-400', 
        icon: '⏱️' 
      }
    case 'slow':
      return { 
        label: `Usually responds in ${formatResponseTime(avgResponseMinutes)}`, 
        color: 'text-medium', 
        icon: '🐌' 
      }
    default:
      return { label: 'Response time unknown', color: 'text-medium', icon: '?' }
  }
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) {
    return `${minutes}m`
  } else if (minutes < 1440) { // 24 hours
    const hours = Math.floor(minutes / 60)
    return `${hours}h`
  } else {
    const days = Math.floor(minutes / 1440)
    return `${days}d`
  }
}