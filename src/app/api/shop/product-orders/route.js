import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    const body = await request.json()
    const { productId, configuration } = body

    // Validate required fields
    if (!productId || !configuration?.variant || !configuration?.recipientName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Create product configuration (allow guest configurations)
    const config = await prisma.productConfiguration.create({
      data: {
        productId,
        variant: configuration.variant,
        customText: configuration.customText || null,
        recipientName: configuration.recipientName,
        occasion: configuration.occasion || null,
        songType: configuration.songType || null,
        songData: configuration.songData ? configuration.songData : null
      }
    })

    return NextResponse.json({ 
      success: true, 
      orderId: config.id,
      message: 'Configuration created successfully'
    })
  } catch (error) {
    console.error('Error creating configuration:', error)
    return NextResponse.json({ error: 'Failed to create configuration' }, { status: 500 })
  }
}
