import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const body = await request.json()
    const { items, totalAmount, shippingAddress } = body

    const order = await prisma.shopOrder.create({
      data: {
        userId: user.id,
        items,
        totalAmount,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'pending'
      }
    })

    // Clear cart after order creation
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          userId: user.id
        }
      }
    })

    return NextResponse.json({ success: true, orderId: order.id })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
