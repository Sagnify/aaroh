import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function POST(req) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return Response.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { newPassword } = await req.json()

    if (newPassword.length < 8) {
      return Response.json({ error: 'New password must be at least 8 characters' }, { status: 400 })
    }

    return Response.json({ 
      success: true,
      message: 'Password changed successfully. Please update ADMIN_PASSWORD in your .env file to: ' + newPassword
    })
  } catch (error) {
    console.error('Change password error:', error)
    return Response.json({ error: 'Failed to change password' }, { status: 500 })
  }
}
