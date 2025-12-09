import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

// Admin API to update custom song with preview/full links
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user.role !== 'ADMIN' && session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params

    await prisma.customSongOrder.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting custom song:', error)
    return NextResponse.json({ error: 'Failed to delete custom song' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = params
    const { previewUrl, fullAudioUrl, posterUrl, status } = await request.json()

    const updateData = {}
    if (previewUrl !== undefined) updateData.previewUrl = previewUrl
    if (fullAudioUrl !== undefined) updateData.fullAudioUrl = fullAudioUrl
    if (posterUrl !== undefined) updateData.posterUrl = posterUrl
    if (status) updateData.status = status

    const updatedOrder = await prisma.customSongOrder.update({
      where: { id },
      data: updateData
    })

    // Send email notification when song is ready
    if (status === 'ready' && previewUrl) {
      await sendSongReadyEmail(updatedOrder)
    }

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder 
    })

  } catch (error) {
    console.error('Update custom song error:', error)
    return NextResponse.json({ 
      error: 'Failed to update custom song' 
    }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  return PUT(request, { params })
}

async function sendSongReadyEmail(order) {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: order.userEmail,
      subject: '🎵 Your Custom Song is Ready for Preview!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎵 Your Song is Ready!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We're excited to share your custom creation</p>
          </div>
          
          <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Song Details</h2>
            <p><strong>Occasion:</strong> ${order.occasion}</p>
            <p><strong>For:</strong> ${order.recipientName}</p>
            <p><strong>Style:</strong> ${order.style} - ${order.mood}</p>
            <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">🎧 Preview Your Song</h3>
              <p>Your custom song is ready! Listen to the preview and if you love it, complete the payment to get the full version.</p>
              <a href="${process.env.NEXTAUTH_URL}/shop/music-library" 
                 style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">
                Listen to Preview
              </a>
            </div>
            
            <div style="background: #fff3cd; padding: 15px; border-radius: 8px; border-left: 4px solid #ffc107;">
              <p style="margin: 0; color: #856404;"><strong>Next Steps:</strong></p>
              <p style="margin: 5px 0 0 0; color: #856404;">1. Listen to your preview<br>2. Pay ₹${order.amount} to unlock full song<br>3. Download and enjoy!</p>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 14px; opacity: 0.8;">
            <p>Thank you for choosing Aaroh Music!</p>
            <p>Questions? Reply to this email or contact us.</p>
          </div>
        </div>
      `
    }

    await transporter.sendMail(mailOptions)
  } catch (error) {
    console.error('Email sending error:', error)
  }
}