import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { PrismaClient } from '@prisma/client'
import nodemailer from 'nodemailer'

const prisma = new PrismaClient()

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const data = await request.json()
    const { occasion, recipientName, story, mood, style, language, length, deadline } = data

    // Get pricing settings
    const settings = await prisma.customSongSettings.findFirst()
    const standardPrice = settings?.standardPrice || 2999
    const expressPrice = settings?.expressPrice || 4499

    // Create custom song order
    const customSong = await prisma.customSongOrder.create({
      data: {
        userEmail: session.user.email,
        occasion,
        recipientName,
        story,
        mood,
        style,
        language: language || 'English',
        length,
        deliveryType: deadline,
        status: 'pending',
        amount: deadline === 'express' ? expressPrice : standardPrice,
      }
    })

    // Send email notifications
    await sendOrderEmails(customSong)

    return NextResponse.json({ 
      success: true, 
      orderId: customSong.id,
      message: 'Order submitted successfully! We will start working on your song and notify you when ready for preview.'
    })

  } catch (error) {
    console.error('Custom song creation error:', error)
    return NextResponse.json({ 
      error: 'Failed to create custom song order' 
    }, { status: 500 })
  }
}

async function sendOrderEmails(order) {
  try {
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    })

    // User email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: order.userEmail,
      subject: '🎵 Custom Song Order Received!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="margin: 0; font-size: 28px;">🎵 Order Received!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">We're excited to create your custom song</p>
          </div>
          
          <div style="background: white; color: #333; padding: 30px; border-radius: 15px; margin-bottom: 20px;">
            <h2 style="color: #667eea; margin-top: 0;">Order Details</h2>
            <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Occasion:</strong> ${order.occasion}</p>
            <p><strong>For:</strong> ${order.recipientName}</p>
            <p><strong>Style:</strong> ${order.style} - ${order.mood}</p>
            <p><strong>Delivery:</strong> ${order.deliveryType === 'express' ? 'Express (3 days)' : 'Standard (7 days)'}</p>
            <p><strong>Amount:</strong> ₹${order.amount.toLocaleString()}</p>
            
            <div style="background: #f8f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #667eea;">
              <h3 style="margin-top: 0; color: #667eea;">What happens next?</h3>
              <p>1. Our music team will start working on your song<br>
              2. You'll receive a preview in 2-4 days<br>
              3. Pay only after you love the preview!<br>
              4. Get the full song after payment</p>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 14px; opacity: 0.8;">
            <p>Thank you for choosing Aaroh Music!</p>
          </div>
        </div>
      `
    })

    // Admin email
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ADMIN_EMAIL,
      subject: '🎵 New Custom Song Order',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #667eea;">New Custom Song Order</h1>
          <div style="background: #f8f9ff; padding: 20px; border-radius: 10px; border-left: 4px solid #667eea;">
            <p><strong>Order ID:</strong> #${order.id.slice(0, 8)}</p>
            <p><strong>Customer:</strong> ${order.userEmail}</p>
            <p><strong>Occasion:</strong> ${order.occasion}</p>
            <p><strong>For:</strong> ${order.recipientName}</p>
            <p><strong>Style:</strong> ${order.style} - ${order.mood}</p>
            <p><strong>Story:</strong> ${order.story}</p>
            <p><strong>Delivery:</strong> ${order.deliveryType === 'express' ? 'Express (3 days)' : 'Standard (7 days)'}</p>
            <p><strong>Amount:</strong> ₹${order.amount.toLocaleString()}</p>
          </div>
          <p><a href="${process.env.NEXTAUTH_URL}/admin/shop" style="background: #667eea; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Manage Orders</a></p>
        </div>
      `
    })
  } catch (error) {
    console.error('Email sending error:', error)
  }
}