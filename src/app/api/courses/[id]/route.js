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
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    const enrichedCourse = enrichCourseWithStats(course)
    return NextResponse.json(enrichedCourse)
    
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