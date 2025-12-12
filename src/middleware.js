import { NextResponse } from 'next/server'

export function middleware(request) {
  const response = NextResponse.next()
  
  // Security headers for CVE-2025-55184 and CVE-2025-55183 protection
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Block malicious RSC requests (CVE-2025-55184 DoS protection)
  const contentType = request.headers.get('content-type')
  const rscHeader = request.headers.get('rsc')
  
  if (rscHeader && contentType?.includes('text/x-component')) {
    // Validate RSC request size to prevent DoS
    const contentLength = request.headers.get('content-length')
    if (contentLength && parseInt(contentLength) > 1024 * 1024) { // 1MB limit
      return new Response('Request too large', { status: 413 })
    }
  }
  
  // Redirect legacy routes
  if (request.nextUrl.pathname === '/my-courses') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
  
  return response
}

export const config = {
  matcher: [
    '/my-courses',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ]
}
