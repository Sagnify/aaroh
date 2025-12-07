import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { email, password, token } = await request.json()

    if (email !== process.env.ADMIN_EMAIL) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
    }

    const { getAdmin2FASecret } = await import('@/lib/admin2fa')
    const admin = await getAdmin2FASecret()

    if (admin?.twoFactorEnabled && admin?.twoFactorSecret) {
      if (!token) {
        return NextResponse.json({ success: false, error: '2FA token required' }, { status: 401 })
      }
      const speakeasy = (await import('speakeasy')).default
      const verified = speakeasy.totp.verify({
        secret: admin.twoFactorSecret,
        encoding: 'base32',
        token: token,
        window: 2
      })
      if (!verified) {
        return NextResponse.json({ success: false, error: 'Invalid 2FA token' }, { status: 401 })
      }
    } else {
      if (password !== process.env.ADMIN_PASSWORD) {
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: 'admin',
        email: process.env.ADMIN_EMAIL,
        name: 'Admin',
        role: 'ADMIN'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 })
  }
}
