import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Validate URL is from YouTube to prevent SSRF
    if (!isValidYouTubeUrl(url)) {
      return NextResponse.json({ error: 'Only YouTube URLs are allowed' }, { status: 400 })
    }

    // Extract video ID from YouTube URL
    const videoId = extractVideoId(url)
    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json({ error: 'Invalid YouTube video ID' }, { status: 400 })
    }

    // Use YouTube oEmbed API to get video info (no API key required)
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}&format=json`
    
    try {
      const response = await fetch(oembedUrl)
      if (!response.ok) {
        throw new Error('Video not found')
      }
      
      // For duration, we'll use a different approach since oEmbed doesn't provide duration
      // We'll extract it from the YouTube page HTML
      const pageResponse = await fetch(`https://www.youtube.com/watch?v=${encodeURIComponent(videoId)}`)
      const html = await pageResponse.text()
      
      // Look for duration in the page HTML
      const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
      
      if (durationMatch) {
        const seconds = parseInt(durationMatch[1])
        const duration = formatDuration(seconds)
        return NextResponse.json({ duration, seconds })
      }
      
      // Fallback: return a default duration format
      return NextResponse.json({ duration: '0:00', seconds: 0 })
      
    } catch (error) {
      console.error('Error fetching video info:', error)
      return NextResponse.json({ error: 'Failed to fetch video duration' }, { status: 500 })
    }
    
  } catch (error) {
    console.error('YouTube duration API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

function isValidYouTubeUrl(url) {
  const youtubeRegex = /^https?:\/\/(www\.)?(youtube\.com|youtu\.be)\/.+/
  return youtubeRegex.test(url)
}

function extractVideoId(url) {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

function formatDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}