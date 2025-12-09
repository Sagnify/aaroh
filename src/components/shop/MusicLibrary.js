import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Music, Play, Check } from 'lucide-react'

export default function MusicLibrary({ onSelect, selectedSong }) {
  const { data: session } = useSession()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session) {
      fetchCompletedSongs()
    }
  }, [session])

  const fetchCompletedSongs = async () => {
    try {
      const response = await fetch('/api/shop/custom-songs/completed')
      const data = await response.json()
      setSongs(data.songs || [])
    } catch (error) {
      console.error('Error fetching completed songs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2" />
        <p className="text-sm text-gray-600">Loading your songs...</p>
      </div>
    )
  }

  if (songs.length === 0) {
    return (
      <Card className="bg-purple-50 border-purple-200">
        <CardContent className="p-4 text-center">
          <Music className="w-8 h-8 text-purple-300 mx-auto mb-2" />
          <p className="text-sm text-purple-600 mb-2">No completed custom songs yet</p>
          <p className="text-xs text-purple-500">Order a custom song first to see it here</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3 max-h-60 overflow-y-auto">
      {songs.map((song) => (
        <Card 
          key={song.id} 
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedSong?.id === song.id 
              ? 'border-purple-500 bg-purple-50' 
              : 'border-gray-200 hover:border-purple-300'
          }`}
          onClick={() => onSelect(song)}
        >
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h4 className="font-medium text-sm text-gray-900">{song.occasion} Song</h4>
                <p className="text-xs text-gray-600">For: {song.recipientName}</p>
                <p className="text-xs text-purple-600">{song.style} • {song.mood}</p>
              </div>
              <div className="flex items-center gap-2">
                {song.fullAudioUrl && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      window.open(song.fullAudioUrl, '_blank')
                    }}
                    className="h-8 w-8 p-0"
                  >
                    <Play className="w-3 h-3" />
                  </Button>
                )}
                {selectedSong?.id === song.id && (
                  <div className="w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}