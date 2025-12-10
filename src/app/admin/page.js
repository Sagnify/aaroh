"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function AdminPage() {
  const router = useRouter()

  useEffect(() => {
    document.title = 'Admin Panel | Aaroh'
    // Redirect to login page
    router.push('/admin/login')
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-[#a0303f] mb-4">Redirecting to Admin Login...</h1>
      </div>
    </div>
  )
}