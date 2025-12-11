import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { courseId, sendToAll, courseTitle, courseThumbnail, coursePrice } = await request.json()

    // Get users based on sendToAll flag
    const users = await prisma.user.findMany({
      where: sendToAll ? {} : {
        purchases: {
          some: {}
        }
      },
      select: {
        email: true,
        name: true
      }
    })

    // Get course announcement template
    const template = await prisma.emailTemplate.findUnique({
      where: { name: 'newCourseAnnouncement' }
    })

    if (!template) {
      return NextResponse.json({ error: 'Course announcement template not found' }, { status: 404 })
    }

    let successCount = 0
    let failureCount = 0

    // Send emails to all users
    for (const user of users) {
      try {
        await sendEmail({
          to: user.email,
          template: 'newCourseAnnouncement',
          variables: {
            userName: user.name || 'Student',
            courseName: courseTitle,
            courseThumbnail: courseThumbnail || 'https://via.placeholder.com/400x200/8B5CF6/FFFFFF?text=Course+Image',
            coursePrice: coursePrice,
            courseUrl: `${process.env.NEXTAUTH_URL}/courses/${courseId}`
          }
        })
        successCount++
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Course announcement sent to ${successCount} users${failureCount > 0 ? `, ${failureCount} failed` : ''}`
    })

  } catch (error) {
    console.error('Course announcement error:', error)
    return NextResponse.json({ error: 'Failed to send course announcements' }, { status: 500 })
  }
}