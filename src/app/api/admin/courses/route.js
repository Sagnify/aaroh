import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser('ADMIN')
    if (error) return error

    const courses = await prisma.course.findMany({
      include: {
        curriculum: {
          include: {
            videos: true
          }
        },
        _count: {
          select: {
            purchases: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(courses)
  } catch (error) {
    return handleApiError(error, 'Admin courses fetch')
  }
}

export async function PATCH(request) {
  try {
    const { user, error } = await getAuthenticatedUser('ADMIN')
    if (error) return error

    const { popularCourseIds } = await request.json()
    
    // Reset all courses to not popular
    await prisma.course.updateMany({
      data: { popular: false }
    })
    
    // Set selected courses as popular (max 3)
    if (popularCourseIds && popularCourseIds.length > 0) {
      await prisma.course.updateMany({
        where: { id: { in: popularCourseIds.slice(0, 3) } },
        data: { popular: true }
      })
    }
    
    return NextResponse.json({ message: 'Popular courses updated successfully' })
  } catch (error) {
    return handleApiError(error, 'Popular courses update')
  }
}