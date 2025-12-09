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
      return NextResponse.json({ success: true, orders: [] })
    }

    // Check if user is admin
    const isAdmin = user.role === 'ADMIN' || session.user.email === process.env.ADMIN_EMAIL
    
    const orders = await prisma.shopOrder.findMany({
      where: isAdmin ? {} : { userId: user.id }, // Admin sees all orders, users see only their orders
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 })
  }
}
