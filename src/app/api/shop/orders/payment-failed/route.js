import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { orderId, error_description, error_code } = body

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const order = await prisma.shopOrder.findFirst({
      where: {
        id: orderId,
        userId: user.id
      }
    })

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 })
    }

    await prisma.shopOrder.update({
      where: { id: orderId },
      data: {
        status: 'cancelled',
        paymentStatus: 'failed'
      }
    })

    await sendPaymentFailureEmails(order, user, error_description, error_code)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error handling payment failure:', error)
    return NextResponse.json({ error: 'Failed to process payment failure' }, { status: 500 })
  }
}

async function sendPaymentFailureEmails(order, user, errorDescription, errorCode) {
  const { getAdminEmail } = await import('@/lib/email')
  
  try {
    await sendEmail({
      to: user.email,
      template: 'paymentFailed',
      variables: {
        userName: order.customerName || user.name || 'Customer',
        courseName: 'Shop Order',
        retryUrl: `${process.env.NEXTAUTH_URL}/shop/cart`
      }
    })
    
    await sendEmail({
      to: getAdminEmail(),
      template: 'adminShopOrderNotification',
      variables: {
        customerName: order.customerName,
        orderId: order.id,
        paymentId: 'FAILED',
        amount: order.amount,
        adminUrl: `${process.env.NEXTAUTH_URL}/admin/shop-orders`
      }
    })
  } catch (emailError) {
    console.error('Error sending payment failure emails:', emailError)
  }
}