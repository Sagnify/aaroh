import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // Get all users with any type of purchase
    const allUsers = await prisma.user.findMany({
      where: {
        role: 'USER'
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: {
          select: {
            purchases: true,
            shopOrders: true
          }
        },
        purchases: {
          select: {
            createdAt: true,
            course: {
              select: {
                title: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        },
        shopOrders: {
          select: {
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Get custom song orders separately (they use email, not userId)
    const customSongOrders = await prisma.customSongOrder.findMany({
      where: {
        status: 'completed'
      },
      select: {
        userEmail: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Create a map of custom song orders by email
    const customSongsByEmail = {}
    customSongOrders.forEach(order => {
      if (!customSongsByEmail[order.userEmail]) {
        customSongsByEmail[order.userEmail] = []
      }
      customSongsByEmail[order.userEmail].push(order)
    })

    const customersWithStats = allUsers
      .map(user => {
        const lastPurchase = user.purchases[0]?.createdAt
        const lastOrder = user.shopOrders[0]?.createdAt
        const customSongs = customSongsByEmail[user.email] || []
        const lastCustomSong = customSongs[0]?.createdAt

        // Find most recent activity
        const activities = [lastPurchase, lastOrder, lastCustomSong].filter(Boolean)
        const mostRecentActivity = activities.length > 0 
          ? activities.reduce((latest, current) => 
              new Date(current) > new Date(latest) ? current : latest
            )
          : null

        const totalPurchases = user._count.purchases + user._count.shopOrders + customSongs.length

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          createdAt: user.createdAt,
          purchaseCount: totalPurchases,
          lastPurchase: mostRecentActivity,
          hasCustomSongs: customSongs.length > 0
        }
      })
      .filter(user => user.purchaseCount > 0) // Only include users with purchases

    return NextResponse.json(customersWithStats)
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch customers' },
      { status: 500 }
    )
  }
}