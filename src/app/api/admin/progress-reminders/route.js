import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { daysInactive = 7 } = await request.json()

    // Find users who haven't accessed courses in specified days
    const cutoffDate = new Date(Date.now() - (daysInactive * 24 * 60 * 60 * 1000))
    
    const inactiveUsers = await prisma.user.findMany({
      where: {
        role: 'USER',
        purchases: {
          some: {
            status: 'completed',
            updatedAt: {
              lt: cutoffDate
            }
          }
        }
      },
      include: {
        purchases: {
          where: {
            status: 'completed'
          },
          include: {
            course: true
          },
          orderBy: {
            updatedAt: 'desc'
          },
          take: 1
        }
      }
    })

    // Send reminder emails
    const emailPromises = inactiveUsers.map(user => {
      const latestCourse = user.purchases[0]?.course
      if (!latestCourse) return Promise.resolve()

      return sendEmail({
        to: user.email,
        template: 'courseCompletionReminder',
        variables: {
          userName: user.name || 'Student',
          courseName: latestCourse.title,
          daysInactive,
          dashboardUrl: `${process.env.NEXTAUTH_URL}/dashboard`
        }
      }).catch(err => console.error(`Reminder email failed for ${user.email}:`, err))
    })

    await Promise.all(emailPromises)

    return NextResponse.json({ 
      success: true, 
      message: `Sent reminders to ${inactiveUsers.length} inactive users` 
    })
  } catch (error) {
    console.error('Progress reminder error:', error)
    return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 })
  }
}