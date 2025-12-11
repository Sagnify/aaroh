import { NextResponse } from 'next/server'
import { sendEmail, getAdminEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const { name, email, phone, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Send contact form submission to admin
    const emailResult = await sendEmail({
      to: getAdminEmail(),
      template: 'contactFormSubmission',
      variables: {
        name: name,
        email: email,
        phone: phone || 'Not provided',
        message
      }
    })

    if (emailResult.success) {
      return NextResponse.json({ success: true, message: 'Message sent successfully' })
    } else {
      return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 })
  }
}