import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrichCourseWithStats } from '@/lib/course-utils'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser()
    if (error) return error

    // Admin users don't have purchases
    if (user.id === 'admin') {
      return NextResponse.json([])
    }

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
          orderBy: {
            updatedAt: 'desc'
          }
        })

        // Check if course is completed
        const totalVideos = purchase.course.curriculum.reduce((acc, section) => acc + section.videos.length, 0)
        const completedVideos = await prisma.progress.count({
          where: {
            userId: user.id,
            courseId: purchase.courseId,
            completed: true
          }
        })
        const isCompleted = totalVideos > 0 && completedVideos === totalVideos

        const enrichedCourse = enrichCourseWithStats(purchase.course)

        return {
          ...purchase,
          course: enrichedCourse,
          latestProgress,
          isCompleted
        }
      })
    )

    return NextResponse.json(coursesWithProgress)
  } catch (error) {
    return handleApiError(error, 'My courses fetch')
  }
}