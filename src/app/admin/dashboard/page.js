"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import { Users, BookOpen, ShoppingCart, TrendingUp, Plus } from 'lucide-react'
import Link from 'next/link'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0
  })

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    // Fetch dashboard stats
    fetchStats()
  }, [session, status, router])

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats')
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    }
  }

  if (status === 'loading') {
    return <Loader />
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Overview</h1>
          <p className="text-gray-600">Welcome back, {session.user.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalPurchases}</div>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900">₹{stats.totalRevenue.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Management Sections */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg font-medium">Course Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/courses">
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                  <BookOpen className="w-4 h-4 mr-3" />
                  View All Courses
                </Button>
              </Link>
              <Link href="/admin/courses/new">
                <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800 text-white">
                  <Plus className="w-4 h-4 mr-3" />
                  Add New Course
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg font-medium">User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users">
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                  <Users className="w-4 h-4 mr-3" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/purchases">
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  View Purchases
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 text-lg font-medium">Content Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/content">
                <Button variant="ghost" className="w-full justify-start text-gray-700 hover:bg-gray-50">
                  <TrendingUp className="w-4 h-4 mr-3" />
                  Manage Content
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}