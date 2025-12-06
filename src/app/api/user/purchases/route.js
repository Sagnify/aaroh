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
      orderBy: { createdAt: 'desc' }
    })

    const purchasesWithCompletion = await Promise.all(
      purchases.map(async (purchase) => {
        try {
          let curriculum = purchase.course.curriculum || []
          // Parse curriculum if it's a JSON string
          if (typeof curriculum === 'string') {
            try {
              curriculum = JSON.parse(curriculum)
            } catch (e) {
              console.error('Failed to parse curriculum:', e)
              curriculum = []
            }
          }
          console.log(`Course ${purchase.course.title} curriculum:`, curriculum.length, 'sections')
          const totalVideos = curriculum.reduce((acc, section) => {
            const videoCount = section.videos?.length || 0
            console.log(`  Section ${section.title}: ${videoCount} videos`)
            return acc + videoCount
          }, 0)
          const completedCount = await prisma.progress.count({
            where: {
              userId: user.id,
              courseId: purchase.courseId,
              completed: true
            }
          })
          const isCompleted = totalVideos > 0 && completedCount === totalVideos
          console.log(`Course ${purchase.course.title}: ${completedCount}/${totalVideos} videos completed, isCompleted: ${isCompleted}`)
          return {
            ...purchase,
            isCompleted
          }
        } catch (err) {
          console.error(`Error processing purchase ${purchase.id}:`, err.message, err.stack)
          return {
            ...purchase,
            isCompleted: false
          }
        }
      })
    )

    return NextResponse.json(purchasesWithCompletion)
  } catch (error) {
    return handleApiError(error, 'User purchases fetch')
  }
}