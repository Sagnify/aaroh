import { NextResponse } from 'next/server'

let spotifyToken = null
let tokenExpiry = null

async function getSpotifyToken() {
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyToken
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured')
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64')
    },
    body: 'grant_type=client_credentials'
  })

  const data = await response.json()
  spotifyToken = data.access_token
  tokenExpiry = Date.now() + (data.expires_in * 1000) - 60000

  return spotifyToken
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    if (!query) {
      return NextResponse.json({ success: false, error: 'Query required' }, { status: 400 })
    }

    const token = await getSpotifyToken()

    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    )

    const data = await response.json()

    const tracks = data.tracks?.items?.map(track => ({
      id: track.id,
      name: track.name,
      artist: track.artists.map(a => a.name).join(', '),
      album: track.album.name,
      albumArt: track.album.images[0]?.url,
      externalUrl: track.external_urls.spotify,
      duration: track.duration_ms
    })) || []

    return NextResponse.json({ success: true, tracks })
  } catch (error) {
    console.error('Spotify search error:', error)
    return NextResponse.json({ success: false, error: 'Search failed' }, { status: 500 })
  }
}
