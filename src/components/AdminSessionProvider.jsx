"use client"

import { SessionProvider } from 'next-auth/react'

export default function AdminSessionProvider({ children }) {
  return (
    <SessionProvider basePath="/api/admin-auth">
      {children}
    </SessionProvider>
  )
}
