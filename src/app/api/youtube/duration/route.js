import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { url } = await request.json()
    
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 })
    }

    // Extract video ID from YouTube URL
    const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1]
    
    if (!videoId) {
      return NextResponse.json({ error: 'Invalid YouTube URL' }, { status: 400 })
    }

    // Generate a random duration between 2-15 minutes for demo purposes
    const minutes = Math.floor(Math.random() * 13) + 2
    const seconds = Math.floor(Math.random() * 60)
    const duration = `${minutes}:${seconds.toString().padStart(2, '0')}`
    
    return NextResponse.json({ duration })
  } catch (error) {
    console.error('Error fetching YouTube duration:', error)
    return NextResponse.json({ error: 'Failed to fetch duration' }, { status: 500 })
  }
}