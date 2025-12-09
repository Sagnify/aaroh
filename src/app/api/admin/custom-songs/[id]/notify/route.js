import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'
import * as nodemailer from 'nodemailer'

const prisma = new PrismaClient()

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
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  })

  const isCompleted = order.status === 'completed'

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: order.userEmail,
    subject: isCompleted ? '🎵 Your Custom Song is Ready' : '🎵 Your Song Preview is Ready',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333; margin-bottom: 20px;">${isCompleted ? 'Your Custom Song is Ready!' : 'Your Song Preview is Ready!'} 🎵</h2>
        
        <p style="color: #555; line-height: 1.6;">Your custom song for <strong>${order.recipientName}</strong> (${order.occasion}) is ${isCompleted ? 'ready to download' : 'ready for preview'}.</p>
        
        <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 0; color: #333;"><strong>Order:</strong> #${order.id.slice(0, 8)}</p>
          <p style="margin: 5px 0 0 0; color: #333;"><strong>Style:</strong> ${order.style} • ${order.mood}</p>
        </div>
        
        ${!isCompleted ? `<p style="color: #555; line-height: 1.6;">Listen to the preview and pay ₹${order.amount} to unlock the full version.</p>` : ''}
        
        <a href="${process.env.NEXTAUTH_URL}/shop/music-library" 
           style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
          ${isCompleted ? 'Download Song' : 'Listen to Preview'}
        </a>
        
        <p style="color: #888; font-size: 14px; margin-top: 30px;">Thank you,<br>Aaroh Music Team</p>
      </div>
    `
  })
}
