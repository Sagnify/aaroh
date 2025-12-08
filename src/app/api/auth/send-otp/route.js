import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'

const otpStore = new Map()

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    
    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000
    })

    const baseUrl = request.headers.get('origin') || `${request.headers.get('x-forwarded-proto') || 'https'}://${request.headers.get('host')}`

    await sendEmail({
      to: email,
      subject: 'Email Verification - Aaroh Music Academy',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #a0303f;">Verify Your Email</h1>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; text-align: center; margin: 20px 0;">
            <h2 style="color: #a0303f; font-size: 32px; letter-spacing: 8px; margin: 0;">${otp}</h2>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <p>Best regards,<br>Aaroh Music Academy Team</p>
        </div>
      `,
      text: `Your verification code is: ${otp}. This code will expire in 10 minutes.`
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}

export { otpStore }
