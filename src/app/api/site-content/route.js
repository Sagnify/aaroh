import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    if (key) {
      const content = await prisma.siteContent.findUnique({
        where: { key }
      })
      return NextResponse.json(content?.value || null)
    }

    const allContent = await prisma.siteContent.findMany()
    const contentMap = {}
    allContent.forEach(item => {
      contentMap[item.key] = item.value
    })
    
    return NextResponse.json(contentMap)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
  }
}

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

    const { key, value, type = 'text' } = await request.json()

    const content = await prisma.siteContent.upsert({
      where: { key },
      update: { value, type },
      create: { key, value, type }
    })

    return NextResponse.json(content)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save content' }, { status: 500 })
  }
}