"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AdminAuthContext = createContext()

export function AdminAuthProvider({ children }) {
  const [adminSession, setAdminSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const stored = localStorage.getItem('adminSession')
    if (stored) {
      try {
        const session = JSON.parse(stored)
        if (session.expiresAt > Date.now()) {
          setAdminSession(session)
        } else {
          localStorage.removeItem('adminSession')
        }
      } catch (e) {
        localStorage.removeItem('adminSession')
      }
    }
    setLoading(false)
  }, [])

  const signIn = async (email, password, token) => {
    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, token })
      })

      const data = await response.json()

      if (response.ok && data.success) {
        const session = {
          user: data.user,
          expiresAt: Date.now() + (30 * 24 * 60 * 60 * 1000)
        }
        localStorage.setItem('adminSession', JSON.stringify(session))
        setAdminSession(session)
        return { success: true }
      }

      return { success: false, error: data.error || 'Login failed' }
    } catch (error) {
      return { success: false, error: 'Network error' }
    }
  }

  const signOut = () => {
    localStorage.removeItem('adminSession')
    setAdminSession(null)
    router.push('/admin/login')
  }

  return (
    <AdminAuthContext.Provider value={{ adminSession, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export const useAdminAuth = () => {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
