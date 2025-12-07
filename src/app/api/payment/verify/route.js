import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { 
      razorpay_order_id, 
      razorpay_payment_id, 
      razorpay_signature,
      purchaseId 
    } = await request.json()

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !purchaseId) {
      return NextResponse.json({ error: 'Missing payment details' }, { status: 400 })
    }

    // Check if purchase exists and belongs to user
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        id: purchaseId,
        userId: user.id
      }
    })

    if (!existingPurchase) {
      return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
    }

    // Check if already completed (idempotency)
    if (existingPurchase.status === 'completed') {
      return NextResponse.json({
        success: true,
        message: 'Payment already verified',
        purchase: {
          id: existingPurchase.id,
          courseId: existingPurchase.courseId
        }
      })
    }

    // Verify signature
    const body = razorpay_order_id + "|" + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      // Mark as failed
      await prisma.purchase.update({
        where: { id: purchaseId },
        data: { status: 'failed' }
      })
      console.error(`Invalid signature for purchase ${purchaseId}`)
      return NextResponse.json({ error: 'Invalid payment signature' }, { status: 400 })
    }

    // Update purchase record
    const purchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: {
        status: 'completed',
        razorpayPaymentId: razorpay_payment_id,
        razorpaySignature: razorpay_signature,
        updatedAt: new Date()
      },
      include: {
        course: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Payment verified successfully',
      purchase: {
        id: purchase.id,
        courseId: purchase.courseId,
        courseName: purchase.course.title
      }
    })

  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}