import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function GET() {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const purchases = await prisma.purchase.findMany({
      where: { 
        userId: user.id,
        status: 'completed'
      },
      include: {
        course: true
      },
      orderBy: { createdAt: 'desc' }
    })

    const purchasesWithCompletion = await Promise.all(
      purchases.map(async (purchase) => {
        try {
          const courseWithCurriculum = await prisma.course.findUnique({
            where: { id: purchase.courseId },
            include: {
              curriculum: {
                include: {
                  videos: true
                }
              }
            }
          })

          const totalVideos = courseWithCurriculum?.curriculum?.reduce((acc, section) => acc + section.videos.length, 0) || 0
          const completedCount = await prisma.progress.count({
            where: {
              userId: user.id,
              courseId: purchase.courseId,
              completed: true
            }
          })
          const isCompleted = totalVideos > 0 && completedCount === totalVideos
          
          return {
            ...purchase,
            isCompleted,
            totalVideos,
            completedVideos: completedCount
          }
        } catch (err) {
          console.error(`Error processing purchase ${purchase.id}:`, err.message)
          return {
            ...purchase,
            isCompleted: false,
            totalVideos: 0,
            completedVideos: 0
          }
        }
      })
    )

    return NextResponse.json(purchasesWithCompletion)
  } catch (error) {
    return handleApiError(error, 'User purchases fetch')
  }
}