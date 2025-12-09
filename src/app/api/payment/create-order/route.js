import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { razorpay } from '@/lib/razorpay'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { courseId } = await request.json()

    if (!courseId) {
      return NextResponse.json({ error: 'Course ID is required' }, { status: 400 })
    }

    // Get user and course details
    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    const course = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    // Check if already purchased or has pending purchase
    const existingPurchase = await prisma.purchase.findFirst({
      where: {
        userId: user.id,
        courseId: courseId
      }
    })

    if (existingPurchase) {
      if (existingPurchase.status === 'completed') {
        return NextResponse.json({ error: 'Course already purchased' }, { status: 409 })
      }
      
      // If pending, return existing order details
      if (existingPurchase.status === 'pending' && existingPurchase.razorpayOrderId) {
        return NextResponse.json({
          orderId: existingPurchase.razorpayOrderId,
          amount: course.price * 100,
          currency: 'INR',
          purchaseId: existingPurchase.id,
          course: {
            id: course.id,
            title: course.title,
            price: course.price
          }
        })
      }
    }

    // Create Razorpay order
    const options = {
      amount: course.price * 100, // Amount in paise
      currency: 'INR',
      receipt: `c_${courseId.slice(-8)}_${Date.now().toString().slice(-8)}`,
      notes: {
        courseId: courseId,
        userId: user.id,
        courseName: course.title
      }
    }

    const razorpayOrder = await razorpay.orders.create(options)

    // Create or update pending purchase record
    const purchase = existingPurchase 
      ? await prisma.purchase.update({
          where: { id: existingPurchase.id },
          data: {
            razorpayOrderId: razorpayOrder.id,
            status: 'pending'
          }
        })
      : await prisma.purchase.create({
          data: {
            userId: user.id,
            courseId: courseId,
            amount: course.price,
            status: 'pending',
            razorpayOrderId: razorpayOrder.id
          }
        })

    return NextResponse.json({
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      purchaseId: purchase.id,
      course: {
        id: course.id,
        title: course.title,
        price: course.price
      }
    })

  } catch (error) {
    console.error('Create order error:', error)
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 })
  }
}