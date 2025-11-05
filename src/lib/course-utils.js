/**
 * Course utility functions for dynamic calculations and data processing
 */

/**
 * Parse duration string (MM:SS) to minutes
 * @param {string} duration - Duration in MM:SS format
 * @returns {number} Duration in minutes
 */
export function parseDurationToMinutes(duration) {
  if (!duration || typeof duration !== 'string') return 0
  
  const parts = duration.split(':')
  if (parts.length !== 2) return 0
  
  const [minutes, seconds] = parts.map(Number)
  if (isNaN(minutes) || isNaN(seconds)) return 0
  
  return minutes + (seconds / 60)
}

/**
 * Format minutes to human readable duration
 * @param {number} totalMinutes - Total minutes
 * @returns {string} Formatted duration (e.g., "2h 30m" or "45m")
 */
export function formatDuration(totalMinutes) {
  if (!totalMinutes || totalMinutes <= 0) return '0m'
  
  const hours = Math.floor(totalMinutes / 60)
  const minutes = Math.floor(totalMinutes % 60)
  
  if (hours > 0) {
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
  }
  
  return `${minutes}m`
}

/**
 * Calculate course statistics from curriculum
 * @param {Array} curriculum - Course curriculum with sections and videos
 * @returns {Object} Course statistics
 */
export function calculateCourseStats(curriculum) {
  if (!Array.isArray(curriculum)) {
    return { lessons: 0, duration: '0m', totalMinutes: 0 }
  }

  const totalLessons = curriculum.reduce((total, section) => {
    return total + (section.videos?.length || 0)
  }, 0)

  const totalMinutes = curriculum.reduce((total, section) => {
    const sectionMinutes = section.videos?.reduce((sectionTotal, video) => {
      return sectionTotal + parseDurationToMinutes(video.duration)
    }, 0) || 0
    return total + sectionMinutes
  }, 0)

  return {
    lessons: totalLessons,
    duration: formatDuration(totalMinutes),
    totalMinutes
  }
}

/**
 * Calculate section statistics
 * @param {Array} videos - Section videos
 * @returns {Object} Section statistics
 */
export function calculateSectionStats(videos) {
  if (!Array.isArray(videos)) {
    return { lessons: 0, duration: '0m' }
  }

  const totalMinutes = videos.reduce((total, video) => {
    return total + parseDurationToMinutes(video.duration)
  }, 0)

  return {
    lessons: videos.length,
    duration: formatDuration(totalMinutes)
  }
}

/**
 * Add dynamic stats to course object
 * @param {Object} course - Course object with curriculum
 * @returns {Object} Course with calculated stats
 */
export function enrichCourseWithStats(course) {
  if (!course) return course

  const stats = calculateCourseStats(course.curriculum)
  
  const enrichedCurriculum = course.curriculum?.map(section => {
    const sectionStats = calculateSectionStats(section.videos)
    return {
      ...section,
      lessons: sectionStats.lessons,
      duration: sectionStats.duration
    }
  })

  return {
    ...course,
    lessons: stats.lessons,
    duration: stats.duration,
    curriculum: enrichedCurriculum
  }
}