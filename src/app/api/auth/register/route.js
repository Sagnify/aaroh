import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST(request) {
  try {
    const { name, email, phone, password } = await request.json()

    if (!name || !email || !phone || !password) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
    }

    // Sanitize and validate inputs
    const sanitizedName = name.trim()
    const sanitizedEmail = email.trim().toLowerCase()
    const sanitizedPhone = phone.replace(/\D/g, '')

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json({ error: 'Invalid email format' }, { status: 400 })
    }

    // Validate phone number (Indian format)
    if (!/^[6-9]\d{9}$/.test(sanitizedPhone)) {
      return NextResponse.json({ error: 'Invalid phone number format' }, { status: 400 })
    }

    // Validate password strength
    if (password.length < 8 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      return NextResponse.json({ error: 'Password must be at least 8 characters with uppercase, lowercase, and number' }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: sanitizedEmail }
    })

    if (existingUser) {
      return NextResponse.json({ error: 'User already exists' }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
        phone: sanitizedPhone,
        password: hashedPassword,
        role: 'USER'
      }
    })

    // Send welcome email asynchronously (non-blocking)
    const emailPromise = sendEmail({
      to: user.email,
      template: 'welcome',
      variables: {
        siteName: 'Aaroh Music Academy',
        userName: user.name,
        baseUrl: process.env.NEXTAUTH_URL
      }
    }).catch(err => console.error('Welcome email failed:', err))

    // For Vercel serverless - ensure email completes
    if (request.waitUntil) {
      request.waitUntil(emailPromise)
    }

    return NextResponse.json({ 
      message: 'User created successfully',
      user: { id: user.id, name: user.name, email: user.email }
    })
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}