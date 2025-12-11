import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/email'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { productIds, sendToAll, productsData } = await request.json()

    // Get users based on sendToAll flag
    const users = await prisma.user.findMany({
      where: sendToAll ? {} : {
        purchases: {
          some: {}
        }
      },
      select: {
        email: true,
        name: true
      }
    })

    // Get product announcement template
    const template = await prisma.emailTemplate.findUnique({
      where: { name: 'newProductAnnouncement' }
    })

    if (!template) {
      return NextResponse.json({ error: 'Product announcement template not found' }, { status: 404 })
    }

    let successCount = 0
    let failureCount = 0

    // Generate product cards HTML for only selected products
    const productCards = productsData.map(product => `
      <div style="border: 1px solid #E2E8F0; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
        <div style="text-align: center; margin-bottom: 16px;">
          <img src="${product.image || `https://via.placeholder.com/120x120/EC4899/FFFFFF?text=${encodeURIComponent(product.name.substring(0, 8))}`}" alt="${product.name}" style="width: 120px; height: 120px; object-fit: cover; border-radius: 8px;"/>
        </div>
        <h3 style="color: #1E293B; margin: 0 0 8px 0; font-size: 18px; font-weight: 600; text-align: center;">${product.name}</h3>
        <p style="color: #64748B; margin: 0 0 8px 0; font-size: 14px; text-align: center;">Starting at <strong>₹${product.price}</strong></p>
      </div>
    `).join('')
    
    const productVariables = {
      productCards
    }

    // Send emails to all users
    for (const user of users) {
      try {
        await sendEmail({
          to: user.email,
          subject: template.subject,
          template: 'newProductAnnouncement',
          variables: {
            userName: user.name || 'Customer',
            productCards,
            shopUrl: `${process.env.NEXTAUTH_URL}/shop`
          }
        })
        successCount++
      } catch (error) {
        console.error(`Failed to send email to ${user.email}:`, error)
        failureCount++
      }
    }

    return NextResponse.json({
      success: true,
      message: `Product announcement sent to ${successCount} users${failureCount > 0 ? `, ${failureCount} failed` : ''}`
    })

  } catch (error) {
    console.error('Product announcement error:', error)
    return NextResponse.json({ error: 'Failed to send product announcements' }, { status: 500 })
  }
}