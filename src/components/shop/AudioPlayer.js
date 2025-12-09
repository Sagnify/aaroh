'use client'

import { useState, useRef, useEffect } from 'react'
import { Play, Pause, Volume2, VolumeX, Download } from 'lucide-react'

export default function AudioPlayer({ src, isPreview, onUnlock, unlockPrice, isPaid, songId }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const audioRef = useRef(null)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => setIsPlaying(false)

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
    }
  }, [])

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleSeek = (e) => {
    const audio = audioRef.current
    if (audio) {
      const rect = e.currentTarget.getBoundingClientRect()
      const x = e.clientX - rect.left
      const percentage = x / rect.width
      audio.currentTime = percentage * duration
    }
  }

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted
      setIsMuted(!isMuted)
    }
  }

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const formatTime = (time) => {
    if (isNaN(time)) return '0:00'
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0

  return (
    <div className="flex items-center gap-3 w-full">
      <audio ref={audioRef} src={src} />
      
      <button
        onClick={togglePlay}
        className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600 hover:bg-purple-700 text-white transition-colors flex-shrink-0"
      >
        {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 ml-0.5" />}
      </button>

      <div className="flex-1 flex items-center gap-2">
        <span className="text-xs text-gray-500 dark:text-gray-400 w-10 text-right">{formatTime(currentTime)}</span>
        
        <div className="flex-1 relative group">
          <div className="h-1 bg-gray-200 dark:bg-zinc-700 rounded-full overflow-hidden cursor-pointer" onClick={handleSeek}>
            <div className="h-full bg-purple-600 transition-all" style={{ width: `${progress}%` }} />
          </div>
          {isPreview && !isPaid && (
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onUnlock}
                className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white text-xs rounded-full shadow-lg whitespace-nowrap"
              >
                Unlock Full Song ₹{unlockPrice}
              </button>
            </div>
          )}
        </div>
        
        <span className="text-xs text-gray-500 dark:text-gray-400 w-10">{formatTime(duration)}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        <button onClick={toggleMute} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
        </button>
        
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={handleVolumeChange}
          className="w-16 h-1 accent-purple-600 hidden sm:block"
        />

        {isPaid && (
          <a
            href={src}
            download
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <Download className="w-4 h-4" />
          </a>
        )}
      </div>
    </div>
  )
}
