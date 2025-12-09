import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getAdminEmail } from '@/lib/email'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
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

    return NextResponse.json({ success: true, order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const body = await request.json()
    const { action, trackingId, status } = body

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

    let updateData = {}

    if (action === 'cancel') {
      if (order.status !== 'confirmed') {
        return NextResponse.json({ error: 'Order cannot be cancelled' }, { status: 400 })
      }
      updateData.status = 'cancelled'
      
      // Send cancellation emails
      await sendCancellationEmails(order, user)
    }

    if (trackingId !== undefined) {
      updateData.trackingId = trackingId
    }

    if (status) {
      updateData.status = status
    }

    const updatedOrder = await prisma.shopOrder.update({
      where: { id: orderId },
      data: updateData
    })

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}

async function sendCancellationEmails(order, user) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  // Customer cancellation email
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; margin-bottom: 10px;">❌ Order Cancelled</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">We've processed your cancellation request</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #fef2f2; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 20px; margin-bottom: 16px;">Cancellation Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Number:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${order.id.slice(0, 8)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Cancelled On:</td>
              <td style="padding: 8px 0; color: #1f2937;">${new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Amount:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 18px;">₹${order.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #0c4a6e; margin-top: 0; font-size: 16px; margin-bottom: 12px;">💰 Refund Information</h3>
          <div style="color: #0c4a6e; line-height: 1.6;">
            ${order.paymentMethod === 'cod' ? 
              '• Since this was a Cash on Delivery order, no refund is required.<br>• You will not be charged anything.' :
              '• Your refund will be processed within 5-7 business days.<br>• The amount will be credited to your original payment method.<br>• You will receive a confirmation email once the refund is processed.'
            }
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
            🛍️ Continue Shopping
          </a>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">
            <strong>📞 Need Help?</strong><br>
            If you have any questions about this cancellation or need assistance with a new order, please contact our support team.
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;">We hope to serve you again soon! 🎵</p>
          <p style="margin: 0; font-size: 14px;">Best regards,<br><strong>Aaroh Story Shop Team</strong></p>
        </div>
      </div>
    </div>
  `
  
  // Admin notification email
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">⚠️ Order Cancellation Alert</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Customer has cancelled their order</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #fffbeb; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #f59e0b;">
          <h2 style="color: #92400e; margin-top: 0; font-size: 18px;">Cancelled Order #${order.id.slice(0, 8)}</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Customer:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold;">${order.customerName}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Email:</td>
              <td style="padding: 6px 0; color: #1f2937;">${order.customerEmail}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Phone:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold;">${order.customerPhone}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Amount:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold; font-size: 18px;">₹${order.amount.toLocaleString()}</td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Payment:</td>
              <td style="padding: 6px 0;">
                <span style="background-color: ${order.paymentMethod === 'cod' ? '#f59e0b' : '#dc2626'}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                  ${order.paymentMethod === 'cod' ? 'COD - No Refund Needed' : 'PAID - Refund Required'}
                </span>
              </td>
            </tr>
          </table>
        </div>

        ${order.paymentMethod !== 'cod' ? `
        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #991b1b; margin-top: 0; font-size: 14px; margin-bottom: 8px;">💳 Refund Action Required</h3>
          <p style="margin: 0; color: #991b1b; font-size: 13px;">Process refund of ₹${order.amount.toLocaleString()} within 24 hours for best customer experience.</p>
        </div>
        ` : ''}

        <div style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/admin/shop" style="display: inline-block; background-color: #f59e0b; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
            🏪 View in Admin Panel
          </a>
        </div>
      </div>
    </div>
  `
  
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Cancelled #${order.id.slice(0, 8)} - Aaroh Story Shop`,
      html: customerEmailHtml
    })
    
    await sendEmail({
      to: getAdminEmail(),
      subject: `Order Cancellation Alert #${order.id.slice(0, 8)}`,
      html: adminEmailHtml
    })
  } catch (emailError) {
    console.error('Error sending cancellation emails:', emailError)
  }
}
