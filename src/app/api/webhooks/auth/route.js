import { NextResponse } from 'next/server'

export const runtime = 'edge'

// Auth event webhook for security monitoring
export async function POST(request) {
  try {
    const { event, userId, email, role, timestamp } = await request.json()
    
    console.log(`[AUTH EVENT] ${event} - User: ${email} (${role}) - ID: ${userId} - Time: ${new Date(timestamp).toISOString()}`)
    
    // Log to external monitoring service if needed
    // await fetch('https://your-monitoring-service.com/log', { ... })
    
    return NextResponse.json({ status: 'logged', event, timestamp })
  } catch (error) {
    console.error('Auth webhook error:', error)
    return NextResponse.json({ error: 'Failed to log event' }, { status: 500 })
  }
}
