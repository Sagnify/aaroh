import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { handleApiError, getAuthenticatedUser } from '@/lib/api-utils'

export async function GET() {
  try {
    let settings = await prisma.certificateSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await prisma.certificateSettings.create({
        data: {}
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    return handleApiError(error, 'Certificate settings fetch')
  }
}

export async function PUT(request) {
  try {
    const { user, error } = await getAuthenticatedUser('ADMIN')
    if (error) return error

    // Validate CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token')
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token required' }, { status: 403 })
    }

    const data = await request.json()
    
    let settings = await prisma.certificateSettings.findFirst()
    
    if (settings) {
      settings = await prisma.certificateSettings.update({
        where: { id: settings.id },
        data
      })
    } else {
      settings = await prisma.certificateSettings.create({
        data
      })
    }
    
    return NextResponse.json(settings)
  } catch (error) {
    return handleApiError(error, 'Certificate settings update')
  }
}