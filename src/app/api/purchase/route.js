import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser, validateRequiredFields, successResponse } from '@/lib/api-utils'

export async function POST(request) {
  try {
    const { user, error } = await getAuthenticatedUser('USER')
    if (error) return error

    const body = await request.json()
    const validationError = validateRequiredFields(body, ['courseId'])
    if (validationError) return validationError

    const { courseId } = body

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if already purchased
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        status: 'completed'
      }
    })

    if (existingPurchase) {
      return NextResponse.json({ error: 'Course already purchased' }, { status: 409 })
    }

    // Redirect to payment gateway instead of direct purchase
    return NextResponse.json({ 
      message: 'Use payment gateway for purchase',
      redirectTo: `/checkout/${courseId}`
    }, { status: 400 })
  } catch (error) {
    return handleApiError(error, 'Purchase')
  }
}