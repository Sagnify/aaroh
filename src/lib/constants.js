/**
 * Application constants and configuration
 */

// API Endpoints
export const API_ENDPOINTS = {
  COURSES: '/api/courses',
  MY_COURSES: '/api/my-courses',
  PURCHASE: '/api/purchase',
  PROGRESS: '/api/user/progress',
  PURCHASES: '/api/user/purchases',
  SITE_CONTENT: '/api/site-content',
  ADMIN: {
    COURSES: '/api/admin/courses',
    USERS: '/api/admin/users',
    PURCHASES: '/api/admin/purchases',
    STATS: '/api/admin/stats'
  }
}

// User Roles
export const USER_ROLES = {
  USER: 'USER',
  ADMIN: 'ADMIN'
}

// Course Levels
export const COURSE_LEVELS = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced'
}

// Purchase Status
export const PURCHASE_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded'
}

// Progress Status
export const PROGRESS_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
}

// Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#a0303f',
  SECONDARY: '#ff6b6b',
  ACCENT: '#ffb088',
  SUCCESS: '#87a96b',
  WARNING: '#e6b800',
  ERROR: '#dc2626',
  BACKGROUND: {
    FROM: '#fdf6e3',
    VIA: '#f7f0e8',
    TO: '#ffb088'
  }
}

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  DEFAULT: 300,
  SLOW: 500,
  EXTRA_SLOW: 800
}

// Validation Rules
export const VALIDATION_RULES = {
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PHONE: /^[\+]?[1-9][\d]{0,15}$/,
  YOUTUBE_URL: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  DURATION: /^([0-9]+):([0-5][0-9])$/
}

// File Upload Limits
export const UPLOAD_LIMITS = {
  IMAGE: {
    MAX_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_TYPES: ['image/jpeg', 'image/png', 'image/webp']
  },
  VIDEO: {
    MAX_SIZE: 100 * 1024 * 1024, // 100MB
    ALLOWED_TYPES: ['video/mp4', 'video/webm']
  }
}

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100
}

// Cache Keys
export const CACHE_KEYS = {
  COURSES: 'courses',
  USER_COURSES: 'user_courses',
  SITE_CONTENT: 'site_content',
  USER_PROFILE: 'user_profile'
}

// Local Storage Keys
export const STORAGE_KEYS = {
  THEME: 'aaroh_theme',
  LANGUAGE: 'aaroh_language',
  LAST_VISITED: 'aaroh_last_visited'
}

// Error Messages
export const ERROR_MESSAGES = {
  GENERIC: 'Something went wrong. Please try again.',
  NETWORK: 'Network error. Please check your connection.',
  UNAUTHORIZED: 'You are not authorized to perform this action.',
  NOT_FOUND: 'The requested resource was not found.',
  VALIDATION: 'Please check your input and try again.',
  SERVER: 'Server error. Please try again later.'
}

// Success Messages
export const SUCCESS_MESSAGES = {
  COURSE_PURCHASED: 'Course purchased successfully!',
  PROGRESS_SAVED: 'Progress saved successfully!',
  PROFILE_UPDATED: 'Profile updated successfully!',
  COURSE_CREATED: 'Course created successfully!',
  COURSE_UPDATED: 'Course updated successfully!',
  COURSE_DELETED: 'Course deleted successfully!'
}

// Default Values
export const DEFAULTS = {
  COURSE: {
    RATING: 4.8,
    STUDENTS: 0,
    DURATION: '0m',
    LESSONS: 0,
    LEVEL: COURSE_LEVELS.BEGINNER,
    LANGUAGE: 'Hindi/English',
    INSTRUCTOR: 'Kashmira Chakraborty'
  },
  USER: {
    ROLE: USER_ROLES.USER
  }
}