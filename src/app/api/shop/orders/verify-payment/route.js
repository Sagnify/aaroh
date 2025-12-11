import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, getAdminEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      // Mark order as failed
      await prisma.shopOrder.update({
        where: { id: orderId },
        data: {
          status: 'failed',
          paymentStatus: 'failed',
          updatedAt: new Date()
        }
      })
      
      console.error(`Invalid signature for shop order ${orderId} - marking as failed`)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    // Check if already paid (idempotency)
    const existingOrder = await prisma.shopOrder.findUnique({
      where: { id: orderId }
    })

    if (existingOrder?.paymentStatus === 'paid') {
      return NextResponse.json({ 
        success: true, 
        message: 'Payment already verified' 
      })
    }

    // Update order status
    const order = await prisma.shopOrder.update({
      where: { id: orderId },
      data: {
        status: 'confirmed',
        paymentStatus: 'paid',
        razorpayPaymentId: razorpay_payment_id
      }
    })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Send confirmation emails with error handling
    try {
      console.log('📧 Sending shop order emails...')
      await sendOrderEmails(order, user, order.items, request)
      console.log('✅ Shop order emails sent successfully')
    } catch (emailError) {
      console.error('❌ Shop order email failed:', emailError)
    }

    // Clear cart after successful payment
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: user.id
        }
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying payment:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}

async function sendOrderEmails(order, user, items, request) {
  const baseUrl = process.env.NEXTAUTH_URL
  
  try {
    const userEmailResult = await sendEmail({
      to: user.email,
      template: 'shopOrderConfirmation',
      variables: {
        userName: order.customerName,
        orderId: order.id,
        paymentId: order.razorpayPaymentId,
        amount: order.amount,
        orderUrl: `${baseUrl}/shop/orders/${order.id}`
      }
    })
    console.log('✅ Shop order user email result:', userEmailResult)
    
    const adminEmailResult = await sendEmail({
      to: getAdminEmail(),
      template: 'adminShopOrderNotification',
      variables: {
        customerName: order.customerName,
        orderId: order.id,
        paymentId: order.razorpayPaymentId,
        amount: order.amount,
        adminUrl: `${baseUrl}/admin/shop`
      }
    })
    console.log('✅ Shop order admin email result:', adminEmailResult)
  } catch (emailError) {
    console.error('❌ Shop order email error:', emailError)
  }
}