"use client"

import { useSession } from 'next-auth/react'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import AdminSidebar from '@/components/AdminSidebar'

export default function AdminLayout({ children }) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()
  const isLoginPage = pathname === '/admin/login'

  useEffect(() => {
    if (status === 'loading') return

    if (!session || session.user.role !== 'ADMIN') {
      if (!isLoginPage) {
        router.push('/admin/login')
      }
    } else {
      if (isLoginPage) {
        router.push('/admin/dashboard')
      }
    }
  }, [session, status, router, isLoginPage])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="relative">
          <div className="w-16 h-16 bg-[#a0303f] rounded-full flex items-center justify-center mx-auto animate-pulse">
            <div className="w-8 h-8 bg-white rounded"></div>
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-white">
        {children}
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-white">
      <AdminSidebar />
      <div className="lg:pl-64">
        {children}
      </div>
    </div>
  )
}