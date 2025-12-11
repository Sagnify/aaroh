import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    console.log('Fetching email templates...')
    const templates = await prisma.emailTemplate.findMany({
      orderBy: { name: 'asc' }
    })
    console.log(`Found ${templates.length} templates`)
    return NextResponse.json(templates)
  } catch (error) {
    console.error('Error fetching templates:', error)
    console.error('Error details:', error.message)
    return NextResponse.json({ 
      error: 'Failed to fetch templates', 
      details: error.message 
    }, { status: 500 })
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    const template = await prisma.emailTemplate.create({
      data: {
        name: data.name,
        subject: data.subject,
        htmlContent: data.htmlContent,
        textContent: data.textContent,
        variables: data.variables || [],
        isActive: data.isActive ?? true
      }
    })
    return NextResponse.json(template)
  } catch (error) {
    console.error('Error creating template:', error)
    return NextResponse.json({ error: 'Failed to create template' }, { status: 500 })
  }
}