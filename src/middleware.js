import { NextResponse } from 'next/server'

export function middleware(request) {
  if (request.nextUrl.pathname === '/my-courses') {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }
}

export const config = {
  matcher: '/my-courses'
}
