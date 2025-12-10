import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { razorpay } from '@/lib/razorpay'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      console.error('❌ Payment creation: Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { customSongId } = await request.json()

    if (!customSongId) {
      console.error('❌ Payment creation: Missing customSongId')
      return NextResponse.json({ error: 'Custom song ID is required' }, { status: 400 })
    }
    
    console.log(`💳 Creating payment for custom song: ${customSongId} | User: ${session.user.email}`)

    // Get the custom song order with enhanced validation - allow both 'ready' and 'awaiting_payment' status for repayments
    const customSong = await prisma.customSongOrder.findFirst({
      where: {
        id: customSongId,
        userEmail: session.user.email,
        status: { in: ['ready', 'awaiting_payment'] }
      }
    })

    if (!customSong) {
      console.error(`❌ Payment creation: Song not found or not ready | ID: ${customSongId} | User: ${session.user.email}`)
      return NextResponse.json({ error: 'Song not found or not ready for payment' }, { status: 404 })
    }

    // Update status to awaiting_payment when payment process starts
    await prisma.customSongOrder.update({
      where: { id: customSong.id },
      data: { 
        status: 'awaiting_payment',
        updatedAt: new Date()
      }
    })

    // Enhanced amount validation
    if (!customSong.amount || customSong.amount < 100 || customSong.amount > 100000) {
      console.error(`❌ Payment creation: Invalid amount | Amount: ${customSong.amount} | Song: ${customSongId}`)
      return NextResponse.json({ error: 'Invalid order amount. Please contact support.' }, { status: 400 })
    }

    // Check if this is a repayment scenario
    const orderHistory = Array.isArray(customSong.orderIdHistory) ? customSong.orderIdHistory : []
    const hasExistingOrder = !!customSong.razorpayOrderId
    const isRepayment = hasExistingOrder && (orderHistory.length > 0 || customSong.status === 'completed')
    
    if (isRepayment) {
      console.log(`🔄 Payment creation: Repayment detected, storing old order ID in history | Song: ${customSongId}`)
      // For repayments, add current order ID to history
      const updatedHistory = [...orderHistory, customSong.razorpayOrderId]
      await prisma.customSongOrder.update({
        where: { id: customSong.id },
        data: {
          orderIdHistory: updatedHistory,
          razorpayOrderId: null,
          razorpayPaymentId: null,
          updatedAt: new Date()
        }
      })
    } else if (customSong.razorpayOrderId && customSong.status === 'awaiting_payment') {
      // Return existing order if it's still valid and awaiting payment
      console.log(`♾️ Payment creation: Returning existing order | Order: ${customSong.razorpayOrderId} | Song: ${customSongId}`)
      return NextResponse.json({ 
        success: true,
        orderId: customSong.razorpayOrderId,
        amount: customSong.amount * 100,
        currency: 'INR',
        customSongId: customSong.id
      })
    }

    // Create Razorpay order with enhanced error handling
    let razorpayOrder
    try {
      razorpayOrder = await razorpay.orders.create({
        amount: customSong.amount * 100, // Convert to paise
        currency: 'INR',
        receipt: `song_${customSong.id.slice(-8)}_${Date.now().toString().slice(-6)}${isRepayment ? '_r' : ''}`,
        notes: {
          customSongId: customSong.id,
          userEmail: session.user.email,
          occasion: customSong.occasion,
          recipientName: customSong.recipientName
        }
      })
      
      console.log(`✅ Razorpay order created: ${razorpayOrder.id} | Amount: ₹${customSong.amount}`)
    } catch (razorpayError) {
      console.error('❌ Razorpay order creation failed:', razorpayError)
      return NextResponse.json({ 
        error: 'Payment gateway error. Please try again.' 
      }, { status: 500 })
    }

    // Update custom song with razorpay order ID using transaction
    try {
      await prisma.customSongOrder.update({
        where: { id: customSong.id },
        data: { 
          razorpayOrderId: razorpayOrder.id,
          updatedAt: new Date()
        }
      })
      
      console.log(`✅ Custom song updated with Razorpay order ID: ${razorpayOrder.id}`)
    } catch (dbError) {
      console.error('❌ Database update failed after Razorpay order creation:', dbError)
      // Note: Razorpay order is created but not linked - this needs manual intervention
      return NextResponse.json({ 
        error: 'Database error. Please contact support with order ID: ' + razorpayOrder.id 
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      customSongId: customSong.id
    })

  } catch (error) {
    console.error('❌ CRITICAL: Payment creation failed:', error)
    
    // Send alert to admin for payment creation failures
    try {
      const session = await getServerSession(authOptions)
      const { sendEmail } = await import('@/lib/email')
      await sendEmail({
        to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
        subject: '🚨 Payment Creation Failed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #DC2626;">
            <h1 style="color: #DC2626;">🚨 Payment Creation Failed</h1>
            <p><strong>User:</strong> ${session?.user?.email || 'Unknown'}</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Stack:</strong> <pre>${error.stack}</pre></p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send payment creation failure alert:', emailError)
    }
    
    return NextResponse.json({ 
      error: 'Payment system temporarily unavailable. Please try again.' 
    }, { status: 500 })
  }
}