import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (user.role !== 'ADMIN' && session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = await params
    const body = await request.json()
    const { status, trackingId } = body

    const order = await prisma.shopOrder.findUnique({
      where: { id },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    const updateData = {}
    if (status) updateData.status = status
    if (trackingId !== undefined) updateData.trackingId = trackingId

    const updatedOrder = await prisma.shopOrder.update({
      where: { id },
      data: updateData
    })

    // Send email notification for status changes
    if (status && ['confirmed', 'shipped', 'delivered', 'cancelled'].includes(status)) {
      const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
      const trackingUrl = `${baseUrl}/shop/orders/${order.id}`
      
      const emailPromise = sendEmail({
        to: order.user.email,
        ...emailTemplates(baseUrl).orderStatusUpdate(
          order.user.name || 'Customer',
          order.id,
          status,
          trackingUrl
        )
      }).catch(err => console.error('Order status email failed:', err))

      if (request.waitUntil) {
        request.waitUntil(emailPromise)
      }
    }

    return NextResponse.json({ success: true, order: updatedOrder })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}
