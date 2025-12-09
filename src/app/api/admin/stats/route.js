import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalCourses, totalUsers, totalPurchases, courseRevenue, shopOrders, shopRevenue, customSongOrders, customSongRevenue] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.purchase.count(),
      prisma.purchase.aggregate({
        _sum: {
          amount: true
        }
      }),
      prisma.shopOrder.count(),
      prisma.shopOrder.aggregate({
        where: {
          OR: [
            { paymentStatus: 'paid' },
            { paymentStatus: 'cod' }
          ]
        },
        _sum: {
          amount: true
        }
      }),
      prisma.customSongOrder.count(),
      prisma.customSongOrder.aggregate({
        where: {
          status: 'completed'
        },
        _sum: {
          amount: true
        }
      })
    ])

    return NextResponse.json({
      totalCourses,
      totalUsers,
      totalPurchases: totalPurchases + shopOrders + customSongOrders,
      totalRevenue: (courseRevenue._sum.amount || 0) + (shopRevenue._sum.amount || 0) + (customSongRevenue._sum.amount || 0)
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}