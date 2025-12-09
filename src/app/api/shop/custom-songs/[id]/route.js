import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const body = await request.json()
    const { status } = body

    const song = await prisma.customSongOrder.update({
      where: { id: params.id },
      data: { status }
    })

    return NextResponse.json({ success: true, song })
  } catch (error) {
    console.error('Error updating song:', error)
    return NextResponse.json({ success: false, error: 'Failed to update' }, { status: 500 })
  }
}
