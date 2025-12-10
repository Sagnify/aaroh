"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, BookOpen, ShoppingCart, TrendingUp, Plus, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { useAdminStats } from '@/hooks/useCachedData'
import { CardSkeleton } from '@/components/AdminSkeleton'

export default function AdminDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: statsData, isLoading: statsLoading } = useAdminStats()
  const [transactionStats, setTransactionStats] = useState(null)
  const [transactionPeriod, setTransactionPeriod] = useState('month')
  const [transactionLoading, setTransactionLoading] = useState(true)

  const stats = statsData || {
    totalCourses: 0,
    totalUsers: 0,
    totalPurchases: 0,
    totalRevenue: 0
  }

  useEffect(() => {
    document.title = 'Admin Dashboard - Aaroh'
    fetchTransactionStats()
  }, [])

  useEffect(() => {
    fetchTransactionStats()
  }, [transactionPeriod])

  const fetchTransactionStats = async () => {
    try {
      setTransactionLoading(true)
      const response = await fetch(`/api/admin/transactions?period=${transactionPeriod}&limit=1`)
      const data = await response.json()
      if (data.success) {
        setTransactionStats(data.stats)
      }
    } catch (error) {
      console.error('Error fetching transaction stats:', error)
    } finally {
      setTransactionLoading(false)
    }
  }

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case '6months': return 'Last 6 Months'
      case 'year': return 'This Year'
      default: return 'This Month'
    }
  }

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="pt-16 dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-0 md:px-6 py-8">
        <div className="mb-8 px-4 md:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Overview</h1>
          <p className="text-gray-600 dark:text-gray-300">Welcome back, {session.user.name}</p>
        </div>

        {/* Stats Cards */}
        <div className="mb-10">
        {statsLoading ? (
          <CardSkeleton count={4} />
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</CardTitle>
              <BookOpen className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalCourses}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</CardTitle>
              <Users className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Purchases</CardTitle>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.totalPurchases}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-gray-500">Courses + Gifts + Songs</p>
                <button 
                  onClick={() => router.push('/admin/purchases')}
                  className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                >
                  View All →
                </button>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
              <select 
                value={transactionPeriod} 
                onChange={(e) => setTransactionPeriod(e.target.value)}
                className="text-xs border dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300"
              >
                <option value="week">Week</option>
                <option value="month">Month</option>
                <option value="6months">6 Months</option>
                <option value="year">Year</option>
              </select>
            </CardHeader>
            <CardContent>
              {transactionLoading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-200 rounded w-24"></div>
                </div>
              ) : (
                <div>
                  <div className="text-2xl font-semibold text-gray-900 dark:text-white">₹{transactionStats?.totalReceived?.toLocaleString() || 0}</div>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-xs text-gray-500">{getPeriodLabel(transactionPeriod)}</p>
                    <button 
                      onClick={() => router.push('/admin/payments')}
                      className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                    >
                      View All →
                    </button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        )}
        </div>

        {/* Management Sections */}
        <div className="mb-6 px-4 md:px-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">Management</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium">Course Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/courses">
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <BookOpen className="w-4 h-4 mr-3" />
                  View All Courses
                </Button>
              </Link>
              <Link href="/admin/courses/new">
                <Button className="w-full justify-start bg-gray-900 hover:bg-gray-800 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white">
                  <Plus className="w-4 h-4 mr-3" />
                  Add New Course
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium">Shop Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/shop">
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  Manage Orders
                </Button>
              </Link>
              <Link href="/admin/custom-song-settings">
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <CreditCard className="w-4 h-4 mr-3" />
                  Custom Song Pricing
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium">User Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/users">
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <Users className="w-4 h-4 mr-3" />
                  Manage Users
                </Button>
              </Link>
              <Link href="/admin/purchases">
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
                  <ShoppingCart className="w-4 h-4 mr-3" />
                  All Purchases
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader>
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium">Content Management</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Link href="/admin/content">
                <Button variant="ghost" className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-zinc-800">
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
