import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Get course purchases
    const coursePurchases = await prisma.purchase.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        },
        course: {
          select: {
            id: true,
            title: true,
            level: true,
            price: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get shop orders
    const shopOrders = await prisma.shopOrder.findMany({
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Get custom song orders
    const customSongOrders = await prisma.customSongOrder.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Combine all purchases
    const allPurchases = [
      ...coursePurchases.map(purchase => ({
        ...purchase,
        type: 'course',
        title: purchase.course.title,
        customerName: purchase.user.name,
        customerEmail: purchase.user.email
      })),
      ...shopOrders.map(order => ({
        ...order,
        type: 'shop',
        title: `Shop Order #${order.id.slice(0, 8)}`,
        customerName: order.customerName,
        customerEmail: order.customerEmail
      })),
      ...customSongOrders.map(order => ({
        ...order,
        type: 'custom_song',
        title: `Custom Song - ${order.occasion}`,
        customerName: order.recipientName,
        customerEmail: order.userEmail
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    return NextResponse.json(allPurchases)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch purchases' }, { status: 500 })
  }
}