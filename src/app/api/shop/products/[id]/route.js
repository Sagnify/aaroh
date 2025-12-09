import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const product = await prisma.shopProduct.findFirst({
      where: {
        OR: [
          { id },
          { slug: id }
        ]
      },
      include: { variants: true, category: true, tags: true }
    })

    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch product' }, { status: 500 })
  }
}

export async function PATCH(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { isFeatured } = body

    const product = await prisma.shopProduct.update({
      where: { id },
      data: { isFeatured },
      include: { variants: true, category: true, tags: true }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const body = await request.json()
    const { name, description, price, categoryId, tagIds, images, variants } = body

    await prisma.productVariant.deleteMany({
      where: { productId: id }
    })

    const product = await prisma.shopProduct.update({
      where: { id },
      data: {
        name,
        slug: name.toLowerCase().replace(/\s+/g, '-'),
        description,
        price: parseFloat(price),
        categoryId: categoryId || null,
        images: images || [],
        variants: {
          create: (variants || []).map(v => ({ name: v.name, price: v.price }))
        },
        tags: {
          set: tagIds ? tagIds.map(id => ({ id })) : []
        }
      },
      include: { variants: true, category: true, tags: true }
    })

    return NextResponse.json({ success: true, product })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params
    await prisma.shopProduct.delete({
      where: { id }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json({ success: false, error: 'Failed to delete' }, { status: 500 })
  }
}
