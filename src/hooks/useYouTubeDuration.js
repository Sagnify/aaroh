import { useState, useEffect } from 'react'

export const useYouTubeDuration = (youtubeUrl) => {
  const [duration, setDuration] = useState('0:00')
  const [seconds, setSeconds] = useState(0)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!youtubeUrl) {
      setDuration('0:00')
      setSeconds(0)
      return
    }

    const fetchDuration = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/youtube/duration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: youtubeUrl })
        })
        
        if (response.ok) {
          const data = await response.json()
          setDuration(data.duration)
          setSeconds(data.seconds)
        }
      } catch (error) {
        console.error('Error fetching duration:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDuration()
  }, [youtubeUrl])

  return { duration, seconds, loading }
}

const parseDurationToSeconds = (duration) => {
  if (!duration) return 0
  const parts = duration.split(':').map(p => parseInt(p) || 0)
  
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    return parts[0] * 60 + parts[1]
  }
  return parts[0] || 0
}

export const useCourseDurations = (curriculum) => {
  const [durations, setDurations] = useState({})
  const [totalDuration, setTotalDuration] = useState('0m')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!curriculum || curriculum.length === 0) return

    const processDurations = async () => {
      setLoading(true)
      const newDurations = {}
      let totalSeconds = 0
      const videosNeedingFetch = []

      // First, use database values
      for (const section of curriculum) {
        if (section.videos) {
          for (const video of section.videos) {
            if (video.duration && video.duration !== '0:00') {
              // Use database value
              const seconds = parseDurationToSeconds(video.duration)
              newDurations[video.id] = {
                duration: video.duration,
                seconds
              }
              totalSeconds += seconds
            } else if (video.youtubeUrl) {
              // Mark for fetching
              videosNeedingFetch.push(video)
            }
          }
        }
      }

      // Calculate initial total with database values
      const hours = Math.floor(totalSeconds / 3600)
      const minutes = Math.floor((totalSeconds % 3600) / 60)
      setTotalDuration(hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`)
      setDurations(newDurations)
      setLoading(false)

      // Fetch missing durations as backup
      if (videosNeedingFetch.length > 0) {
        let additionalSeconds = 0
        for (const video of videosNeedingFetch) {
          try {
            const response = await fetch('/api/youtube/duration', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ url: video.youtubeUrl })
            })
            
            if (response.ok) {
              const data = await response.json()
              newDurations[video.id] = {
                duration: data.duration,
                seconds: data.seconds
              }
              additionalSeconds += data.seconds
            }
          } catch (error) {
            console.error('Error fetching duration for video:', video.id, error)
          }
        }

        // Update with fetched durations
        if (additionalSeconds > 0) {
          const newTotalSeconds = totalSeconds + additionalSeconds
          const newHours = Math.floor(newTotalSeconds / 3600)
          const newMinutes = Math.floor((newTotalSeconds % 3600) / 60)
          setTotalDuration(newHours > 0 ? `${newHours}h ${newMinutes}m` : `${newMinutes}m`)
          setDurations({...newDurations})
        }
      }
    }

    processDurations()
  }, [curriculum])

  return { durations, totalDuration, loading }
}