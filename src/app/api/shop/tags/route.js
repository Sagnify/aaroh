import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const tags = await prisma.productTag.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } }
    })
    return NextResponse.json({ success: true, tags })
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const { name, color } = await request.json()
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    
    const tag = await prisma.productTag.create({
      data: { name, slug, color: color || '#8B5CF6' }
    })
    return NextResponse.json({ success: true, tag })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
