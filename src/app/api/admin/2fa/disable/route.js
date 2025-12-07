import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { disableAdmin2FA } from '@/lib/admin2fa'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await disableAdmin2FA()

    return Response.json({ success: true })
  } catch (error) {
    console.error('2FA disable error:', error)
    return Response.json({ error: 'Failed to disable 2FA' }, { status: 500 })
  }
}
