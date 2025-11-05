import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const [totalCourses, totalUsers, totalPurchases, revenueData] = await Promise.all([
      prisma.course.count(),
      prisma.user.count(),
      prisma.purchase.count(),
      prisma.purchase.aggregate({
        _sum: {
          amount: true
        }
      })
    ])

    return NextResponse.json({
      totalCourses,
      totalUsers,
      totalPurchases,
      totalRevenue: revenueData._sum.amount || 0
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}