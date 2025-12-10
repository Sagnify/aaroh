import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { sendEmail, emailTemplates } from '@/lib/email'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token')
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token required' }, { status: 403 })
    }

    const { songId } = await request.json()
    
    // Validate songId to prevent injection
    if (!songId || typeof songId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(songId)) {
      return NextResponse.json({ error: 'Invalid song ID' }, { status: 400 })
    }

    if (!songId) {
      return NextResponse.json({ error: 'Song ID required' }, { status: 400 })
    }

    // Get the custom song
    const customSong = await prisma.customSongOrder.findUnique({
      where: { id: songId }
    })

    if (!customSong) {
      return NextResponse.json({ error: 'Custom song not found' }, { status: 404 })
    }

    if (!customSong.previewUrl) {
      return NextResponse.json({ error: 'Preview URL required before approval' }, { status: 400 })
    }

    // Update song to approved and ready status
    const updatedSong = await prisma.customSongOrder.update({
      where: { id: songId },
      data: {
        isApproved: true,
        status: 'ready',
        updatedAt: new Date()
      }
    })

    // Get user details for email
    const user = await prisma.user.findUnique({
      where: { email: customSong.userEmail }
    })

    if (user) {
      // Send approval email to user
      const baseUrl = request.headers.get('origin') || process.env.NEXTAUTH_URL
      
      await sendEmail({
        to: user.email,
        subject: `Your Custom Song is Ready! - ${customSong.occasion}`,
        html: `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; background: #ffffff;">
            <div style="background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); padding: 40px 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 600;">🎵 Your Song is Ready!</h1>
              <p style="color: rgba(255,255,255,0.9); margin: 8px 0 0 0; font-size: 16px;">Preview and complete your purchase</p>
            </div>
            
            <div style="padding: 40px 30px;">
              <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 24px; margin-bottom: 32px;">
                <h2 style="color: #1E293B; margin: 0 0 16px 0; font-size: 18px; font-weight: 600;">Song Details</h2>
                <table style="width: 100%; border-collapse: collapse;">
                  <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Occasion:</td><td style="padding: 6px 0; color: #1E293B;">${customSong.occasion}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">For:</td><td style="padding: 6px 0; color: #1E293B;">${customSong.recipientName}</td></tr>
                  <tr><td style="padding: 6px 0; color: #64748B; font-weight: 500;">Style:</td><td style="padding: 6px 0; color: #1E293B;">${customSong.style} • ${customSong.mood}</td></tr>
                </table>
              </div>
              
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${baseUrl}/shop/music-library" style="display: inline-block; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Listen & Purchase</a>
              </div>
              
              <div style="margin-top: 40px; padding-top: 24px; border-top: 1px solid #E2E8F0; text-align: center;">
                <p style="color: #64748B; margin: 0; font-size: 14px;">Your personalized song is ready for preview!</p>
                <p style="color: #64748B; margin: 8px 0 0 0; font-size: 14px; font-weight: 600;">Aaroh Music Academy</p>
              </div>
            </div>
          </div>
        `
      }).catch(err => console.error('Approval email failed:', err))
    }

    return NextResponse.json({ success: true, message: 'Song approved successfully' })
  } catch (error) {
    console.error('Song approval error:', error)
    return NextResponse.json({ error: 'Failed to approve song' }, { status: 500 })
  }
}