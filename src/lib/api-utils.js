/**
 * API utility functions for consistent error handling and user management
 */

import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { NextResponse } from 'next/server'

/**
 * Get authenticated user from session
 * @param {string} requiredRole - Required user role (optional)
 * @returns {Promise<Object>} User object or error response
 */
export async function getAuthenticatedUser(requiredRole = null) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
    }

    if (requiredRole && session.user.role !== requiredRole) {
      return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
    }

    // Handle admin user (doesn't exist in database)
    if (session.user.id === 'admin') {
      return { 
        user: {
          id: 'admin',
          email: session.user.email,
          name: session.user.name,
          role: 'ADMIN'
        }, 
        session 
      }
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return { error: NextResponse.json({ error: 'User not found' }, { status: 404 }) }
    }

    return { user, session }
  } catch (error) {
    console.error('Authentication error:', error)
    return { error: NextResponse.json({ error: 'Authentication failed' }, { status: 500 }) }
  }
}

/**
 * Handle API errors consistently
 * @param {Error} error - Error object
 * @param {string} context - Error context for logging
 * @returns {NextResponse} Error response
 */
export function handleApiError(error, context = 'API') {
  console.error(`${context} error:`, error)
  
  // Prisma specific errors
  if (error.code === 'P2002') {
    return NextResponse.json({ error: 'Resource already exists' }, { status: 409 })
  }
  
  if (error.code === 'P2025') {
    return NextResponse.json({ error: 'Resource not found' }, { status: 404 })
  }

  if (error.code === 'P2003') {
    return NextResponse.json({ error: 'Invalid reference' }, { status: 400 })
  }

  return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
}

/**
 * Validate required fields in request body
 * @param {Object} body - Request body
 * @param {Array} requiredFields - Array of required field names
 * @returns {Object|null} Validation error or null if valid
 */
export function validateRequiredFields(body, requiredFields) {
  const missingFields = requiredFields.filter(field => !body[field])
  
  if (missingFields.length > 0) {
    return NextResponse.json({ 
      error: `Missing required fields: ${missingFields.join(', ')}` 
    }, { status: 400 })
  }
  
  return null
}

/**
 * Standard success response
 * @param {any} data - Response data
 * @param {string} message - Success message
 * @param {number} status - HTTP status code
 * @returns {NextResponse} Success response
 */
export function successResponse(data, message = 'Success', status = 200) {
  return NextResponse.json({ 
    success: true, 
    message, 
    data 
  }, { status })
}