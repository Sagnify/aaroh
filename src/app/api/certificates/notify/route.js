import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { certificateId, courseName, userName } = await request.json()

    if (!certificateId || !courseName || !userName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Send certificate generated email
    const emailResult = await sendEmail({
      to: user.email,
      template: 'certificateGenerated',
      variables: {
        userName,
        courseName,
        certificateUrl: `${process.env.NEXTAUTH_URL}/certificates/${certificateId}`
      }
    })

    if (emailResult.success) {
      return NextResponse.json({ success: true, message: 'Certificate notification sent' })
    } else {
      return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
    }
  } catch (error) {
    console.error('Certificate notification error:', error)
    return NextResponse.json({ error: 'Failed to send notification' }, { status: 500 })
  }
}