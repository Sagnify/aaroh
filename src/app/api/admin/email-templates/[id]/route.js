import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request, { params }) {
  try {
    const { id } = params
    const data = await request.json()
    
    const template = await prisma.emailTemplate.update({
      where: { id },
      data: {
        subject: data.subject,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        variables: data.variables || [],
        isActive: data.isActive ?? true
      }
    })
    
    return NextResponse.json(template)
  } catch (error) {
    console.error('Error updating template:', error)
    return NextResponse.json({ error: 'Failed to update template' }, { status: 500 })
  }
}