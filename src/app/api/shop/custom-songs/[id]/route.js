import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { status } = await request.json()

    const updatedSong = await prisma.customSongOrder.update({
      where: { id },
      data: { status }
    })

    return NextResponse.json({ 
      success: true, 
      song: updatedSong 
    })

  } catch (error) {
    console.error('Update song status error:', error)
    return NextResponse.json({ 
      error: 'Failed to update song status' 
    }, { status: 500 })
  }
}