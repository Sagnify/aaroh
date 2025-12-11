import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendEmail, emailTemplates, getContactEmail } from '@/lib/email'

// Log webhook events for audit trail
async function logWebhookEvent(event, status, error = null) {
  try {
    console.log(`📝 Logging webhook: ${event.event} | Status: ${status}`)
    // For now, just console log since we may not have webhookLog table
    // await prisma.webhookLog.create({ ... })
  } catch (logError) {
    console.error('Failed to log webhook event:', logError)
  }
}

// Enhanced payment processing with transaction safety
async function processPaymentSafely(paymentProcessor) {
  const maxRetries = 3
  let attempt = 0
  
  while (attempt < maxRetries) {
    try {
      return await prisma.$transaction(paymentProcessor, {
        timeout: 10000,
        isolationLevel: 'Serializable'
      })
    } catch (error) {
      attempt++
      console.error(`Payment processing attempt ${attempt} failed:`, error)
      
      if (attempt >= maxRetries) {
        throw error
      }
      
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
    }
  }
}

export async function POST(request) {
  let event = null
  
  try {
    const body = await request.text()
    const signature = request.headers.get('x-razorpay-signature')
    
    if (!signature) {
      console.error('❌ SECURITY: Missing webhook signature')
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 })
    }

    if (!process.env.RAZORPAY_WEBHOOK_SECRET) {
      console.error('❌ CONFIG: RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }
    
    // Verify webhook signature with timing-safe comparison
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(body)
      .digest('hex')
    
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
      console.error('❌ SECURITY: Invalid webhook signature')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    event = JSON.parse(body)
    console.log(`🔔 Webhook received: ${event.event} | ID: ${event.payload?.payment?.entity?.id || event.payload?.order?.entity?.id}`)
    
    await logWebhookEvent(event, 'received')
    
    // Handle payment.captured event - CRITICAL FOR REVENUE
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity
      
      if (!payment.order_id || !payment.id) {
        console.error('❌ CRITICAL: Missing order_id or payment_id in payment.captured event')
        await logWebhookEvent(event, 'failed', 'Missing required payment data')
        return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
      }
      
      console.log(`💰 Processing payment capture: ${payment.id} for order: ${payment.order_id}`)
      
      // Enhanced order lookup with better error handling
      const [purchase, shopOrder, customSong] = await Promise.all([
        prisma.purchase.findFirst({ where: { razorpayOrderId: payment.order_id } }),
        prisma.shopOrder.findFirst({ where: { razorpayOrderId: payment.order_id } }),
        prisma.customSongOrder.findFirst({ where: { razorpayOrderId: payment.order_id } })
      ])
      
      console.log(`🔍 Order lookup results: Purchase=${!!purchase}, Shop=${!!shopOrder}, CustomSong=${!!customSong}`)
      
      if (!purchase && !shopOrder && !customSong) {
        console.error(`No purchase, shop order, or custom song found for order_id: ${payment.order_id}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      if (purchase) {
        // Handle course purchase with idempotency check
        if (purchase.status === 'completed' && purchase.razorpayPaymentId === payment.id) {
          console.log(`✅ Payment already processed for purchase ${purchase.id}`)
          await logWebhookEvent(event, 'duplicate', 'Payment already processed')
          return NextResponse.json({ status: 'ok', message: 'Already processed' })
        }
        
        const updatedPurchase = await processPaymentSafely(async (tx) => {
          return await tx.purchase.update({
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
        })
        
        console.log(`✅ Payment captured for purchase ${purchase.id}, payment_id: ${payment.id}`)
        await logWebhookEvent(event, 'success', `Course purchase completed: ${purchase.id}`)
        
        // Send course purchase emails
        const contactEmail = await getContactEmail()
        const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
        
        const emailPromises = Promise.all([
          sendEmail({
            to: updatedPurchase.user.email,
            template: 'purchaseConfirmation',
            variables: {
              userName: updatedPurchase.user.name || 'Student',
              courseName: updatedPurchase.course.title,
              amount: updatedPurchase.amount,
              baseUrl: process.env.NEXTAUTH_URL
            }
          }).catch(err => console.error('User purchase email failed:', err)),
          
          contactEmail ? sendEmail({
            to: contactEmail,
            template: 'adminPurchaseNotification',
            variables: {
              userName: updatedPurchase.user.name || 'Student',
              userEmail: updatedPurchase.user.email,
              courseName: updatedPurchase.course.title,
              amount: updatedPurchase.amount
            }
          }).catch(err => console.error('Admin purchase email failed:', err)) : Promise.resolve()
        ])

        if (request.waitUntil) {
          request.waitUntil(emailPromises)
        }
      } else if (shopOrder) {
        // Handle shop order with idempotency check
        if (shopOrder.paymentStatus === 'paid' && shopOrder.razorpayPaymentId === payment.id) {
          console.log(`✅ Payment already processed for shop order ${shopOrder.id}`)
          await logWebhookEvent(event, 'duplicate', 'Shop payment already processed')
          return NextResponse.json({ status: 'ok', message: 'Already processed' })
        }
        
        const updatedOrder = await processPaymentSafely(async (tx) => {
          return await tx.shopOrder.update({
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
        })
        
        console.log(`✅ Shop payment captured for order ${shopOrder.id}, payment_id: ${payment.id}`)
        await logWebhookEvent(event, 'success', `Shop order completed: ${shopOrder.id}`)
        
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
      } else if (customSong) {
        // Handle custom song order with idempotency check
        if (customSong.status === 'completed') {
          console.log(`✅ Payment already processed for custom song ${customSong.id}`)
          await logWebhookEvent(event, 'duplicate', 'Custom song payment already processed')
          return NextResponse.json({ status: 'ok', message: 'Already processed' })
        }
        
        const updatedCustomSong = await processPaymentSafely(async (tx) => {
          // Check if this is a repayment and add current order ID to history
          const orderHistory = Array.isArray(customSong.orderIdHistory) ? customSong.orderIdHistory : []
          const isRepayment = orderHistory.length > 0
          
          // Add current order ID to history if it's a repayment
          const updatedHistory = isRepayment ? [...orderHistory, customSong.razorpayOrderId] : orderHistory
          
          return await tx.customSongOrder.update({
            where: { id: customSong.id },
            data: { 
              status: 'completed',
              razorpayPaymentId: payment.id,
              orderIdHistory: updatedHistory
            }
          })
        })
        
        console.log(`✅ Custom song payment captured for order ${customSong.id}, payment_id: ${payment.id}`)
        await logWebhookEvent(event, 'success', `Custom song completed: ${customSong.id}`)
        
        // Get user details for email
        const user = await prisma.user.findUnique({
          where: { email: customSong.userEmail }
        })
        
        if (user) {
          const orderHistory = Array.isArray(updatedCustomSong.orderIdHistory) ? updatedCustomSong.orderIdHistory : []
          const isRepayment = orderHistory.length > 0
          
          console.log('📧 Webhook sending emails for custom song payment')
          
          try {
            await Promise.all([
              sendEmail({
                to: user.email,
                template: 'customSongPaymentSuccess',
                variables: {
                  userName: user.name || 'Customer',
                  orderId: updatedCustomSong.id,
                  recipientName: updatedCustomSong.recipientName,
                  occasion: updatedCustomSong.occasion,
                  amount: updatedCustomSong.amount,
                  musicLibraryUrl: `${process.env.NEXTAUTH_URL}/shop/music-library`
                }
              }),
              sendEmail({
                to: process.env.CONTACT_EMAIL,
                template: 'adminCustomSongPayment',
                variables: {
                  userName: user.name || 'Customer',
                  userEmail: user.email,
                  orderId: updatedCustomSong.id,
                  recipientName: updatedCustomSong.recipientName,
                  occasion: updatedCustomSong.occasion,
                  amount: updatedCustomSong.amount,
                  adminUrl: `${process.env.NEXTAUTH_URL}/admin/shop`
                }
              })
            ])
            console.log('✅ Webhook emails sent successfully')
          } catch (emailError) {
            console.error('❌ Webhook email failed:', emailError.message)
          }
        }
      }


    }
    
    // Handle payment.failed event - CRITICAL FOR CUSTOMER SUPPORT
    if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity
      
      if (!payment.order_id) {
        console.error('❌ CRITICAL: Missing order_id in payment.failed event')
        await logWebhookEvent(event, 'failed', 'Missing order_id in payment failure')
        return NextResponse.json({ error: 'Invalid event data' }, { status: 400 })
      }
      
      console.log(`❌ Processing payment failure: ${payment.id} for order: ${payment.order_id}`)
      
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
      
      const customSong = !purchase && !shopOrder ? await prisma.customSongOrder.findFirst({
        where: { razorpayOrderId: payment.order_id }
      }) : null
      
      if (!purchase && !shopOrder && !customSong) {
        console.error(`No purchase, shop order, or custom song found for order_id: ${payment.order_id}`)
        return NextResponse.json({ error: 'Order not found' }, { status: 404 })
      }

      if (purchase) {
        // Handle course purchase failure
        if (purchase.status !== 'completed') {
          await processPaymentSafely(async (tx) => {
            return await tx.purchase.update({
              where: { id: purchase.id },
              data: {
                status: 'failed',
                razorpayPaymentId: payment.id,
                updatedAt: new Date()
              }
            })
          })
          
          console.log(`❌ Payment failed for purchase ${purchase.id}, reason: ${payment.error_description || 'Unknown'}`)
          await logWebhookEvent(event, 'failed', `Course purchase failed: ${purchase.id} - ${payment.error_description}`)

          const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
          const emailPromise = sendEmail({
            to: purchase.user.email,
            template: 'paymentFailed',
            variables: {
              userName: purchase.user.name || 'Student',
              courseName: purchase.course.title,
              retryUrl: `${process.env.NEXTAUTH_URL}/courses`
            }
          }).catch(err => console.error('Payment failed email error:', err))

          if (request.waitUntil) {
            request.waitUntil(emailPromise)
          }
        } else {
          console.log(`⚠️ Ignoring failed event for completed purchase ${purchase.id}`)
          await logWebhookEvent(event, 'ignored', `Failed event for completed purchase: ${purchase.id}`)
        }
      } else if (shopOrder) {
        // Handle shop order failure
        if (shopOrder.paymentStatus !== 'paid') {
          await processPaymentSafely(async (tx) => {
            return await tx.shopOrder.update({
              where: { id: shopOrder.id },
              data: {
                status: 'cancelled',
                paymentStatus: 'failed',
                razorpayPaymentId: payment.id
              }
            })
          })
          
          console.log(`❌ Shop payment failed for order ${shopOrder.id}, reason: ${payment.error_description || 'Unknown'}`)
          await logWebhookEvent(event, 'failed', `Shop order failed: ${shopOrder.id} - ${payment.error_description}`)

          // Send shop payment failure notification
          console.log(`❌ Shop payment failed for order ${shopOrder.id}, reason: ${payment.error_description || 'Unknown'}`)
        } else {
          console.log(`⚠️ Ignoring failed event for paid shop order ${shopOrder.id}`)
          await logWebhookEvent(event, 'ignored', `Failed event for paid shop order: ${shopOrder.id}`)
        }
      } else if (customSong) {
        // Handle custom song order failure
        if (customSong.status !== 'completed') {
          const updatedCustomSong = await processPaymentSafely(async (tx) => {
            return await tx.customSongOrder.update({
              where: { id: customSong.id },
              data: { 
                status: 'failed',
                razorpayPaymentId: payment.id
              }
            })
          })
          
          console.log(`❌ Custom song payment failed for order ${customSong.id}, reason: ${payment.error_description || 'Unknown'}`)
          await logWebhookEvent(event, 'failed', `Custom song failed: ${customSong.id} - ${payment.error_description}`)
          
          // Get user details for failure email
          const user = await prisma.user.findUnique({
            where: { email: customSong.userEmail }
          })
          
          if (user) {
            // Send custom song payment failure email
            
            const emailPromise = sendEmail({
              to: user.email,
              template: 'customSongPaymentFailed',
              variables: {
                userName: user.name || 'Customer',
                orderId: updatedCustomSong.id,
                recipientName: updatedCustomSong.recipientName,
                occasion: updatedCustomSong.occasion,
                amount: updatedCustomSong.amount,
                errorReason: payment.error_description || 'Payment processing failed',
                retryUrl: `${process.env.NEXTAUTH_URL}/shop/custom-song`
              }
            }).catch(err => console.error('Custom song failure email failed:', err))
            
            if (request.waitUntil) {
              request.waitUntil(emailPromise)
            }
          }
        } else {
          console.log(`⚠️ Ignoring failed event for completed custom song ${customSong.id}`)
          await logWebhookEvent(event, 'ignored', `Failed event for completed custom song: ${customSong.id}`)
        }
      }
    }
    
    // Handle order.paid event (backup for payment.captured)
    if (event.event === 'order.paid') {
      const order = event.payload.order.entity
      console.log(`💵 Order paid event received: ${order.id}`)
      await logWebhookEvent(event, 'info', `Order paid: ${order.id}`)
    }
    
    // Handle payment.authorized event
    if (event.event === 'payment.authorized') {
      const payment = event.payload.payment.entity
      console.log(`🔒 Payment authorized: ${payment.id} for order: ${payment.order_id}`)
      await logWebhookEvent(event, 'info', `Payment authorized: ${payment.id}`)
    }
    
    // Handle refund events
    if (event.event === 'refund.created' || event.event === 'refund.processed') {
      const refund = event.payload.refund.entity
      console.log(`💰 Refund ${event.event}: ${refund.id} for payment: ${refund.payment_id}`)
      await logWebhookEvent(event, 'info', `Refund ${event.event}: ${refund.id}`)
      
      try {
        await sendEmail({
          to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
          subject: `💰 Refund ${event.event.split('.')[1].toUpperCase()} - ${refund.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 2px solid #F59E0B;">
              <h1 style="color: #F59E0B;">💰 Refund ${event.event.split('.')[1].toUpperCase()}</h1>
              <p><strong>Refund ID:</strong> ${refund.id}</p>
              <p><strong>Payment ID:</strong> ${refund.payment_id}</p>
              <p><strong>Amount:</strong> ₹${(refund.amount / 100).toLocaleString()}</p>
              <p><strong>Status:</strong> ${refund.status}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send refund alert:', emailError)
      }
    }
    
    // Handle dispute events
    if (event.event.startsWith('dispute.')) {
      const dispute = event.payload.dispute.entity
      console.log(`⚠️ Dispute ${event.event}: ${dispute.id}`)
      await logWebhookEvent(event, 'alert', `Dispute ${event.event}: ${dispute.id}`)
      
      try {
        await sendEmail({
          to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
          subject: `🚨 URGENT: Payment Dispute - ${dispute.id}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #DC2626;">
              <h1 style="color: #DC2626;">🚨 URGENT: Payment Dispute</h1>
              <p><strong>Dispute ID:</strong> ${dispute.id}</p>
              <p><strong>Payment ID:</strong> ${dispute.payment_id}</p>
              <p><strong>Amount:</strong> ₹${(dispute.amount / 100).toLocaleString()}</p>
              <p><strong>Status:</strong> ${dispute.status}</p>
              <p><strong>Reason:</strong> ${dispute.reason_description}</p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p style="color: #DC2626; font-weight: bold;">IMMEDIATE ACTION REQUIRED!</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send dispute alert:', emailError)
      }
    }
    
    // Log unhandled events for monitoring
    const handledEvents = [
      'payment.captured', 'payment.failed', 'payment.authorized',
      'order.paid', 'refund.created', 'refund.processed'
    ]
    
    if (!handledEvents.includes(event.event) && !event.event.startsWith('dispute.')) {
      console.log(`🔍 Unhandled webhook event: ${event.event}`)
      await logWebhookEvent(event, 'unhandled', `Unhandled event: ${event.event}`)
    }

    await logWebhookEvent(event, 'completed')
    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('❌ CRITICAL Webhook error:', error)
    
    if (event) {
      await logWebhookEvent(event, 'error', error.message)
      
      // Send critical error alert to admin
      try {
        await sendEmail({
          to: process.env.CONTACT_EMAIL || process.env.ADMIN_EMAIL,
          subject: '🚨 CRITICAL: Webhook Processing Failed',
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 3px solid #DC2626;">
              <h1 style="color: #DC2626;">🚨 CRITICAL: Webhook Processing Failed</h1>
              <p><strong>Event:</strong> ${event.event}</p>
              <p><strong>Error:</strong> ${error.message}</p>
              <p><strong>Stack:</strong> <pre>${error.stack}</pre></p>
              <p><strong>Time:</strong> ${new Date().toISOString()}</p>
              <p style="color: #DC2626; font-weight: bold;">IMMEDIATE INVESTIGATION REQUIRED!</p>
            </div>
          `
        })
      } catch (emailError) {
        console.error('Failed to send webhook error alert:', emailError)
      }
    }
    
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function sendShopOrderEmails(order, user, items, request) {
  try {
    const emailPromises = Promise.all([
      sendEmail({
        to: user.email,
        template: 'shopOrderConfirmation',
        variables: {
          userName: order.customerName,
          orderId: order.id,
          paymentId: order.razorpayPaymentId,
          amount: order.amount,
          orderUrl: `${process.env.NEXTAUTH_URL}/shop/orders/${order.id}`
        }
      }),
      
      sendEmail({
        to: process.env.CONTACT_EMAIL,
        template: 'adminShopOrderNotification',
        variables: {
          customerName: order.customerName,
          orderId: order.id,
          paymentId: order.razorpayPaymentId,
          amount: order.amount,
          adminUrl: `${process.env.NEXTAUTH_URL}/admin/shop`
        }
      })
    ])
    
    if (request.waitUntil) {
      request.waitUntil(emailPromises)
    }
  } catch (emailError) {
    console.error('Error sending shop order emails:', emailError)
  }
}

// Shop payment failure emails removed - using direct sendEmail calls with templates