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
    const period = searchParams.get('period') || '24h'

    // Calculate date range
    const now = new Date()
    let startDate = new Date()
    
    switch (period) {
      case '1h':
        startDate.setHours(now.getHours() - 1)
        break
      case '24h':
        startDate.setDate(now.getDate() - 1)
        break
      case '7d':
        startDate.setDate(now.getDate() - 7)
        break
      case '30d':
        startDate.setDate(now.getDate() - 30)
        break
      default:
        startDate.setDate(now.getDate() - 1)
    }

    // Get payment data - include both created and updated transactions
    const [customSongs, purchases, shopOrders] = await Promise.all([
      prisma.customSongOrder.findMany({
        where: {
          OR: [
            { createdAt: { gte: startDate } },
            { updatedAt: { gte: startDate } }
          ]
        },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.purchase.findMany({
        where: {
          OR: [
            { createdAt: { gte: startDate } },
            { updatedAt: { gte: startDate } }
          ]
        },
        include: { user: { select: { name: true, email: true } }, course: { select: { title: true } } },
        orderBy: { updatedAt: 'desc' }
      }),
      prisma.shopOrder.findMany({
        where: {
          OR: [
            { createdAt: { gte: startDate } },
            { updatedAt: { gte: startDate } }
          ]
        },
        include: { user: { select: { name: true, email: true } } },
        orderBy: { updatedAt: 'desc' }
      })
    ])

    // Calculate stats
    const stats = {
      totalRevenue: [
        ...customSongs.filter(s => s.status === 'completed').map(s => s.amount || 0),
        ...purchases.filter(p => p.status === 'completed').map(p => p.amount || 0),
        ...shopOrders.filter(o => o.paymentStatus === 'paid').map(o => o.amount || 0)
      ].reduce((sum, amount) => sum + amount, 0),

      completedCount: customSongs.filter(s => s.status === 'completed').length +
                     purchases.filter(p => p.status === 'completed').length +
                     shopOrders.filter(o => o.paymentStatus === 'paid').length,

      failedCount: customSongs.filter(s => s.status === 'failed').length +
                   purchases.filter(p => p.status === 'failed').length +
                   shopOrders.filter(o => o.paymentStatus === 'failed').length,

      pendingCount: customSongs.filter(s => s.status === 'ready').length +
                    purchases.filter(p => p.status === 'pending').length +
                    shopOrders.filter(o => o.paymentStatus === 'pending').length
    }

    // Format transactions
    const allTransactions = [
      ...customSongs.map(item => ({
        id: item.id,
        type: 'custom_song',
        status: item.status,
        amount: item.amount || 0,
        customerName: item.user?.name || 'Unknown',
        customerEmail: item.user?.email || item.userEmail,
        razorpayOrderId: item.razorpayOrderId,
        razorpayPaymentId: item.razorpayPaymentId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        details: { occasion: item.occasion, recipientName: item.recipientName }
      })),
      ...purchases.map(item => ({
        id: item.id,
        type: 'course',
        status: item.status,
        amount: item.amount || 0,
        customerName: item.user?.name || 'Unknown',
        customerEmail: item.user?.email,
        razorpayOrderId: item.razorpayOrderId,
        razorpayPaymentId: item.razorpayPaymentId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        details: { courseName: item.course?.title }
      })),
      ...shopOrders.map(item => ({
        id: item.id,
        type: 'shop',
        status: item.paymentStatus,
        amount: item.amount || 0,
        customerName: item.user?.name || item.customerName,
        customerEmail: item.user?.email || item.customerEmail,
        razorpayOrderId: item.razorpayOrderId,
        razorpayPaymentId: item.razorpayPaymentId,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
        details: { orderStatus: item.status }
      }))
    ].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))

    return NextResponse.json({
      success: true,
      stats,
      transactions: allTransactions,
      failedPayments: allTransactions.filter(t => t.status === 'failed'),
      pendingPayments: allTransactions.filter(t => t.status === 'pending' || t.status === 'ready')
    })

  } catch (error) {
    console.error('Payment monitoring error:', error)
    return NextResponse.json({ error: 'Failed to fetch payment data' }, { status: 500 })
  }
}