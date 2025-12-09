import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    
    const whereClause = status ? { status } : {}
    
    const songs = await prisma.customSongOrder.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    })

    // Fetch user details for each song
    const songsWithUserDetails = await Promise.all(
      songs.map(async (song) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email: song.userEmail },
            select: { name: true, phone: true, email: true }
          })
          console.log('User lookup for', song.userEmail, ':', user)
          return {
            ...song,
            userName: user?.name || song.userEmail.split('@')[0],
            userPhone: user?.phone || 'Not provided'
          }
        } catch (err) {
          console.error('Error fetching user for', song.userEmail, err)
          return {
            ...song,
            userName: song.userEmail.split('@')[0],
            userPhone: 'Not provided'
          }
        }
      })
    )

    return NextResponse.json({ success: true, songs: songsWithUserDetails })
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
