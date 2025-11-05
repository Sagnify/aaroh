import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        title: true,
        published: true
      }
    })
    
    return NextResponse.json({ 
      message: 'Database connection successful',
      courseCount: courses.length,
      courses: courses
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Database connection failed',
      details: error.message 
    }, { status: 500 })
  }
}