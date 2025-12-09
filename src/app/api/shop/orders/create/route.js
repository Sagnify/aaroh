import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import Razorpay from 'razorpay'
import { sendEmail } from '@/lib/email'

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const body = await request.json()
    const { items, totalAmount, shippingAddress, paymentMethod, createRazorpayOrder } = body

    const order = await prisma.shopOrder.create({
      data: {
        userId: user.id,
        customerName: shippingAddress.name,
        customerEmail: user.email,
        customerPhone: shippingAddress.phone,
        items,
        amount: totalAmount,
        shippingAddress,
        paymentMethod: paymentMethod || 'online',
        status: paymentMethod === 'cod' ? 'confirmed' : 'pending',
        paymentStatus: paymentMethod === 'cod' ? 'cod' : 'pending'
      }
    })

    let razorpayOrder = null
    if (createRazorpayOrder && paymentMethod !== 'cod') {
      razorpayOrder = await razorpay.orders.create({
        amount: totalAmount * 100, // Convert to paise
        currency: 'INR',
        receipt: `order_${order.id}`
      })
      
      await prisma.shopOrder.update({
        where: { id: order.id },
        data: { razorpayOrderId: razorpayOrder.id }
      })
    }

    // Send emails for COD orders immediately
    if (paymentMethod === 'cod') {
      await sendOrderEmails(order, user, items)
      
      // Clear cart after successful COD order
      await prisma.cartItem.deleteMany({
        where: {
          cart: {
            userId: user.id
          }
        }
      })
    }

    return NextResponse.json({ 
      success: true, 
      orderId: order.id,
      razorpayOrder
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}

async function sendOrderEmails(order, user, items) {
  const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
  
  // Email to customer
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px; margin-bottom: 10px;">🎉 Order Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 0; font-size: 16px;">Thank you for choosing Aaroh Story Shop</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #f8fafc; padding: 24px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #3B82F6;">
          <h2 style="color: #1f2937; margin-top: 0; font-size: 20px; margin-bottom: 16px;">Order Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Number:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold;">#${order.id.slice(0, 8)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Order Date:</td>
              <td style="padding: 8px 0; color: #1f2937;">${new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Payment Method:</td>
              <td style="padding: 8px 0;">
                <span style="background-color: ${order.paymentMethod === 'cod' ? '#f59e0b' : '#10b981'}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                  ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Paid Online'}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #6b7280; font-weight: 600;">Total Amount:</td>
              <td style="padding: 8px 0; color: #1f2937; font-weight: bold; font-size: 18px;">₹${order.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 18px; margin-bottom: 16px; border-bottom: 2px solid #e5e7eb; padding-bottom: 8px;">🎁 Your Items</h3>
          ${items.map(item => `
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <h4 style="color: #1f2937; margin: 0; font-size: 16px; font-weight: bold;">${item.productName}</h4>
                <span style="color: #3B82F6; font-weight: bold; font-size: 16px;">₹${item.price.toLocaleString()}</span>
              </div>
              <div style="background-color: white; padding: 12px; border-radius: 6px; border-left: 3px solid #3B82F6;">
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;"><strong>👤 Recipient:</strong> ${item.recipientName}</p>
                <p style="margin: 0 0 6px 0; color: #6b7280; font-size: 14px;"><strong>🎨 Variant:</strong> ${item.variant}</p>
                ${item.customText ? `<p style="margin: 0; color: #6b7280; font-size: 14px;"><strong>💌 Message:</strong> "${item.customText}"</p>` : ''}
                ${item.songData ? `<p style="margin: 6px 0 0 0; color: #6b7280; font-size: 14px;"><strong>🎵 Song:</strong> ${item.songData.name || 'Custom Song'}</p>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background-color: #f0f9ff; border: 1px solid #bae6fd; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
          <h3 style="color: #0c4a6e; margin-top: 0; font-size: 16px; margin-bottom: 12px;">📍 Delivery Address</h3>
          <div style="color: #0c4a6e; line-height: 1.6;">
            <strong>${order.shippingAddress.name}</strong><br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
            📞 ${order.shippingAddress.phone}
          </div>
        </div>

        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop/orders/${order.id}" style="display: inline-block; background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px rgba(59, 130, 246, 0.3);">
            📦 Track Your Order
          </a>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 16px; margin: 24px 0; border-radius: 0 8px 8px 0;">
          <p style="margin: 0; color: #065f46; font-size: 14px;">
            <strong>📧 What's Next?</strong><br>
            • You'll receive shipping updates via email<br>
            • Track your order anytime using the link above<br>
            • Contact us if you have any questions
          </p>
        </div>

        <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; text-align: center; color: #6b7280;">
          <p style="margin: 0 0 10px 0; font-size: 16px; color: #1f2937;">Thank you for shopping with us! 🎵</p>
          <p style="margin: 0; font-size: 14px;">Best regards,<br><strong>Aaroh Story Shop Team</strong></p>
        </div>
      </div>
    </div>
  `
  
  // Email to admin
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">🚨 New Order Alert!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Action Required - Process Order</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin-bottom: 24px; border-left: 4px solid #dc2626;">
          <h2 style="color: #991b1b; margin-top: 0; font-size: 18px;">Order #${order.id.slice(0, 8)}</h2>
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
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Payment:</td>
              <td style="padding: 6px 0;">
                <span style="background-color: ${order.paymentMethod === 'cod' ? '#f59e0b' : '#10b981'}; color: white; padding: 4px 12px; border-radius: 16px; font-size: 12px; font-weight: 600;">
                  ${order.paymentMethod === 'cod' ? 'COD' : 'PAID'}
                </span>
              </td>
            </tr>
            <tr>
              <td style="padding: 6px 0; color: #6b7280; font-weight: 600;">Total:</td>
              <td style="padding: 6px 0; color: #1f2937; font-weight: bold; font-size: 18px;">₹${order.amount.toLocaleString()}</td>
            </tr>
          </table>
        </div>

        <div style="margin-bottom: 24px;">
          <h3 style="color: #1f2937; font-size: 16px; margin-bottom: 12px;">📦 Products to Prepare & Ship</h3>
          ${items.map(item => `
            <div style="background-color: #f9fafb; border: 1px solid #e5e7eb; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
              <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 8px;">
                <h4 style="color: #1f2937; margin: 0; font-size: 14px; font-weight: bold;">${item.productName}</h4>
                <span style="color: #dc2626; font-weight: bold;">₹${item.price.toLocaleString()}</span>
              </div>
              <div style="font-size: 13px; color: #6b7280; line-height: 1.4;">
                <strong>👤 For:</strong> ${item.recipientName} | <strong>🎨 Variant:</strong> ${item.variant}<br>
                ${item.customText ? `<strong>💌 Custom Message:</strong> "${item.customText}"<br>` : ''}
                ${item.songData ? `<strong>🎵 Song:</strong> ${item.songData.name || 'Custom Song'}<br>` : ''}
              </div>
            </div>
          `).join('')}
        </div>

        <div style="background-color: #fffbeb; border: 1px solid #fbbf24; border-radius: 8px; padding: 16px; margin-bottom: 24px;">
          <h3 style="color: #92400e; margin-top: 0; font-size: 14px; margin-bottom: 8px;">📍 Shipping Address</h3>
          <div style="color: #92400e; font-size: 13px; line-height: 1.5;">
            <strong>${order.shippingAddress.name}</strong><br>
            ${order.shippingAddress.address}<br>
            ${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}<br>
            📞 ${order.shippingAddress.phone}
          </div>
        </div>

        <div style="text-align: center; margin: 24px 0;">
          <a href="${baseUrl}/admin/shop" style="display: inline-block; background-color: #dc2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px; margin-right: 12px;">
            🏪 View in Admin Panel
          </a>
          <a href="https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)}!%20Your%20order%20%23${order.id.slice(0, 8)}%20is%20being%20processed.%20We'll%20update%20you%20soon!" style="display: inline-block; background-color: #25D366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 14px;">
            💬 WhatsApp Customer
          </a>
        </div>

        <div style="background-color: #ecfdf5; border-left: 4px solid #10b981; padding: 12px; margin: 20px 0; border-radius: 0 6px 6px 0;">
          <p style="margin: 0; color: #065f46; font-size: 12px;">
            <strong>⏰ Next Steps:</strong> Process this order within 24 hours for best customer experience
          </p>
        </div>
      </div>
    </div>
  `
  
  try {
    await sendEmail({
      to: user.email,
      subject: `Order Confirmation #${order.id.slice(0, 8)} - Aaroh Story Shop`,
      html: customerEmailHtml
    })
    
    await sendEmail({
      to: process.env.CONTACT_EMAIL,
      subject: `New Order #${order.id.slice(0, 8)} - Action Required`,
      html: adminEmailHtml
    })
  } catch (emailError) {
    console.error('Error sending emails:', emailError)
  }
}
