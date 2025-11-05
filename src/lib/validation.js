/**
 * Validation utilities for forms and data
 */

import { VALIDATION_RULES } from './constants'

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Is valid email
 */
export function isValidEmail(email) {
  if (!email || typeof email !== 'string') return false
  return VALIDATION_RULES.EMAIL.test(email.trim())
}

/**
 * Validate phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} Is valid phone
 */
export function isValidPhone(phone) {
  if (!phone || typeof phone !== 'string') return false
  return VALIDATION_RULES.PHONE.test(phone.trim())
}

/**
 * Validate YouTube URL
 * @param {string} url - YouTube URL to validate
 * @returns {boolean} Is valid YouTube URL
 */
export function isValidYouTubeUrl(url) {
  if (!url || typeof url !== 'string') return false
  return VALIDATION_RULES.YOUTUBE_URL.test(url.trim())
}

/**
 * Validate duration format (MM:SS)
 * @param {string} duration - Duration to validate
 * @returns {boolean} Is valid duration
 */
export function isValidDuration(duration) {
  if (!duration || typeof duration !== 'string') return false
  return VALIDATION_RULES.DURATION.test(duration.trim())
}

/**
 * Validate required string field
 * @param {string} value - Value to validate
 * @param {number} minLength - Minimum length (default: 1)
 * @param {number} maxLength - Maximum length (default: 1000)
 * @returns {boolean} Is valid string
 */
export function isValidString(value, minLength = 1, maxLength = 1000) {
  if (!value || typeof value !== 'string') return false
  const trimmed = value.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}

/**
 * Validate price (positive number)
 * @param {number} price - Price to validate
 * @returns {boolean} Is valid price
 */
export function isValidPrice(price) {
  return typeof price === 'number' && price > 0 && Number.isFinite(price)
}

/**
 * Validate course data
 * @param {Object} course - Course object to validate
 * @returns {Object} Validation result with errors
 */
export function validateCourse(course) {
  const errors = {}

  if (!isValidString(course.title, 3, 100)) {
    errors.title = 'Title must be between 3 and 100 characters'
  }

  if (course.subtitle && !isValidString(course.subtitle, 0, 200)) {
    errors.subtitle = 'Subtitle must be less than 200 characters'
  }

  if (!isValidString(course.description, 10, 2000)) {
    errors.description = 'Description must be between 10 and 2000 characters'
  }

  if (!isValidPrice(course.price)) {
    errors.price = 'Price must be a positive number'
  }

  if (course.originalPrice && !isValidPrice(course.originalPrice)) {
    errors.originalPrice = 'Original price must be a positive number'
  }

  if (course.originalPrice && course.price >= course.originalPrice) {
    errors.price = 'Price must be less than original price'
  }

  if (course.trailerUrl && !isValidYouTubeUrl(course.trailerUrl)) {
    errors.trailerUrl = 'Please enter a valid YouTube URL'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate user registration data
 * @param {Object} userData - User data to validate
 * @returns {Object} Validation result with errors
 */
export function validateUserRegistration(userData) {
  const errors = {}

  if (!isValidString(userData.name, 2, 50)) {
    errors.name = 'Name must be between 2 and 50 characters'
  }

  if (!isValidEmail(userData.email)) {
    errors.email = 'Please enter a valid email address'
  }

  if (!isValidString(userData.password, 6, 100)) {
    errors.password = 'Password must be at least 6 characters long'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Validate video data
 * @param {Object} video - Video object to validate
 * @returns {Object} Validation result with errors
 */
export function validateVideo(video) {
  const errors = {}

  if (!isValidString(video.title, 3, 100)) {
    errors.title = 'Title must be between 3 and 100 characters'
  }

  if (video.description && !isValidString(video.description, 0, 500)) {
    errors.description = 'Description must be less than 500 characters'
  }

  if (!isValidYouTubeUrl(video.youtubeUrl)) {
    errors.youtubeUrl = 'Please enter a valid YouTube URL'
  }

  if (!isValidDuration(video.duration)) {
    errors.duration = 'Duration must be in MM:SS format'
  }

  if (typeof video.order !== 'number' || video.order < 0) {
    errors.order = 'Order must be a non-negative number'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Sanitize string input
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeString(input) {
  if (!input || typeof input !== 'string') return ''
  return input.trim().replace(/[<>]/g, '')
}

/**
 * Validate and sanitize form data
 * @param {Object} data - Form data to validate
 * @param {Object} rules - Validation rules
 * @returns {Object} Validated and sanitized data with errors
 */
export function validateFormData(data, rules) {
  const sanitized = {}
  const errors = {}

  for (const [field, rule] of Object.entries(rules)) {
    const value = data[field]

    // Apply sanitization
    if (rule.type === 'string') {
      sanitized[field] = sanitizeString(value)
    } else {
      sanitized[field] = value
    }

    // Apply validation
    if (rule.required && (!value || (typeof value === 'string' && !value.trim()))) {
      errors[field] = `${field} is required`
      continue
    }

    if (value && rule.validator && !rule.validator(value)) {
      errors[field] = rule.message || `Invalid ${field}`
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    data: sanitized,
    errors
  }
}