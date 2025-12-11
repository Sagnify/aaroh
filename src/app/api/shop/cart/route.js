import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const cart = await prisma.cart.findUnique({
      where: { userId: user.id },
      include: {
        items: {
          include: {
            configuration: {
              include: {
                product: {
                  include: {
                    variants: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json({ success: true, cart })
  } catch (error) {
    console.error('Error fetching cart:', error)
    
    // Handle connection pool timeout specifically
    if (error.code === 'P2024') {
      return NextResponse.json({ 
        error: 'Database connection timeout. Please try again.', 
        retry: true 
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Please login to add to cart' }, { status: 401 })
    }

    let user
    try {
      user = await prisma.user.findUnique({
        where: { email: session.user.email }
      })
    } catch (dbError) {
      console.error('Database error finding user:', dbError)
      if (dbError.code === 'P2024') {
        return NextResponse.json({ 
          error: 'Database connection timeout. Please try again.', 
          retry: true 
        }, { status: 503 })
      }
      throw dbError
    }

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    const { configId, guestCartItems } = await request.json()

    let cart = await prisma.cart.findUnique({
      where: { userId: user.id }
    })

    if (!cart) {
      cart = await prisma.cart.create({
        data: { userId: user.id }
      })
    }

    // Merge guest cart items if provided
    if (guestCartItems && Array.isArray(guestCartItems) && guestCartItems.length > 0) {
      for (const guestItem of guestCartItems) {
        const existingItem = await prisma.cartItem.findFirst({
          where: {
            cartId: cart.id,
            configId: guestItem.configId
          }
        })
        
        if (!existingItem) {
          await prisma.cartItem.create({
            data: {
              cartId: cart.id,
              configId: guestItem.configId,
              quantity: guestItem.quantity || 1
            }
          })
        }
      }
      return NextResponse.json({ success: true, merged: true })
    }

    // Add single item
    if (configId) {
      const cartItem = await prisma.cartItem.create({
        data: {
          cartId: cart.id,
          configId,
          quantity: 1
        }
      })
      return NextResponse.json({ success: true, cartItem })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding to cart:', error)
    
    // Handle connection pool timeout specifically
    if (error.code === 'P2024') {
      return NextResponse.json({ 
        error: 'Database connection timeout. Please try again.', 
        retry: true 
      }, { status: 503 })
    }
    
    return NextResponse.json({ error: 'Failed to add to cart' }, { status: 500 })
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const itemId = searchParams.get('itemId')

    await prisma.cartItem.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error removing from cart:', error)
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 })
  }
}
