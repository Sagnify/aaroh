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

    const songs = await prisma.customSongOrder.findMany({
      where: {
        userEmail: session.user.email,
        status: 'completed'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true, 
      songs 
    })

  } catch (error) {
    console.error('Fetch completed songs error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch completed songs' 
    }, { status: 500 })
  }
}