import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params

    const order = await prisma.customSongOrder.findUnique({
      where: { id }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (!order.previewUrl && !order.fullAudioUrl) {
      return NextResponse.json({ error: 'No audio links available' }, { status: 400 })
    }

    await sendNotificationEmail(order)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Notify user error:', error)
    return NextResponse.json({ error: 'Failed to notify user' }, { status: 500 })
  }
}

async function sendNotificationEmail(order) {
  const isCompleted = order.status === 'completed'
  const templateName = isCompleted ? 'customSongReady' : 'customSongOrderUpdate'

  await sendEmail({
    to: order.userEmail,
    template: templateName,
    variables: {
      recipientName: order.recipientName,
      occasion: order.occasion,
      status: isCompleted ? 'Ready' : 'Preview Ready',
      downloadUrl: `${process.env.NEXTAUTH_URL}/shop/music-library`
    }
  })
}
