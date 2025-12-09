import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const body = await request.json()
    const { type, fileUrl, externalUrl, metadata, customSongOrderId } = body

    const songSource = await prisma.songSource.create({
      data: {
        type,
        fileUrl,
        externalUrl,
        metadata: metadata || {},
        customSongOrderId
      }
    })

    return NextResponse.json({ success: true, songSource })
  } catch (error) {
    console.error('Error creating song source:', error)
    return NextResponse.json({ success: false, error: 'Failed to create song source' }, { status: 500 })
  }
}
