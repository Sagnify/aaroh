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

    const progress = await prisma.progress.findFirst({
      where: {
        userId: user.id,
        courseId: courseId
      }
    })

    return NextResponse.json(progress ? [progress] : [])
  } catch (error) {
    return handleApiError(error, 'Progress fetch')
  }
}

export async function POST(request) {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const body = await request.json()
    const validationError = validateRequiredFields(body, ['courseId', 'videoId', 'timestamp'])
    if (validationError) return validationError

    const { courseId, videoId, timestamp, completed } = body

    // Find existing progress
    const existingProgress = await prisma.progress.findFirst({
      where: {
        userId: user.id,
        courseId: courseId
      }
    })

    let progress
    if (existingProgress) {
      progress = await prisma.progress.update({
        where: { id: existingProgress.id },
        data: {
          videoId: videoId,
          timestamp: Math.floor(timestamp),
          completed: completed || false,
          lastWatched: new Date()
        }
      })
    } else {
      progress = await prisma.progress.create({
        data: {
          userId: user.id,
          courseId: courseId,
          videoId: videoId,
          timestamp: Math.floor(timestamp),
          completed: completed || false
        }
      })
    }

    return successResponse(progress, 'Progress saved')
  } catch (error) {
    return handleApiError(error, 'Progress save')
  }
}