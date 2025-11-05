import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function PATCH(request, { params }) {
  try {
    const { user, error } = await getAuthenticatedUser('ADMIN')
    if (error) return error

    const { status } = await request.json()
    const purchaseId = params.id

    // Validate status
    const validStatuses = ['pending', 'completed', 'failed', 'refunded']
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
    }

    const purchase = await prisma.purchase.update({
      where: { id: purchaseId },
      data: { status },
      include: {
        user: true,
        course: true
      }
    })

    return NextResponse.json(purchase)
  } catch (error) {
    return handleApiError(error, 'Purchase status update')
  }
}