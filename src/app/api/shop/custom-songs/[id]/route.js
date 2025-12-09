import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    const order = await prisma.customSongOrder.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      order 
    })
  } catch (error) {
    console.error('Fetch song order error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch order' 
    }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
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