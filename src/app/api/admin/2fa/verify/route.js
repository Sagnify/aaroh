import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import speakeasy from 'speakeasy'
import { setAdmin2FASecret } from '@/lib/admin2fa'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { token, secret } = await req.json()

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    })

    if (verified) {
      await setAdmin2FASecret(secret)
      return Response.json({ success: true })
    }

    return Response.json({ error: 'Invalid token' }, { status: 400 })
  } catch (error) {
    console.error('2FA verify error:', error)
    return Response.json({ error: 'Verification failed' }, { status: 500 })
  }
}
