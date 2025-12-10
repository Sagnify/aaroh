import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 20

    const now = new Date()
    let startDate = new Date()
    let whereClause = {}

    // Only apply date filter if period is not 'all'
    if (period !== 'all') {
      switch (period) {
        case 'week':
          startDate.setDate(now.getDate() - 7)
          break
        case 'month':
          startDate.setMonth(now.getMonth() - 1)
          break
        case '6months':
          startDate.setMonth(now.getMonth() - 6)
          break
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1)
          break
        default:
          startDate.setMonth(now.getMonth() - 1)
      }
      
      whereClause = {
        createdAt: {
          gte: startDate,
          lte: now
        }
      }
    }

    // Get shop orders
    const shopOrders = await prisma.shopOrder.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get course purchases (all statuses)
    const coursePurchases = await prisma.purchase.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        },
        course: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get custom song orders (all statuses)
    const customSongOrders = await prisma.customSongOrder.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Combine and format transactions
    const allTransactions = [
      ...shopOrders.map(order => ({
        ...order,
        type: 'shop',
        customerName: order.customerName,
        customerEmail: order.customerEmail,
        customerPhone: order.customerPhone,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus
      })),
      ...coursePurchases.map(purchase => ({
        ...purchase,
        type: 'course',
        customerName: purchase.user.name,
        customerEmail: purchase.user.email,
        customerPhone: null,
        paymentMethod: 'online',
        paymentStatus: purchase.status === 'completed' ? 'paid' : purchase.status,
        amount: purchase.amount,
        items: [{
          productName: purchase.course.title,
          price: purchase.amount
        }]
      })),
      ...customSongOrders.map(order => ({
        ...order,
        type: 'custom_song',
        customerName: order.recipientName,
        customerEmail: order.userEmail,
        customerPhone: null,
        paymentMethod: 'online',
        paymentStatus: order.status === 'completed' ? 'paid' : order.status,
        amount: order.amount,
        items: [{
          productName: `Custom Song - ${order.occasion}`,
          price: order.amount,
          recipientName: order.recipientName
        }]
      }))
    ].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // Apply pagination
    const transactions = allTransactions.slice((page - 1) * limit, page * limit)

    // Get shop order statistics
    const shopStats = await prisma.shopOrder.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const shopSuccessful = await prisma.shopOrder.aggregate({
      where: {
        ...whereClause,
        paymentStatus: 'paid'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const shopFailed = await prisma.shopOrder.aggregate({
      where: {
        ...whereClause,
        paymentStatus: 'failed'
      },
      _count: {
        id: true
      }
    })

    const shopPending = await prisma.shopOrder.aggregate({
      where: {
        ...whereClause,
        paymentStatus: 'pending'
      },
      _count: {
        id: true
      }
    })

    const codTransactions = await prisma.shopOrder.aggregate({
      where: {
        ...whereClause,
        paymentStatus: 'cod'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Get completed course and custom song counts for successful transactions
    const completedCourses = await prisma.purchase.aggregate({
      where: {
        ...whereClause,
        status: 'completed'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const completedCustomSongs = await prisma.customSongOrder.aggregate({
      where: {
        ...whereClause,
        status: 'completed'
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Get failed and pending counts for courses and custom songs
    const failedCourses = await prisma.purchase.count({
      where: {
        ...whereClause,
        status: 'failed'
      }
    })

    const pendingCourses = await prisma.purchase.count({
      where: {
        ...whereClause,
        status: 'pending'
      }
    })

    const failedCustomSongs = await prisma.customSongOrder.count({
      where: {
        ...whereClause,
        status: 'failed'
      }
    })

    const pendingCustomSongs = await prisma.customSongOrder.count({
      where: {
        ...whereClause,
        OR: [
          { status: 'pending' },
          { status: 'awaiting_payment' },
          { status: 'in_progress' }
        ]
      }
    })

    const readyCustomSongs = await prisma.customSongOrder.count({
      where: {
        ...whereClause,
        status: 'ready'
      }
    })

    // Get course purchase statistics
    const courseStats = await prisma.purchase.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Get custom song statistics
    const customSongStats = await prisma.customSongOrder.aggregate({
      where: whereClause,
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const totalCount = allTransactions.length

    return NextResponse.json({
      success: true,
      transactions,
      stats: {
        totalTransactions: (shopStats._count.id || 0) + (courseStats._count.id || 0) + (customSongStats._count.id || 0),
        totalAmount: (shopStats._sum.amount || 0) + (courseStats._sum.amount || 0) + (customSongStats._sum.amount || 0),
        successfulTransactions: (shopSuccessful._count.id || 0) + (completedCourses._count.id || 0) + (completedCustomSongs._count.id || 0),
        successfulAmount: (shopSuccessful._sum.amount || 0) + (completedCourses._sum.amount || 0) + (completedCustomSongs._sum.amount || 0),
        failedTransactions: (shopFailed._count.id || 0) + failedCourses + failedCustomSongs,
        pendingTransactions: (shopPending._count.id || 0) + pendingCourses + pendingCustomSongs,
        readyTransactions: readyCustomSongs,
        codTransactions: codTransactions._count.id || 0,
        codAmount: (codTransactions._sum.amount || 0),
        totalReceived: (shopSuccessful._sum.amount || 0) + (codTransactions._sum.amount || 0) + (completedCourses._sum.amount || 0) + (completedCustomSongs._sum.amount || 0),
        totalPendingAndReady: (shopPending._count.id || 0) + pendingCourses + pendingCustomSongs + readyCustomSongs
      },
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        totalCount,
        hasMore: page * limit < totalCount
      }
    })
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 })
  }
}