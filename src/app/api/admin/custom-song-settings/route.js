import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const settings = await prisma.customSongSettings.findFirst()
    
    return NextResponse.json({
      success: true,
      settings: settings || { standardPrice: 2999, expressPrice: 4499 }
    })
  } catch (error) {
    console.error('Fetch settings error:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch settings' 
    }, { status: 500 })
  }
}

export async function PUT(request) {
  try {
    // Validate CSRF token
    const csrfToken = request.headers.get('X-CSRF-Token')
    if (!csrfToken) {
      return NextResponse.json({ error: 'CSRF token required' }, { status: 403 })
    }

    const { standardPrice, expressPrice } = await request.json()

    const settings = await prisma.customSongSettings.upsert({
      where: { id: 1 },
      update: { standardPrice, expressPrice },
      create: { id: 1, standardPrice, expressPrice }
    })

    return NextResponse.json({
      success: true,
      settings
    })
  } catch (error) {
    console.error('Update settings error:', error)
    return NextResponse.json({ 
      error: 'Failed to update settings' 
    }, { status: 500 })
  }
}