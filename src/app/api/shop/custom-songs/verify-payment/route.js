import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, getAdminEmail, emailTemplates } from '@/lib/email'

export async function POST(request) {
  console.log('🚀 PAYMENT VERIFICATION API CALLED')
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      console.error('❌ Payment verification: Unauthorized access attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, razorpay_payment_id, razorpay_order_id, razorpay_signature } = body

    if (!orderId || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
      console.error('❌ Payment verification: Missing required fields', { orderId, razorpay_payment_id, razorpay_order_id, hasSignature: !!razorpay_signature })
      return NextResponse.json({ error: 'Missing required payment fields' }, { status: 400 })
    }
    
    console.log(`🔒 Verifying payment: ${razorpay_payment_id} | Order: ${razorpay_order_id} | User: ${session.user.email}`)

    // Enhanced signature verification with timing-safe comparison
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(sign.toString())
      .digest('hex')

    if (!crypto.timingSafeEqual(Buffer.from(razorpay_signature), Buffer.from(expectedSign))) {
      console.error(`❌ SECURITY: Invalid payment signature | Payment: ${razorpay_payment_id} | User: ${session.user.email}`)
      
      // Mark custom song as failed
      await prisma.customSongOrder.update({
        where: { id: orderId },
        data: { 
          status: 'failed',
          updatedAt: new Date()
        }
      })
      
      // Send security alert
      try {
        await sendEmail({
          to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
          subject: '🚨 SECURITY ALERT: Invalid Payment Signature',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #DC2626;">
              <h1 style="color: #DC2626;">🚨 SECURITY ALERT: Invalid Payment Signature</h1>
              <p><strong>User:</strong> ${session.user.email}</p>
              <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
              <p><strong>Order ID:</strong> ${razorpay_order_id}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p style="color: #DC2626; font-weight: bold;">Possible payment tampering attempt!</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send security alert:', emailError)
      }
      
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 })
    }

    // Enhanced order validation with security checks
    const existingOrder = await prisma.customSongOrder.findUnique({
      where: { id: orderId }
    })

    if (!existingOrder) {
      console.error(`❌ Payment verification: Order not found | Order: ${orderId} | User: ${session.user.email}`)
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    if (existingOrder.userEmail !== session.user.email) {
      console.error(`❌ SECURITY: Unauthorized payment verification attempt | Order: ${orderId} | User: ${session.user.email} | Owner: ${existingOrder.userEmail}`)
      
      // Send security alert for unauthorized access
      try {
        await sendEmail({
          to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
          subject: '🚨 SECURITY: Unauthorized Payment Verification',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #DC2626;">
              <h1 style="color: #DC2626;">🚨 SECURITY: Unauthorized Payment Verification</h1>
              <p><strong>Attempting User:</strong> ${session.user.email}</p>
              <p><strong>Order Owner:</strong> ${existingOrder.userEmail}</p>
              <p><strong>Order ID:</strong> ${orderId}</p>
              <p><strong>Payment ID:</strong> ${razorpay_payment_id}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send security alert:', emailError)
      }
      
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    // Check for duplicate payment verification (idempotency) - only skip if same payment ID
    if (existingOrder.status === 'completed' && existingOrder.razorpayPaymentId === razorpay_payment_id) {
      console.log(`♾️ Payment verification: Already completed with same payment ID | Order: ${orderId}`)
      return NextResponse.json({ 
        success: true, 
        message: 'Payment already verified' 
      })
    }
    
    // Allow repayments even if status is completed but with different payment ID
    if (existingOrder.status === 'completed' && existingOrder.razorpayPaymentId !== razorpay_payment_id) {
      console.log(`🔄 Processing repayment for completed order | Order: ${orderId} | New Payment: ${razorpay_payment_id}`)
    }
    
    // Validate Razorpay order ID matches
    if (existingOrder.razorpayOrderId !== razorpay_order_id) {
      console.error(`❌ Payment verification: Razorpay order ID mismatch | Expected: ${existingOrder.razorpayOrderId} | Received: ${razorpay_order_id}`)
      return NextResponse.json({ error: 'Order ID mismatch' }, { status: 400 })
    }

    // Update custom song order with transaction safety
    const updatedOrder = await prisma.$transaction(async (tx) => {
      // Check if this is a repayment and add current order ID to history
      const orderHistory = Array.isArray(existingOrder.orderIdHistory) ? existingOrder.orderIdHistory : []
      const isRepayment = orderHistory.length > 0
      
      // Add current order ID to history if it's a repayment
      const updatedHistory = isRepayment ? [...orderHistory, existingOrder.razorpayOrderId] : orderHistory
      
      return await tx.customSongOrder.update({
        where: { id: orderId },
        data: {
          status: 'completed',
          razorpayPaymentId: razorpay_payment_id,
          orderIdHistory: updatedHistory,
          updatedAt: new Date()
        }
      })
    })
    
    console.log(`✅ Payment verified successfully | Order: ${orderId} | Payment: ${razorpay_payment_id}`)
    console.log('📧 About to send emails for order:', JSON.stringify(updatedOrder, null, 2))

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      console.error('❌ User not found for email:', session.user.email)
      return NextResponse.json({ success: true }) // Still return success for payment
    }

    // Detect if this is a repayment (has order history)
    const orderHistory = Array.isArray(updatedOrder.orderIdHistory) ? updatedOrder.orderIdHistory : []
    const isRepayment = orderHistory.length > 0
    console.log('🔄 Is repayment:', isRepayment, '| Order history length:', orderHistory.length)

    // Send confirmation emails
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const templates = emailTemplates(baseUrl)
    
    try {
      console.log('📧 Sending emails to:', user.email, 'and', getAdminEmail())
      
      await Promise.all([
        sendEmail({
          to: user.email,
          ...templates.customSongPaymentSuccess(user.name || 'Customer', updatedOrder, isRepayment)
        }),
        sendEmail({
          to: getAdminEmail(),
          ...templates.adminCustomSongPayment(user.name || 'Customer', user.email, updatedOrder, isRepayment)
        })
      ])
      
      console.log('✅ Emails sent successfully')
      
    } catch (emailError) {
      console.error('❌ Email failed:', emailError.message)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ CRITICAL: Payment verification failed:', error)
    
    // Send critical alert for payment verification failures
    try {
      await sendEmail({
        to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
        subject: '🚨 CRITICAL: Payment Verification Failed',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #DC2626;">
            <h1 style="color: #DC2626;">🚨 CRITICAL: Payment Verification Failed</h1>
            <p><strong>User:</strong> ${session?.user?.email || 'Unknown'}</p>
            <p><strong>Error:</strong> ${error.message}</p>
            <p><strong>Stack:</strong> <pre>${error.stack}</pre></p>
            <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            <p style="color: #DC2626; font-weight: bold;">IMMEDIATE INVESTIGATION REQUIRED!</p>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Failed to send payment verification failure alert:', emailError)
    }
    
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}