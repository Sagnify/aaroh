import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || session.user.email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token')
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token required' }, { status: 403 })
    }

    const { id } = await params
    
    // Validate song ID to prevent injection
    if (!id || typeof id !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(id)) {
      return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 })
    }
    
    const { paymentStatus } = await request.json()

    if (!paymentStatus || !['paid', 'unpaid'].includes(paymentStatus)) {
      return NextResponse.json({ error: 'Invalid payment status' }, { status: 400 })
    }

    // Get current order
    const currentOrder = await prisma.customSongOrder.findUnique({ 
      where: { id } 
    })

    if (!currentOrder) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    let updateData = {}

    if (paymentStatus === 'paid') {
      // Mark as completed/paid
      updateData = {
        status: 'completed',
        updatedAt: new Date()
      }
    } else if (paymentStatus === 'unpaid') {
      // Reset to ready status - admin reset only increments adminResetCount
      updateData = {
        status: 'ready',
        adminResetCount: { increment: 1 },
        // Clear current payment data for new payment
        razorpayOrderId: null,
        razorpayPaymentId: null,
        updatedAt: new Date()
      }
    }

    const updatedOrder = await prisma.customSongOrder.update({
      where: { id },
      data: updateData
    })

    console.log(`✅ Admin updated payment status: ${paymentStatus} | Order: ${id}`)

    return NextResponse.json({ 
      success: true, 
      order: updatedOrder,
      message: `Payment status updated to ${paymentStatus}`
    })

  } catch (error) {
    console.error('❌ Admin payment status update failed:', error)
    return NextResponse.json({ 
      error: 'Failed to update payment status' 
    }, { status: 500 })
  }
}