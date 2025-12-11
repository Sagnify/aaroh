import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params

    const order = await prisma.shopOrder.findUnique({
      where: {
        id: orderId
      },
      include: {
        user: true
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    return NextResponse.json({ 
      success: true, 
      order 
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { orderId } = await params
    const body = await request.json()
    const { trackingId, status } = body

    const updateData = {}
    if (trackingId) updateData.trackingId = trackingId
    if (status) updateData.status = status

    const order = await prisma.shopOrder.update({
      where: { id: orderId },
      data: updateData,
      include: { user: true }
    })

    // Send email notification for order status updates
    if (status) {
      try {
        const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000'
        // Templates now handled by database
        
        let trackingUrl = null
        if (trackingId) {
          trackingUrl = `https://www.google.com/search?q=${trackingId}+tracking`
        }
        
        await sendEmail({
          to: order.customerEmail,
          template: 'orderStatusUpdate',
          variables: {
            customerName: order.customerName,
            orderId: order.id,
            orderStatus: status,
            amount: order.amount,
            orderUrl: trackingUrl || `${process.env.NEXTAUTH_URL}/shop/orders/${order.id}`
          }
        })
        
        console.log(`✅ Order status email sent to ${order.customerEmail} for order ${order.id.slice(0, 8)}`)
        
      } catch (emailError) {
        console.error('❌ Error sending order status email:', emailError)
        // Don't fail the order update if email fails
      }
    }

    return NextResponse.json({ 
      success: true, 
      order,
      message: trackingId ? 'Order shipped and customer notified via email' : 'Order updated successfully'
    })
  } catch (error) {
    console.error('Error updating order:', error)
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 })
  }
}