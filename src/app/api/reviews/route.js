import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function POST(request) {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const { courseId, rating, comment } = await request.json()

    // Validate rating
    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if user has purchased the course
    const purchase = await prisma.purchase.findFirst({
      where: { 
        userId: user.id, 
        courseId,
        status: 'completed'
      }
    })

    if (!purchase) {
      return NextResponse.json({ error: 'You must purchase the course to leave a review' }, { status: 403 })
    }

    // Check if review exists
    const existingReview = await prisma.$queryRaw`
      SELECT * FROM "Review" WHERE "userId" = ${user.id} AND "courseId" = ${courseId}
    `
    
    if (existingReview.length > 0) {
      await prisma.$executeRaw`
        UPDATE "Review" 
        SET "rating" = ${rating}, "comment" = ${comment}, "updatedAt" = NOW()
        WHERE "userId" = ${user.id} AND "courseId" = ${courseId}
      `
    } else {
      const id = `rev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      await prisma.$executeRaw`
        INSERT INTO "Review" ("id", "userId", "courseId", "rating", "comment", "createdAt", "updatedAt")
        VALUES (${id}, ${user.id}, ${courseId}, ${rating}, ${comment}, NOW(), NOW())
      `
    }
    
    const review = await prisma.$queryRaw`
      SELECT r.*, u.name as "userName" FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      WHERE r."userId" = ${user.id} AND r."courseId" = ${courseId}
    `

    // Update course average rating
    const reviews = await prisma.$queryRaw`
      SELECT rating FROM "Review" WHERE "courseId" = ${courseId}
    `

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length

    await prisma.course.update({
      where: { id: courseId },
      data: { rating: Math.round(avgRating * 10) / 10 }
    })

    return NextResponse.json(review)
  } catch (error) {
    return handleApiError(error, 'Review creation')
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const courseId = searchParams.get('courseId')

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    const reviews = await prisma.$queryRaw`
      SELECT r.*, u.name as "userName" FROM "Review" r
      JOIN "User" u ON r."userId" = u.id
      WHERE r."courseId" = ${courseId}
      ORDER BY r."createdAt" DESC
    `

    return NextResponse.json(reviews)
  } catch (error) {
    return handleApiError(error, 'Reviews fetch')
  }
}