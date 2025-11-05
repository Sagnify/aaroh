import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function POST(request) {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const { courseId } = await request.json()

    // Check if user has purchased the course
    const purchase = await prisma.purchase.findFirst({
      where: { 
        userId: user.id, 
        courseId,
        status: 'completed'
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'Course not purchased' }, { status: 403 })
    }

    // Check if all videos are completed
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

    const allVideos = course.curriculum.flatMap(section => section.videos)
    const completedVideos = await prisma.$queryRaw`
      SELECT COUNT(*) as count FROM "video_progress" 
      WHERE "userId" = ${user.id} AND "courseId" = ${courseId} AND "completed" = true
    `
    const completedCount = Number(completedVideos[0].count)

    if (completedCount < allVideos.length) {
      return NextResponse.json({ 
        error: 'Complete all videos to earn certificate',
        completed: completedCount,
        total: allVideos.length
      }, { status: 400 })
    }

    // Generate certificate
    const certificateId = `AAROH-${Date.now()}-${user.id.slice(-6).toUpperCase()}`
    
    // Check if certificate exists
    const existingCert = await prisma.$queryRaw`
      SELECT * FROM "Certificate" WHERE "userId" = ${user.id} AND "courseId" = ${courseId}
    `
    
    if (existingCert.length === 0) {
      const id = `cert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.$executeRaw`
        INSERT INTO "Certificate" ("id", "userId", "courseId", "certificateId", "issuedAt")
        VALUES (${id}, ${user.id}, ${courseId}, ${certificateId}, NOW())
      `
    }
    
    const certificate = await prisma.$queryRaw`
      SELECT c.*, co.title as "courseTitle", u.name as "userName" FROM "Certificate" c
      JOIN "Course" co ON c."courseId" = co.id
      JOIN "User" u ON c."userId" = u.id
      WHERE c."userId" = ${user.id} AND c."courseId" = ${courseId}
    `

    return NextResponse.json(certificate)
  } catch (error) {
    return handleApiError(error, 'Certificate generation')
  }
}

export async function GET(request) {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    const whereClause = { userId: user.id }
    if (courseId) {
      whereClause.courseId = courseId
    }

    let certificates
    if (courseId) {
      certificates = await prisma.$queryRaw`
        SELECT c.*, co.title as "courseTitle" FROM "Certificate" c
        JOIN "Course" co ON c."courseId" = co.id
        WHERE c."userId" = ${user.id} AND c."courseId" = ${courseId}
        ORDER BY c."issuedAt" DESC
      `
    } else {
      certificates = await prisma.$queryRaw`
        SELECT c.*, co.title as "courseTitle" FROM "Certificate" c
        JOIN "Course" co ON c."courseId" = co.id
        WHERE c."userId" = ${user.id}
        ORDER BY c."issuedAt" DESC
      `
    }

    return NextResponse.json(certificates)
  } catch (error) {
    return handleApiError(error, 'Certificates fetch')
  }
}