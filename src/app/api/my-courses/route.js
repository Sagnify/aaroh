import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrichCourseWithStats } from '@/lib/course-utils'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const purchases = await prisma.purchase.findMany({
      where: {
        userId: user.id
      },
      include: {
        course: {
          include: {
            curriculum: {
              include: {
                videos: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    const coursesWithProgress = await Promise.all(
      purchases.map(async (purchase) => {
        const latestProgress = await prisma.progress.findFirst({
          where: {
            userId: user.id,
            courseId: purchase.courseId
          },
          include: {
            video: true
          },
          orderBy: {
            lastWatched: 'desc'
          }
        })

        const enrichedCourse = enrichCourseWithStats(purchase.course)

        return {
          ...purchase,
          course: enrichedCourse,
          latestProgress
        }
      })
    )

    return NextResponse.json(coursesWithProgress)
  } catch (error) {
    return handleApiError(error, 'My courses fetch')
  }
}