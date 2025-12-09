'use client'

import { useState, useEffect } from 'react'
import { Search, Music, Check } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import Image from 'next/image'

export default function SpotifySearch({ onSelect }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState(null)

  useEffect(() => {
    if (!query.trim()) {
      setResults([])
      return
    }

    const timer = setTimeout(() => {
      searchSpotify()
    }, 500)

    return () => clearTimeout(timer)
  }, [query])

  const searchSpotify = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/shop/spotify/search?q=${encodeURIComponent(query)}`)
      const data = await response.json()
      setResults(data.tracks || [])
    } catch (error) {
      console.error('Spotify search error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (track) => {
    setSelected(track)
    onSelect(track)
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Search for a song..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 bg-white"
        />
      </div>

      {loading && (
        <div className="text-center py-4">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto" />
        </div>
      )}

      {results.length > 0 && (
        <div className="max-h-64 overflow-y-auto space-y-2 bg-white rounded-lg border p-2">
          {results.map((track) => (
            <button
              key={track.id}
              onClick={() => handleSelect(track)}
              className={`w-full p-3 rounded-lg hover:bg-gray-50 transition-all flex items-center gap-3 text-left ${
                selected?.id === track.id ? 'bg-blue-50 border-2 border-blue-500' : 'border-2 border-transparent'
              }`}
            >
              {track.albumArt ? (
                <Image
                  src={track.albumArt}
                  alt={track.name}
                  width={48}
                  height={48}
                  className="rounded"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                  <Music className="w-6 h-6 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{track.name}</div>
                <div className="text-sm text-gray-600 truncate">{track.artist}</div>
              </div>
              {selected?.id === track.id && (
                <Check className="w-5 h-5 text-blue-500 flex-shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {selected && (
        <Card className="bg-green-50 border-2 border-green-200">
          <CardContent className="p-4 flex items-center gap-3">
            <Check className="w-5 h-5 text-green-600" />
            <div className="flex-1">
              <div className="font-medium text-gray-900">{selected.name}</div>
              <div className="text-sm text-gray-600">{selected.artist}</div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
