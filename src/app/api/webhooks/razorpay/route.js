import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, emailTemplates, getContactEmail } from '@/lib/email'

export async function POST(request) {
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
      
      // Try to find course purchase first
      const purchase = await prisma.purchase.findFirst({
        where: { razorpayOrderId: payment.order_id }
      })
      
      // Try to find shop order if no course purchase found
      const shopOrder = !purchase ? await prisma.shopOrder.findFirst({
        where: { razorpayOrderId: payment.order_id }
      }) : null
      
      if (!purchase && !shopOrder) {
        console.error(`No purchase or shop order found for order_id: ${payment.order_id}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      if (purchase) {
        // Handle course purchase
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
        
        // Send course purchase emails
        const contactEmail = await getContactEmail()
        const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
        
        const emailPromises = Promise.all([
          sendEmail({
            to: updatedPurchase.user.email,
            ...emailTemplates(baseUrl).purchaseConfirmation(
              updatedPurchase.user.name || 'Student',
              updatedPurchase.course.title,
              updatedPurchase.amount
            )
          }).catch(err => console.error('User purchase email failed:', err)),
          
          contactEmail ? sendEmail({
            to: contactEmail,
            ...emailTemplates(baseUrl).adminPurchaseNotification(
              updatedPurchase.user.name || 'Student',
              updatedPurchase.user.email,
              updatedPurchase.course.title,
              updatedPurchase.amount
            )
          }).catch(err => console.error('Admin purchase email failed:', err)) : Promise.resolve()
        ])

        if (request.waitUntil) {
          request.waitUntil(emailPromises)
        }
      } else if (shopOrder) {
        // Handle shop order
        if (shopOrder.paymentStatus === 'paid' && shopOrder.razorpayPaymentId === payment.id) {
          console.log(`Payment already processed for shop order ${shopOrder.id}`)
          return NextResponse.json({ status: 'ok', message: 'Already processed' })
        }
        
        const updatedOrder = await prisma.shopOrder.update({
          where: { id: shopOrder.id },
          data: {
            status: 'confirmed',
            paymentStatus: 'paid',
            razorpayPaymentId: payment.id
          },
          include: {
            user: true
          }
        })
        console.log(`Shop payment captured for order ${shopOrder.id}, payment_id: ${payment.id}`)
        
        // Send shop order confirmation emails
        await sendShopOrderEmails(updatedOrder, updatedOrder.user, updatedOrder.items, request)
        
        // Clear cart after successful payment
        await prisma.cartItem.deleteMany({
          where: {
            cart: {
              userId: updatedOrder.user.id
            }
          }
        })
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
      
      const shopOrder = !purchase ? await prisma.shopOrder.findFirst({
        where: { razorpayOrderId: payment.order_id },
        include: {
          user: true
        }
      }) : null
      
      if (!purchase && !shopOrder) {
        console.error(`No purchase or shop order found for order_id: ${payment.order_id}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      if (purchase) {
        // Handle course purchase failure
        if (purchase.status !== 'completed') {
          await prisma.purchase.update({
            where: { id: purchase.id },
            data: {
              status: 'failed',
              updatedAt: new Date()
            }
          })
          console.log(`Payment failed for purchase ${purchase.id}, reason: ${payment.error_description || 'Unknown'}`)

          const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
          const emailPromise = sendEmail({
            to: purchase.user.email,
            ...emailTemplates(baseUrl).paymentFailed(
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
      } else if (shopOrder) {
        // Handle shop order failure
        if (shopOrder.paymentStatus !== 'paid') {
          await prisma.shopOrder.update({
            where: { id: shopOrder.id },
            data: {
              status: 'cancelled',
              paymentStatus: 'failed'
            }
          })
          console.log(`Shop payment failed for order ${shopOrder.id}, reason: ${payment.error_description || 'Unknown'}`)

          // Send shop payment failure emails
          await sendShopPaymentFailureEmails(shopOrder, shopOrder.user, payment.error_description, payment.error_code, request)
        } else {
          console.log(`Ignoring failed event for paid shop order ${shopOrder.id}`)
        }
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function sendShopOrderEmails(order, user, items, request) {
  const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
  
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">✅ Payment Confirmed!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Your order is now being processed</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #065f46; margin-top: 0;">Order #${order.id.slice(0, 8)}</h2>
        <p style="color: #1f2937;">Amount: ₹${order.amount.toLocaleString()}</p>
        <p style="color: #1f2937;">Payment ID: ${order.razorpayPaymentId}</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop/orders/${order.id}" style="display: inline-block; background: #10b981; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            📦 Track Your Order
          </a>
        </div>
      </div>
    </div>
  `
  
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #10b981; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">💰 Payment Received!</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order #${order.id.slice(0, 8)}</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p>Customer: ${order.customerName}</p>
        <p>Amount: ₹${order.amount.toLocaleString()}</p>
        <p>Payment ID: ${order.razorpayPaymentId}</p>
      </div>
    </div>
  `
  
  try {
    const emailPromises = Promise.all([
      sendEmail({
        to: user.email,
        subject: `Payment Confirmed #${order.id.slice(0, 8)}`,
        html: customerEmailHtml
      }),
      
      sendEmail({
        to: process.env.CONTACT_EMAIL,
        subject: `Payment Received #${order.id.slice(0, 8)}`,
        html: adminEmailHtml
      })
    ])
    
    if (request.waitUntil) {
      request.waitUntil(emailPromises)
    }
  } catch (emailError) {
    console.error('Error sending shop order emails:', emailError)
  }
}

async function sendShopPaymentFailureEmails(order, user, errorDescription, errorCode, request) {
  const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
  
  const customerEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc2626; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">❌ Payment Failed</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">We couldn't process your payment</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <h2 style="color: #991b1b;">Order #${order.id.slice(0, 8)}</h2>
        <p>Amount: ₹${order.amount.toLocaleString()}</p>
        ${errorDescription ? `<p>Reason: ${errorDescription}</p>` : ''}
        
        <div style="text-align: center; margin: 30px 0;">
          <a href="${baseUrl}/shop/cart" style="display: inline-block; background: #3B82F6; color: white; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold;">
            🔄 Try Again
          </a>
        </div>
      </div>
    </div>
  `
  
  const adminEmailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: #dc2626; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="color: white; margin: 0;">⚠️ Payment Failed</h1>
        <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0;">Order #${order.id.slice(0, 8)}</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px;">
        <p>Customer: ${order.customerName} (${order.customerEmail})</p>
        <p>Amount: ₹${order.amount.toLocaleString()}</p>
        ${errorCode ? `<p>Error Code: ${errorCode}</p>` : ''}
        ${errorDescription ? `<p>Error: ${errorDescription}</p>` : ''}
      </div>
    </div>
  `
  
  try {
    const emailPromises = Promise.all([
      sendEmail({
        to: user.email,
        subject: `Payment Failed #${order.id.slice(0, 8)} - Aaroh Story Shop`,
        html: customerEmailHtml
      }),
      
      sendEmail({
        to: process.env.CONTACT_EMAIL,
        subject: `Payment Failure Alert #${order.id.slice(0, 8)}`,
        html: adminEmailHtml
      })
    ])
    
    if (request.waitUntil) {
      request.waitUntil(emailPromises)
    }
  } catch (emailError) {
    console.error('Error sending payment failure emails:', emailError)
  }
}