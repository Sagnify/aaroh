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
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
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

    // Send confirmation emails
    await sendOrderEmails(order, user, order.items)

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

async function sendOrderEmails(order, user, items) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; margin-bottom: 10px;">✅ Payment Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Your order is now being processed</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10b981;">
          <h2 style="color: #065f46; margin-top: 0; font-size: 18px; margin-bottom: 12px;">Payment Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Order Number:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold;">#${order.id.slice(0, 8)}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Payment ID:</td>
              <td style="padding: 6px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${order.razorpayPaymentId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Amount Paid:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold; font-size: 18px;">₹${order.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Payment Date:</td>
              <td style="padding: 6px 0; color: #1f2937;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop/orders/${order.id}" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(16, 185, 129, 0.3);">
            📦 Track Your Order
          </a>
        </div>

        <div style="background-color: #f0f9ff; border-left: 4px solid #3B82F6; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #1e40af; font-size: 14px;">
            <strong>🎉 What's Next?</strong><br>
            • Your order is now confirmed and being processed<br>
            • You'll receive shipping updates via email<br>
            • Estimated delivery: 3-5 business days
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;">Thank you for your payment! 🎵</p>
          <p style="margin: 0; font-size: 14px;">Best regards,<br><strong>Aaroh Story Shop Team</strong></p>
        </div>
      </div>
    </div>
  `
  
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">💰 Payment Received!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order #${order.id.slice(0, 8)} - Process Immediately</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10b981;">
          <h2 style="color: #065f46; margin-top: 0; font-size: 18px;">Payment Confirmed</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Customer:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Payment ID:</td>
              <td style="padding: 6px 0; color: #1f2937; font-family: monospace; font-size: 12px;">${order.razorpayPaymentId}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Amount:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold; font-size: 18px;">₹${order.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/admin/shop" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
            🏪 Process in Admin Panel
          </a>
        </div>

        <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px; margin: 20px 0; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; color: #92400e; font-size: 12px;">
            <strong>⚡ Priority:</strong> Payment confirmed - process this order immediately for best customer experience
          </p>
        </div>
      </div>
    </div>
  `
  
  try {
    await sendEmail({
      to: user.email,
      subject: `Payment Confirmed #${order.id.slice(0, 8)}`,
      html: customerEmailHtml
    })
    
    await sendEmail({
      to: getAdminEmail(),
      subject: `Payment Received #${order.id.slice(0, 8)}`,
      html: adminEmailHtml
    })
  } catch (emailError) {
    console.error('Error sending emails:', emailError)
  }
}