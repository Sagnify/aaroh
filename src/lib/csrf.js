// CSRF token utility for client-side requests
export async function getCsrfToken() {
  // Try to get from meta tag first (if set by server)
  const metaToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content')
  if (metaToken) return metaToken
  
  // Fallback to NextAuth CSRF endpoint
  try {
    const response = await fetch('/api/auth/csrf')
    const data = await response.json()
    return data.csrfToken
  } catch (error) {
    console.error('Failed to get CSRF token:', error)
    throw new Error('CSRF token required')
  }
}

// Enhanced fetch with automatic CSRF protection
export async function fetchWithCsrf(url, options = {}) {
  const csrfToken = await getCsrfToken()
  
  return fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-CSRF-Token': csrfToken
    }
  })
}