import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, emailTemplates, getContactEmail } from '@/lib/email'

export const runtime = 'edge'
export const maxDuration = 30

export async function POST(request) {
  const startTime = Date.now()
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      console.error('Missing webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    console.log(`Webhook received: ${event.event}`)
    
    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      
      if (!payment.order_id) {
        console.error('Missing order_id in payment.captured event')
        return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
      }
      
      // Find purchase by razorpay_order_id
      const purchase = await prisma.purchase.findFirst({
        where: { razorpayOrderId: payment.order_id }
      })
      
      if (!purchase) {
        console.error(`Purchase not found for order_id: ${payment.order_id}`)
        return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
      }

      // Idempotency check - don't update if already completed
      if (purchase.status === 'completed' && purchase.razorpayPaymentId === payment.id) {
        console.log(`Payment already processed for purchase ${purchase.id}`)
        return NextResponse.json({ status: 'ok', message: 'Already processed' })
      }
      
      const updatedPurchase = await prisma.purchase.update({
        where: { id: purchase.id },
        data: {
          status: 'completed',
          razorpayPaymentId: payment.id,
          updatedAt: new Date()
        },
        include: {
          user: true,
          course: true
        }
      })
      console.log(`Payment captured for purchase ${purchase.id}, payment_id: ${payment.id}`)

      // Send emails asynchronously (non-blocking)
      const contactEmail = await getContactEmail()
      
      const emailPromises = Promise.all([
        // User confirmation
        sendEmail({
          to: updatedPurchase.user.email,
          ...emailTemplates.purchaseConfirmation(
            updatedPurchase.user.name || 'Student',
            updatedPurchase.course.title,
            updatedPurchase.amount
          )
        }).catch(err => console.error('User purchase email failed:', err)),
        
        // Admin notification
        contactEmail ? sendEmail({
          to: contactEmail,
          ...emailTemplates.adminPurchaseNotification(
            updatedPurchase.user.name || 'Student',
            updatedPurchase.user.email,
            updatedPurchase.course.title,
            updatedPurchase.amount
          )
        }).catch(err => console.error('Admin purchase email failed:', err)) : Promise.resolve()
      ])

      // For Vercel serverless - ensure emails complete
      if (request.waitUntil) {
        request.waitUntil(emailPromises)
      }
    }
    
    // Handle payment.failed event
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity
      
      if (!payment.order_id) {
        console.error('Missing order_id in payment.failed event')
        return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
      }
      
      const purchase = await prisma.purchase.findFirst({
        where: { razorpayOrderId: payment.order_id },
        include: {
          user: true,
          course: true
        }
      })
      
      if (!purchase) {
        console.error(`Purchase not found for order_id: ${payment.order_id}`)
        return NextResponse.json({ error: 'Purchase not found' }, { status: 404 })
      }

      // Only update if not already completed
      if (purchase.status !== 'completed') {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'failed',
            updatedAt: new Date()
          }
        })
        console.log(`Payment failed for purchase ${purchase.id}, reason: ${payment.error_description || 'Unknown'}`)

        // Send payment failed email asynchronously
        const emailPromise = sendEmail({
          to: purchase.user.email,
          ...emailTemplates.paymentFailed(
            purchase.user.name || 'Student',
            purchase.course.title,
            purchase.amount
          )
        }).catch(err => console.error('Payment failed email error:', err))

        if (request.waitUntil) {
          request.waitUntil(emailPromise)
        }
      } else {
        console.log(`Ignoring failed event for completed purchase ${purchase.id}`)
      }
    }

    const duration = Date.now() - startTime
    console.log(`Webhook processed successfully in ${duration}ms`)
    return NextResponse.json({ status: 'ok', processed_in_ms: duration })
  } catch (error) {
    const duration = Date.now() - startTime
    console.error('Webhook error:', error, `(failed after ${duration}ms)`)
    return NextResponse.json({ 
      error: 'Webhook processing failed', 
      message: error.message 
    }, { status: 500 })
  }
}