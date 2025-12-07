import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates, getContactEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { classType, phone } = await request.json()
    console.log('Creating booking:', { sessionUser: session.user, classType, phone })

    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    // Find user by email (more reliable than session ID)
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const booking = await prisma.classBooking.create({
      data: {
        userId: user.id,
        classType,
        phone
      }
    })

    // Send emails asynchronously (non-blocking)
    const classTypeLabel = classType === 'PRIVATE' ? '1-on-1 Private' : 
                           classType === 'GROUP' ? 'Group Class' : 
                           'Offline (Kolkata)'
    
    const contactEmail = await getContactEmail()
    
    const emailPromises = Promise.all([
      // Admin notification
      contactEmail ? sendEmail({
        to: contactEmail,
        ...emailTemplates.adminClassBookingNotification(
          user.name || 'Student',
          user.email,
          phone,
          classTypeLabel
        )
      }).catch(err => console.error('Admin email failed:', err)) : Promise.resolve(),
      
      // User confirmation
      sendEmail({
        to: user.email,
        ...emailTemplates.classBookingConfirmation(
          user.name || 'Student',
          classTypeLabel
        )
      }).catch(err => console.error('User email failed:', err))
    ])

    // For Vercel serverless - ensure emails complete
    if (request.waitUntil) {
      request.waitUntil(emailPromises)
    }

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Class booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking', details: error.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookings = await prisma.classBooking.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings', details: error.message }, { status: 500 })
  }
}