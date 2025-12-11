import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, getAdminEmail } from '@/lib/email'

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
    await sendOrderEmails(customSong, request)

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

async function sendOrderEmails(order, request) {
  try {
    // Get user details for proper email
    const user = await prisma.user.findUnique({
      where: { email: order.userEmail }
    })
    
    // User email using template
    await sendEmail({
      to: order.userEmail,
      template: 'customSongOrderUpdate',
      variables: {
        recipientName: order.recipientName,
        occasion: order.occasion,
        status: 'Order Received - In Queue'
      }
    })

    // Admin email using template
    await sendEmail({
      to: getAdminEmail(),
      template: 'adminCustomSongPayment',
      variables: {
        userName: user?.name || 'Customer',
        userEmail: order.userEmail,
        orderId: order.id,
        recipientName: order.recipientName,
        occasion: order.occasion,
        amount: order.amount,
        adminUrl: `${process.env.NEXTAUTH_URL}/admin/shop`
      }
    })
  } catch (error) {
    console.error('Email sending error:', error)
  }
}