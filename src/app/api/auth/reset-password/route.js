import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { email }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save reset token to user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        resetToken,
        resetTokenExpiry
      }
    })

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${resetToken}`

    // Send password reset email
    const emailResult = await sendEmail({
      to: user.email,
      template: 'passwordReset',
      variables: {
        userName: user.name || 'User',
        resetUrl,
        siteName: 'Aaroh Music Academy'
      }
    })

    if (emailResult.success) {
      return NextResponse.json({ success: true, message: 'Password reset email sent' })
    } else {
      return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 })
    }
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 })
  }
}