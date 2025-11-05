"use client"

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Settings, SkipForward, SkipBack, Maximize } from 'lucide-react'

export default function VideoPlayer({ youtubeUrl, title, onVideoEnd, courseId, videoId, initialTimestamp = 0, onProgressUpdate }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolume] = useState(100)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  
  const playerRef = useRef(null)
  const containerRef = useRef(null)
  const timelineRef = useRef(null)

  const getVideoId = (url) => {
    return url?.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
  }

  useEffect(() => {
    const videoId = getVideoId(youtubeUrl)
    if (!videoId) return

    // Load YouTube IFrame API
    if (!window.YT) {
      const tag = document.createElement('script')
      tag.src = 'https://www.youtube.com/iframe_api'
      const firstScriptTag = document.getElementsByTagName('script')[0]
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag)

      window.onYouTubeIframeAPIReady = () => {
        initPlayer(videoId)
      }
    } else {
      initPlayer(videoId)
    }

    return () => {
      if (playerRef.current && playerRef.current.destroy) {
        playerRef.current.destroy()
      }
    }
  }, [youtubeUrl])

  const initPlayer = (videoId) => {
    if (playerRef.current && playerRef.current.destroy) {
      playerRef.current.destroy()
    }

    playerRef.current = new window.YT.Player('youtube-player', {
      videoId: videoId,
      playerVars: {
        controls: 0,
        modestbranding: 1,
        rel: 0,
        showinfo: 0,
        fs: 0,
        cc_load_policy: 0,
        iv_load_policy: 3,
        autohide: 1,
        disablekb: 1,
        playsinline: 1
      },
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange
      }
    })
  }

  const onPlayerReady = (event) => {
    setDuration(event.target.getDuration())
    setVolume(event.target.getVolume())
    
    // Resume from last position if available
    if (initialTimestamp > 0) {
      event.target.seekTo(initialTimestamp, true)
      setCurrentTime(initialTimestamp)
      setProgress((initialTimestamp / event.target.getDuration()) * 100)
    }
  }

  const onPlayerStateChange = (event) => {
    const isCurrentlyPlaying = event.data === window.YT.PlayerState.PLAYING
    setIsPlaying(isCurrentlyPlaying)
    
    // Handle video end
    if (event.data === window.YT.PlayerState.ENDED && onVideoEnd) {
      onVideoEnd()
    }
  }

  useEffect(() => {
    let interval
    let saveInterval
    
    if (isPlaying && playerRef.current) {
      // Update progress every 100ms for smooth timeline
      interval = setInterval(() => {
        if (playerRef.current && !isDragging) {
          const current = playerRef.current.getCurrentTime()
          const total = playerRef.current.getDuration()
          if (total > 0) {
            setCurrentTime(current)
            setDuration(total)
            setProgress((current / total) * 100)
            // Notify parent of progress update
            if (onProgressUpdate) {
              onProgressUpdate(current)
            }
          }
        }
      }, 100)
      
      // Save progress every 15 seconds
      saveInterval = setInterval(() => {
        if (playerRef.current && courseId && videoId) {
          const current = playerRef.current.getCurrentTime()
          const total = playerRef.current.getDuration()
          if (current > 0 && total > 0) {
            saveProgress(current, current >= total * 0.9)
          }
        }
      }, 15000)
    }
    
    return () => {
      if (interval) clearInterval(interval)
      if (saveInterval) clearInterval(saveInterval)
    }
  }, [isPlaying, isDragging, courseId, videoId])

  const saveProgress = async (timestamp, completed = false) => {
    if (timestamp <= 0) return
    
    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: String(courseId),
          videoId: String(videoId),
          timestamp: Math.floor(timestamp),
          completed
        })
      })
      
      if (!response.ok) {
        console.error('Progress save failed:', response.status)
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const togglePlayPause = () => {
    if (!playerRef.current) return
    
    if (isPlaying) {
      playerRef.current.pauseVideo()
    } else {
      playerRef.current.playVideo()
    }
  }

  const toggleMute = () => {
    if (!playerRef.current) return
    
    if (isMuted) {
      playerRef.current.unMute()
      setIsMuted(false)
    } else {
      playerRef.current.mute()
      setIsMuted(true)
    }
  }

  const changeVolume = (newVolume) => {
    if (!playerRef.current) return
    playerRef.current.setVolume(newVolume)
    setVolume(newVolume)
    setIsMuted(newVolume === 0)
  }

  const changePlaybackRate = (rate) => {
    if (!playerRef.current) return
    playerRef.current.setPlaybackRate(rate)
    setPlaybackRate(rate)
    setShowSettings(false)
  }

  const seekTo = (time) => {
    if (!playerRef.current) return
    playerRef.current.seekTo(time, true)
    setCurrentTime(time)
    setProgress((time / duration) * 100)
  }

  const skip = (seconds) => {
    const newTime = Math.max(0, Math.min(duration, currentTime + seconds))
    seekTo(newTime)
  }

  const handleTimelineClick = (e) => {
    if (!timelineRef.current || !duration) return
    
    const rect = timelineRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = Math.max(0, Math.min(1, clickX / rect.width))
    const newTime = percentage * duration
    
    seekTo(newTime)
  }

  const handleMouseDown = (e) => {
    setIsDragging(true)
    handleTimelineClick(e)
  }

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleTimelineClick(e)
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const toggleFullscreen = () => {
    if (!containerRef.current) return
    
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen()
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen()
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement)
    }

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange)
  }, [])

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      switch(e.key) {
        case ' ':
          e.preventDefault()
          togglePlayPause()
          break
        case 'ArrowLeft':
          e.preventDefault()
          skip(-5)
          break
        case 'ArrowRight':
          e.preventDefault()
          skip(5)
          break
        case 'm':
        case 'M':
          e.preventDefault()
          toggleMute()
          break
        case 'f':
        case 'F':
          e.preventDefault()
          toggleFullscreen()
          break
      }
    }

    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [isPlaying, currentTime, duration])

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!getVideoId(youtubeUrl)) {
    return (
      <div className="aspect-video bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20 flex items-center justify-center rounded-lg">
        <div className="text-center">
          <Play className="w-20 h-20 text-[#a0303f] mx-auto mb-4" />
          <p className="text-[#a0303f] font-medium">Invalid video URL</p>
        </div>
      </div>
    )
  }

  return (
    <div 
      ref={containerRef}
      className={`relative bg-black rounded-lg overflow-hidden group ${isFullscreen ? 'fixed inset-0 z-50' : 'aspect-video'}`}
      tabIndex={0}
    >
      <div id="youtube-player" className="w-full h-full" />
      
      {/* Invisible overlay to block YouTube clicks */}
      <div 
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={togglePlayPause}
        onDoubleClick={toggleFullscreen}
      />
      
      {/* Custom Controls Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-20">
        {/* Timeline */}
        <div className="absolute bottom-16 left-4 right-4 pointer-events-auto">
          <div 
            ref={timelineRef}
            className="relative w-full h-2 bg-white/20 rounded-full cursor-pointer hover:h-3 transition-all group/timeline"
            onMouseDown={handleMouseDown}
          >
            <div 
              className="h-full bg-[#ff6b6b] rounded-full transition-all pointer-events-none"
              style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
            />
            <div 
              className="absolute top-1/2 w-4 h-4 bg-[#ff6b6b] rounded-full transform -translate-y-1/2 -translate-x-1/2 opacity-0 group-hover/timeline:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
              style={{ left: `${Math.max(0, Math.min(100, progress))}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-white/70 mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <button
                onClick={togglePlayPause}
                className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-6 h-6 text-white" />
                ) : (
                  <Play className="w-6 h-6 text-white ml-1" />
                )}
              </button>
              
              <button
                onClick={() => skip(-5)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Skip backward 5s"
              >
                <SkipBack className="w-5 h-5 text-white" />
              </button>
              
              <button
                onClick={() => skip(5)}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Skip forward 5s"
              >
                <SkipForward className="w-5 h-5 text-white" />
              </button>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  {isMuted ? (
                    <VolumeX className="w-5 h-5 text-white" />
                  ) : (
                    <Volume2 className="w-5 h-5 text-white" />
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={isMuted ? 0 : volume}
                  onChange={(e) => changeVolume(parseInt(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <div className="relative">
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                >
                  <Settings className="w-5 h-5 text-white" />
                </button>
                
                {showSettings && (
                  <div className="absolute bottom-12 right-0 bg-black/90 backdrop-blur-sm rounded-lg p-3 min-w-[140px]">
                    <div className="text-white text-sm font-medium mb-2">Playback Speed</div>
                    {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2].map((rate) => (
                      <button
                        key={rate}
                        onClick={() => changePlaybackRate(rate)}
                        className={`w-full text-left px-2 py-1 text-sm rounded hover:bg-white/20 transition-colors ${
                          playbackRate === rate ? 'text-[#ff6b6b] bg-white/10' : 'text-white'
                        }`}
                      >
                        {rate}x {rate === 1 ? '(Normal)' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              
              <button
                onClick={toggleFullscreen}
                className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-colors"
                title="Fullscreen (F)"
              >
                <Maximize className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}