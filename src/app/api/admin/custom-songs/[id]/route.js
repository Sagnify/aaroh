import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

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

    // Get current order to check previous state
    const currentOrder = await prisma.customSongOrder.findUnique({ where: { id } })
    
    const updateData = {}
    if (previewUrl !== undefined) updateData.previewUrl = previewUrl
    if (fullAudioUrl !== undefined) updateData.fullAudioUrl = fullAudioUrl
    if (posterUrl !== undefined) updateData.posterUrl = posterUrl
    if (status) updateData.status = status

    // Auto-set status to ready when preview URL is added
    if (previewUrl && !currentOrder.previewUrl) {
      updateData.status = 'ready'
    }

    const updatedOrder = await prisma.customSongOrder.update({
      where: { id },
      data: updateData
    })

    // Send email when preview URL is newly added
    if (previewUrl && !currentOrder.previewUrl) {
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
    await sendEmail({
      to: order.userEmail,
      subject: '🎵 Your Custom Song is Ready',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; margin-bottom: 20px;">Your Custom Song is Ready! 🎵</h2>
          
          <p style="color: #555; line-height: 1.6;">Your custom song for <strong>${order.recipientName}</strong> (${order.occasion}) is ready for preview.</p>
          
          <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #333;"><strong>Order:</strong> #${order.id.slice(0, 8)}</p>
            <p style="margin: 5px 0 0 0; color: #333;"><strong>Style:</strong> ${order.style} • ${order.mood}</p>
          </div>
          
          <p style="color: #555; line-height: 1.6;">Listen to the preview and pay ₹${order.amount} to unlock the full version.</p>
          
          <a href="${process.env.NEXTAUTH_URL}/shop/music-library" 
             style="display: inline-block; background: #8B5CF6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
            Listen to Preview
          </a>
          
          <p style="color: #888; font-size: 14px; margin-top: 30px;">Thank you,<br>Aaroh Music Team</p>
        </div>
      `
    })
  } catch (error) {
    console.error('Email sending error:', error)
  }
}