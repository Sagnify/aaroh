import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Please login to continue' }, { status: 401 })
    }

    const body = await request.json()
    const { productId, configuration } = body

    // Create product configuration
    const config = await prisma.productConfiguration.create({
      data: {
        productId,
        variant: configuration.variant,
        customText: configuration.customText,
        recipientName: configuration.recipientName,
        occasion: configuration.occasion
      }
    })

    return NextResponse.json({ 
      success: true, 
      orderId: config.id,
      message: 'Order created successfully'
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}
