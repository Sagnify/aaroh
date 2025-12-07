import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrichCourseWithStats } from '@/lib/course-utils'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    
    const course = await prisma.course.findUnique({
      where: { 
        id,
        published: true 
      },
      include: {
        curriculum: {
          include: {
            videos: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            purchases: true,
            reviews: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const enrichedCourse = enrichCourseWithStats(course)
    const avgRating = course.reviews.length > 0
      ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
      : 0
    
    const { rating: _, students: __, ...courseWithoutDefaults } = enrichedCourse
    
    return NextResponse.json({
      ...courseWithoutDefaults,
      rating: parseFloat(avgRating),
      ratingCount: course._count.reviews,
      students: course._count.purchases
    })
    
  } catch (error) {
    return handleApiError(error, 'Course fetch')
  }
}

export async function DELETE(request, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser('ADMIN')
    if (error) return error

    const { id } = await params
    
    await prisma.course.delete({
      where: { id }
    })
    
    return NextResponse.json({ message: 'Course deleted successfully' })
  } catch (error) {
    return handleApiError(error, 'Course deletion')
  }
}