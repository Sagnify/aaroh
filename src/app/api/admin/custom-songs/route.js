import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') // 'active' or 'completed'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 10
    const skip = (page - 1) * limit
    
    let whereClause = {}
    
    if (status === 'active') {
      whereClause = {
        status: {
          in: ['pending', 'in_progress', 'ready']
        }
      }
    } else if (status === 'completed') {
      whereClause = {
        status: 'completed'
      }
    }
    
    const [songs, totalCount] = await Promise.all([
      prisma.customSongOrder.findMany({
        where: whereClause,
        orderBy: [
          { deliveryType: 'desc' }, // Express first
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.customSongOrder.count({ where: whereClause })
    ])

    // Fetch user details for each song
    const songsWithUserDetails = await Promise.all(
      songs.map(async (song) => {
        try {
          const user = await prisma.user.findUnique({
            where: { email: song.userEmail },
            select: { name: true, phone: true, email: true }
          })
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

    const totalPages = Math.ceil(totalCount / limit)
    const pagination = {
      currentPage: page,
      totalPages,
      totalCount,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }

    return NextResponse.json({ 
      success: true, 
      songs: songsWithUserDetails,
      pagination
    })
  } catch (error) {
    console.error('Error fetching custom songs:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch songs' }, { status: 500 })
  }
}