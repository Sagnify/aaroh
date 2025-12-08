import { NextResponse } from 'next/server'
import { otpStore } from '../send-otp/route'

export async function POST(request) {
  try {
    const { email, otp } = await request.json()

    if (!email || !otp) {
      return NextResponse.json({ error: 'Email and OTP are required' }, { status: 400 })
    }

    const stored = otpStore.get(email)

    if (!stored) {
      return NextResponse.json({ error: 'OTP not found or expired' }, { status: 400 })
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(email)
      return NextResponse.json({ error: 'OTP expired' }, { status: 400 })
    }

    if (stored.otp !== otp) {
      return NextResponse.json({ error: 'Invalid OTP' }, { status: 400 })
    }

    otpStore.delete(email)
    return NextResponse.json({ success: true, verified: true })
  } catch (error) {
    console.error('Verify OTP error:', error)
    return NextResponse.json({ error: 'Failed to verify OTP' }, { status: 500 })
  }
}
