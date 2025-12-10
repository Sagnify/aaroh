import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch ALL songs for the user - no filtering needed
    const songs = await prisma.customSongOrder.findMany({
      where: {
        userEmail: session.user.email
      },
      orderBy: { updatedAt: 'desc' }
    })

    return NextResponse.json({ success: true, songs })
  } catch (error) {
    console.error('Error fetching completed songs:', error)
    return NextResponse.json({ error: 'Failed to fetch songs' }, { status: 500 })
  }
}