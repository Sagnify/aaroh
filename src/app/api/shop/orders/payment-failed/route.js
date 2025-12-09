import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, error_description, error_code } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const order = await prisma.shopOrder.findFirst({
      where: {
        id: orderId,
        userId: user.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await prisma.shopOrder.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        paymentStatus: 'failed'
      }
    })

    await sendPaymentFailureEmails(order, user, error_description, error_code)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling payment failure:', error)
    return NextResponse.json({ error: 'Failed to process payment failure' }, { status: 500 })
  }
}

async function sendPaymentFailureEmails(order, user, errorDescription, errorCode) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; margin-bottom: 10px;">❌ Payment Failed</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">We couldn't process your payment</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #fef2f2; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; margin-bottom: 16px;">Payment Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Number:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${order.id.slice(0, 8)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Amount:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 18px;">₹${order.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Failure Time:</td>
              <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
            </tr>
          </table>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop/cart" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
            🔄 Try Again
          </a>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          <p style="margin: 0; font-size: 14px;">Best regards,<br><strong>Aaroh Story Shop Team</strong></p>
        </div>
      </div>
    </div>
  `
  
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Payment Failure Alert</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Customer payment failed</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 18px;">Failed Payment #${order.id.slice(0, 8)}</h2>
          <p style="margin: 0; color: #991b1b;">Customer: ${order.customerName} (${order.customerEmail})</p>
          <p style="margin: 0; color: #991b1b;">Amount: ₹${order.amount.toLocaleString()}</p>
        </div>
      </div>
    </div>
  `
  
  try {
    await sendEmail({
      to: user.email,
      subject: `Payment Failed #${order.id.slice(0, 8)} - Aaroh Story Shop`,
      html: customerEmailHtml
    })
    
    await sendEmail({
      to: process.env.CONTACT_EMAIL,
      subject: `Payment Failure Alert #${order.id.slice(0, 8)}`,
      html: adminEmailHtml
    })
  } catch (emailError) {
    console.error('Error sending payment failure emails:', emailError)
  }
}