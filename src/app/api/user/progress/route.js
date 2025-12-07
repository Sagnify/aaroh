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

    const body = await request.json()
    console.log('Progress POST body:', body)
    
    const { courseId, videoId, timestamp, completed } = body
    
    if (!courseId || !videoId || timestamp === undefined) {
      console.log('Validation failed:', { courseId, videoId, timestamp })
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Use raw SQL to work with video_progress table
    const existingProgress = await prisma.$queryRaw`
      SELECT * FROM "video_progress" 
      WHERE "userId" = ${user.id} AND "courseId" = ${courseId} AND "videoId" = ${videoId}
      LIMIT 1
    `

    if (existingProgress.length > 0) {
      // Update existing progress
      await prisma.$executeRaw`
        UPDATE "video_progress" 
        SET "timestamp" = ${Math.floor(timestamp)}, "completed" = ${completed || false}, "updatedAt" = NOW()
        WHERE "userId" = ${user.id} AND "courseId" = ${courseId} AND "videoId" = ${videoId}
      `
    } else {
      // Create new progress
      const id = `prog_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.$executeRaw`
        INSERT INTO "video_progress" ("id", "userId", "courseId", "videoId", "timestamp", "completed", "createdAt", "updatedAt")
        VALUES (${id}, ${user.id}, ${courseId}, ${videoId}, ${Math.floor(timestamp)}, ${completed || false}, NOW(), NOW())
      `
    }

    // Check if course is completed and send email
    if (completed) {
      const allProgress = await prisma.$queryRaw`
        SELECT * FROM "video_progress" 
        WHERE "userId" = ${user.id} AND "courseId" = ${courseId}
      `
      
      const course = await prisma.course.findUnique({
        where: { id: courseId },
        include: { videos: true }
      })

      if (course && course.videos.length > 0) {
        const completedVideos = allProgress.filter(p => p.completed).length
        const totalVideos = course.videos.length
        
        // If all videos are completed, send completion email
        if (completedVideos === totalVideos) {
          const { sendEmail, emailTemplates } = await import('@/lib/email')
          const emailPromise = sendEmail({
            to: user.email,
            ...emailTemplates.courseCompletion(
              user.name || 'Student',
              course.title,
              course.id
            )
          }).catch(err => console.error('Course completion email error:', err))

          if (request.waitUntil) {
            request.waitUntil(emailPromise)
          }
        }
      }
    }

    return NextResponse.json({ message: 'Progress saved successfully' })
  } catch (error) {
    console.error('Progress API Error:', error)
    return NextResponse.json({ error: 'Failed to save progress' }, { status: 500 })
  }
}