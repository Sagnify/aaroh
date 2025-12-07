import { NextResponse } from 'next/server'
import { getAdmin2FASecret } from '@/lib/admin2fa'

export async function GET() {
  try {
    const admin = await getAdmin2FASecret()
    return NextResponse.json({
      twoFactorEnabled: admin?.twoFactorEnabled || false
    })
  } catch (error) {
    return NextResponse.json({ twoFactorEnabled: false })
  }
}
