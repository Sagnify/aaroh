import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const products = await prisma.shopProduct.findMany({
      where: { isActive: true },
      include: {
        variants: true,
        category: true,
        tags: true
      },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ success: true, products })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch products' }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const body = await request.json()
    const { name, description, price, categoryId, tagIds, images, variants, seoTitle, seoDescription, seoKeywords } = body

    const product = await prisma.shopProduct.create({
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        description,
        price: parseFloat(price),
        categoryId: categoryId || null,
        images: images || [],
        seoTitle,
        seoDescription,
        seoKeywords,
        isActive: true,
        variants: {
          create: (variants || []).map(variant => ({
            name: variant.name,
            price: variant.price,
            images: variant.images || []
          }))
        },
        tags: tagIds && tagIds.length > 0 ? {
          connect: tagIds.map(id => ({ id }))
        } : undefined
      },
      include: { variants: true, category: true, tags: true }
    })
    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json({ success: false, error: 'Failed to create product' }, { status: 500 })
  }
}
