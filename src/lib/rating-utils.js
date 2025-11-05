import { prisma } from '@/lib/prisma'

/**
 * Update course rating based on all reviews
 * @param {string} courseId - The course ID
 */
export async function updateCourseRating(courseId) {
  try {
    const reviews = await prisma.review.findMany({
      where: { courseId },
      select: { rating: true }
    })

    if (reviews.length === 0) {
      // Keep default rating if no reviews
      return
    }

    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    const roundedRating = Math.round(avgRating * 10) / 10

    await prisma.course.update({
      where: { id: courseId },
      data: { rating: roundedRating }
    })

    return roundedRating
  } catch (error) {
    console.error('Failed to update course rating:', error)
    throw error
  }
}

/**
 * Check if user can leave a review (has completed purchase)
 * @param {string} userId - The user ID
 * @param {string} courseId - The course ID
 */
export async function canUserReview(userId, courseId) {
  try {
    const purchase = await prisma.purchase.findFirst({
      where: { 
        userId, 
        courseId,
        status: 'completed'
      }
    })

    return !!purchase
  } catch (error) {
    console.error('Failed to check review eligibility:', error)
    return false
  }
}