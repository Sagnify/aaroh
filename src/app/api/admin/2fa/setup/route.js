import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import QRCode from 'qrcode'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const secret = speakeasy.generateSecret({
      name: `Aaroh Admin (${process.env.ADMIN_EMAIL})`,
      issuer: 'Aaroh'
    })

    const qrCode = await QRCode.toDataURL(secret.otpauth_url)

    return Response.json({
      secret: secret.base32,
      qrCode
    })
  } catch (error) {
    console.error('2FA setup error:', error)
    return Response.json({ error: 'Failed to setup 2FA' }, { status: 500 })
  }
}
