import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { razorpay } from '@/lib/razorpay'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customSongId } = await request.json()

    if (!customSongId) {
      return NextResponse.json({ error: 'Custom song ID is required' }, { status: 400 })
    }

    // Get the custom song order
    const customSong = await prisma.customSongOrder.findFirst({
      where: {
        id: customSongId,
        userEmail: session.user.email,
        status: 'ready'
      }
    })

    if (!customSong) {
      return NextResponse.json({ error: 'Song not found or not ready for payment' }, { status: 404 })
    }

    // Validate amount (minimum ₹100)
    if (!customSong.amount || customSong.amount < 100) {
      return NextResponse.json({ error: 'Invalid order amount. Please contact support.' }, { status: 400 })
    }

    if (customSong.razorpayOrderId) {
      return NextResponse.json({ 
        success: true,
        orderId: customSong.razorpayOrderId,
        amount: customSong.amount * 100,
        currency: 'INR',
        customSongId: customSong.id
      })
    }

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: customSong.amount * 100,
      currency: 'INR',
      receipt: `custom_song_${customSong.id}`,
      notes: {
        customSongId: customSong.id,
        userEmail: session.user.email
      }
    })

    // Update custom song with razorpay order ID
    await prisma.customSongOrder.update({
      where: { id: customSong.id },
      data: { razorpayOrderId: razorpayOrder.id }
    })

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      customSongId: customSong.id
    })

  } catch (error) {
    console.error('Create payment order error:', error)
    return NextResponse.json({ 
      error: error.message || 'Failed to create payment order' 
    }, { status: 500 })
  }
}