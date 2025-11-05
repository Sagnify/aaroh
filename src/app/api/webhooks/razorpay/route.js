import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    if (signature !== expectedSignature) {
      console.log('Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    
    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      
      // Find purchase by razorpay_order_id
      const purchase = await prisma.purchase.findFirst({
        where: { razorpayOrderId: payment.order_id }
      })
      
      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'completed',
            razorpayPaymentId: payment.id,
            updatedAt: new Date()
          }
        })
        console.log(`Payment captured for purchase ${purchase.id}`)
      }
    }
    
    // Handle payment.failed event
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity
      
      const purchase = await prisma.purchase.findFirst({
        where: { razorpayOrderId: payment.order_id }
      })
      
      if (purchase) {
        await prisma.purchase.update({
          where: { id: purchase.id },
          data: {
            status: 'failed',
            updatedAt: new Date()
          }
        })
        console.log(`Payment failed for purchase ${purchase.id}`)
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}