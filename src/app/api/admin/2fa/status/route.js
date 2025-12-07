import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAdmin2FASecret } from '@/lib/admin2fa'

export async function GET(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await getAdmin2FASecret()

    return Response.json({ 
      enabled: admin?.twoFactorEnabled || false
    })
  } catch (error) {
    console.error('2FA status error:', error)
    return Response.json({ error: 'Failed to get status' }, { status: 500 })
  }
}
