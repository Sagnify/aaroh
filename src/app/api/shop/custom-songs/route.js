import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const songs = await prisma.customSongOrder.findMany({
      orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json({ success: true, songs })
  } catch (error) {
    console.error('Error fetching custom songs:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch songs' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const body = await request.json()
    const { occasion, recipientName, story, mood, style, language, length, deadline } = body

    const price = deadline === 'express' ? 4499 : 2999

    const customSong = await prisma.customSongOrder.create({
      data: {
        userId: user.id,
        occasion,
        recipientName,
        story,
        mood,
        style,
        language,
        length,
        deadline,
        price,
        status: 'pending',
        paymentStatus: 'pending'
      }
    })

    await prisma.songSource.create({
      data: {
        type: 'custom',
        customSongOrderId: customSong.id,
        metadata: { occasion, mood, style }
      }
    })

    return NextResponse.json({ success: true, orderId: customSong.id })
  } catch (error) {
    console.error('Error creating custom song:', error)
    return NextResponse.json({ success: false, error: 'Failed to create order' }, { status: 500 })
  }
}
