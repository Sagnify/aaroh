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
          select: {
            id: true,
            title: true,
            subtitle: true,
            description: true,
            duration: true,
            lessons: true,
            level: true,
            thumbnail: true,
            instructor: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(purchases)
  } catch (error) {
    return handleApiError(error, 'User purchases fetch')
  }
}