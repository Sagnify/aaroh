import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    // Test database connection
    await prisma.$connect()
    
    // Check if EmailTemplate table exists by trying to count records
    const count = await prisma.emailTemplate.count()
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      emailTemplateCount: count
    })
  } catch (error) {
    console.error('Database test error:', error)
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      code: error.code 
    }, { status: 500 })
  } finally {
    await prisma.$disconnect()
  }
}