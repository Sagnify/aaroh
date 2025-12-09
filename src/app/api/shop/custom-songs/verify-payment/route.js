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

    // Check if already completed (idempotency)
    const existingOrder = await prisma.customSongOrder.findUnique({
      where: { id: orderId }
    })

    if (existingOrder?.status === 'completed') {
      return NextResponse.json({ 
        success: true, 
        message: 'Payment already verified' 
      })
    }

    // Update custom song order
    const updatedOrder = await prisma.customSongOrder.update({
      where: { id: orderId },
      data: {
        status: 'completed'
      }
    })

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    // Send confirmation emails
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
    const emailPromises = Promise.all([
      sendEmail({
        to: user.email,
        subject: `🎵 Payment Confirmed - Custom Song Order #${updatedOrder.id.slice(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Confirmed!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your custom song order is confirmed</p>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h2 style="color: #065f46; margin-top: 0;">Order #${updatedOrder.id.slice(0, 8)}</h2>
                <p><strong>Occasion:</strong> ${updatedOrder.occasion}</p>
                <p><strong>For:</strong> ${updatedOrder.recipientName}</p>
                <p><strong>Style:</strong> ${updatedOrder.style} - ${updatedOrder.mood}</p>
                <p><strong>Delivery:</strong> ${updatedOrder.deliveryType === 'express' ? '3 days' : '7 days'}</p>
                <p><strong>Amount Paid:</strong> ₹${updatedOrder.amount.toLocaleString()}</p>
              </div>
              <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #1e40af; margin-top: 0;">🎶 What's Next?</h3>
                <ul style="color: #1e40af; margin: 0;">
                  <li>Our music team will start crafting your song</li>
                  <li>You'll receive preview for approval via email</li>
                  <li>Final song delivered within ${updatedOrder.deliveryType === 'express' ? '3 days' : '7 days'}</li>
                </ul>
              </div>
              <div style="text-align: center; margin: 30px 0;">
                <a href="${baseUrl}/shop/music-library" style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  🎵 View Music Library
                </a>
              </div>
            </div>
          </div>
        `
      }).catch(err => console.error('User email failed:', err)),
      
      sendEmail({
        to: getAdminEmail(),
        subject: `💰 Payment Received - Custom Song #${updatedOrder.id.slice(0, 8)}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
              <h1 style="color: white; margin: 0;">💰 Payment Received!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Custom Song Order #${updatedOrder.id.slice(0, 8)}</p>
            </div>
            <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
              <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #10b981;">
                <h2 style="color: #065f46; margin-top: 0;">Paid Order Details</h2>
                <p><strong>Customer:</strong> ${user.name} (${user.email})</p>
                <p><strong>Occasion:</strong> ${updatedOrder.occasion}</p>
                <p><strong>Recipient:</strong> ${updatedOrder.recipientName}</p>
                <p><strong>Style:</strong> ${updatedOrder.style} - ${updatedOrder.mood}</p>
                <p><strong>Deadline:</strong> ${updatedOrder.deliveryType === 'express' ? '3 days (Express)' : '7 days (Standard)'}</p>
                <p><strong>Amount:</strong> ₹${updatedOrder.amount.toLocaleString()}</p>
              </div>
              <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="margin-top: 0; color: #92400e;">Story:</h3>
                <p style="font-style: italic; color: #92400e;">"${updatedOrder.story}"</p>
              </div>
              <div style="text-align: center; margin: 24px 0;">
                <a href="${baseUrl}/admin/shop" style="display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold;">
                  🏪 Process in Admin Panel
                </a>
              </div>
            </div>
          </div>
        `
      }).catch(err => console.error('Admin email failed:', err))
    ])

    if (request.waitUntil) {
      request.waitUntil(emailPromises)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error verifying custom song payment:', error)
    return NextResponse.json({ error: 'Payment verification failed' }, { status: 500 })
  }
}