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
      // Mark as failed and get purchase details for email
      const failedPurchase = await prisma.purchase.update({
        where: { id: purchaseId },
        data: { 
          status: 'failed',
          updatedAt: new Date()
        },
        include: {
          user: true,
          course: true
        }
      })
      console.error(`Invalid signature for purchase ${purchaseId} - marking as failed`)

      // Send payment failed email with proper error handling
      try {
        console.log('📧 Sending payment failed email...')
        const { sendEmail } = await import('@/lib/email')
        const emailResult = await sendEmail({
          to: failedPurchase.user.email,
          template: 'paymentFailed',
          variables: {
            userName: failedPurchase.user.name || 'Student',
            courseName: failedPurchase.course.title,
            retryUrl: `${process.env.NEXTAUTH_URL}/courses`
          }
        })
        console.log('✅ Payment failed email result:', emailResult)
      } catch (emailError) {
        console.error('❌ Payment failed email error:', emailError)
      }

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
        course: true,
        user: true
      }
    })

    // Send confirmation emails with proper error handling
    try {
      console.log('📧 Sending course purchase emails...')
      const { sendEmail, getAdminEmail } = await import('@/lib/email')
      const userEmailResult = await sendEmail({
        to: purchase.user.email,
        template: 'purchaseConfirmation',
        variables: {
          userName: purchase.user.name || 'Student',
          courseName: purchase.course.title,
          amount: purchase.amount,
          baseUrl: process.env.NEXTAUTH_URL
        }
      })
      console.log('✅ User email result:', userEmailResult)
      
      const adminEmailResult = await sendEmail({
        to: getAdminEmail(),
        template: 'adminPurchaseNotification',
        variables: {
          userName: purchase.user.name || 'Student',
          userEmail: purchase.user.email,
          courseName: purchase.course.title,
          amount: purchase.amount,
          baseUrl: process.env.NEXTAUTH_URL
        }
      })
      console.log('✅ Admin email result:', adminEmailResult)
      
    } catch (emailError) {
      console.error('❌ Course purchase email failed:', emailError)
    }

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