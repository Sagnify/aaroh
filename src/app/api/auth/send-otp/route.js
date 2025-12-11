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

    // Send OTP using template
    await sendEmail({
      to: email,
      template: 'otpVerification',
      variables: {
        otp: otp,
        siteName: 'Aaroh Music Academy'
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Send OTP error:', error)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}

export { otpStore }
