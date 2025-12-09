import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser, validateRequiredFields, successResponse } from '@/lib/api-utils'

export async function GET(request) {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID required' }, { status: 400 })
    }

    // Use raw SQL to fetch from video_progress table
    const progress = await prisma.$queryRaw`
      SELECT * FROM "video_progress" 
      WHERE "userId" = ${user.id} AND "courseId" = ${courseId}
      ORDER BY "updatedAt" DESC
    `

    return NextResponse.json(progress)
  } catch (error) {
    console.error('Progress fetch error:', error)
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const { courseId, videoId, completed } = await request.json()
    
    if (!courseId || !videoId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const existingProgress = await prisma.$queryRaw`
      SELECT * FROM "video_progress" 
      WHERE "userId" = ${user.id} AND "courseId" = ${courseId} AND "videoId" = ${videoId}
      LIMIT 1
    `

    if (existingProgress.length > 0) {
      await prisma.$executeRaw`
        UPDATE "video_progress" 
        SET "completed" = ${completed || false}, "updatedAt" = NOW()
        WHERE "userId" = ${user.id} AND "courseId" = ${courseId} AND "videoId" = ${videoId}
      `
    } else {
      const id = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.$executeRaw`
        INSERT INTO "video_progress" ("id", "userId", "courseId", "videoId", "timestamp", "completed", "createdAt", "updatedAt")
        VALUES (${id}, ${user.id}, ${courseId}, ${videoId}, 0, ${completed || false}, NOW(), NOW())
      `
    }

    // Check if course is completed and send email
    if (completed) {
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: {
          curriculum: {
            include: {
              videos: true
            }
          }
        }
      })

      if (course) {
        const allVideos = course.curriculum.flatMap(section => section.videos)
        const completedVideos = await prisma.$queryRaw`
          SELECT COUNT(*) as count FROM "video_progress" 
          WHERE "userId" = ${user.id} AND "courseId" = ${courseId} AND "completed" = true
        `
        const completedCount = Number(completedVideos[0].count)

        // If all videos completed, send congratulations email
        if (completedCount === allVideos.length) {
          const { sendEmail, emailTemplates } = await import('@/lib/email')
          const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`
          const emailPromise = sendEmail({
            to: user.email,
            ...emailTemplates(baseUrl).courseCompletion(
              user.name || 'Student',
              course.title,
              courseId
            )
          }).catch(err => console.error('Course completion email failed:', err))

          if (request.waitUntil) {
            request.waitUntil(emailPromise)
          }
        }
      }
    }

    return NextResponse.json({ message: 'Progress saved' })
  } catch (error) {
    console.error('Progress API Error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}