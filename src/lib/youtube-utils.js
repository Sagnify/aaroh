export const getYouTubeDuration = async (url) => {
  try {
    const response = await fetch('/api/youtube/duration', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    
    if (response.ok) {
      const data = await response.json()
      return { duration: data.duration, seconds: data.seconds }
    }
    return { duration: '0:00', seconds: 0 }
  } catch (error) {
    console.error('Error fetching YouTube duration:', error)
    return { duration: '0:00', seconds: 0 }
  }
}

export const calculateTotalDuration = (videos) => {
  const totalSeconds = videos.reduce((sum, video) => {
    return sum + (video.durationSeconds || 0)
  }, 0)
  
  return formatDuration(totalSeconds)
}

export const formatDuration = (totalSeconds) => {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  return `${minutes}m`
}