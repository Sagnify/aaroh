import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customSongId } = await request.json()

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

    // Create Razorpay order
    const razorpayOrderResponse = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${Buffer.from(`${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`).toString('base64')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount: customSong.amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `custom_song_${customSong.id}`,
        notes: {
          customSongId: customSong.id,
          userEmail: session.user.email
        }
      })
    })

    const razorpayOrder = await razorpayOrderResponse.json()

    if (!razorpayOrderResponse.ok) {
      throw new Error(razorpayOrder.error?.description || 'Failed to create payment order')
    }

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
      error: 'Failed to create payment order' 
    }, { status: 500 })
  }
}