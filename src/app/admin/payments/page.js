'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign,
  RefreshCw,
  Search,
  Eye,
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail,
  CreditCard,
  TrendingUp,
  XCircle,
  Banknote
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Pagination from '@/components/Pagination'

export default function PaymentsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [period, setPeriod] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [graphPeriod, setGraphPeriod] = useState('month')

  useEffect(() => {
    document.title = 'Payment Management - Admin Dashboard'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchData()
  }, [session, status, router, period, currentPage])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [monitoringRes, transactionsRes, recentRes] = await Promise.all([
        fetch('/api/admin/payment-monitoring'),
        fetch(`/api/admin/transactions?period=${period}&page=${currentPage}&limit=20`),
        fetch(`/api/admin/transactions?period=${period}&page=1&limit=50`) // Get recent for overview
      ])
      
      const monitoring = await monitoringRes.json()
      const transactions = await transactionsRes.json()
      const recent = await recentRes.json()
      
      setData({ monitoring, transactions, recent })
      if (transactions.pagination) {
        setPagination(transactions.pagination)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (paymentStatus, orderStatus, status) => {
    const finalStatus = paymentStatus || status
    if (finalStatus === 'paid' || finalStatus === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (finalStatus === 'cod') return <Banknote className="w-4 h-4 text-blue-500" />
    if (finalStatus === 'failed') return <XCircle className="w-4 h-4 text-red-500" />
    if (orderStatus === 'cancelled') return <XCircle className="w-4 h-4 text-gray-500" />
    if (finalStatus === 'awaiting_payment') return <Clock className="w-4 h-4 text-orange-500" />
    return <Clock className="w-4 h-4 text-yellow-500" />
  }

  const getStatusText = (paymentStatus, orderStatus, status) => {
    const finalStatus = paymentStatus || status
    if (finalStatus === 'paid' || finalStatus === 'completed') return 'Paid'
    if (finalStatus === 'cod') return 'COD'
    if (finalStatus === 'failed') return 'Failed'
    if (orderStatus === 'cancelled') return 'Cancelled'
    if (finalStatus === 'ready') return 'Ready'
    if (finalStatus === 'awaiting_payment') return 'Pending'
    if (finalStatus === 'in_progress') return 'Processing'
    return 'Pending'
  }

  const getStatusBadge = (paymentStatus, orderStatus, status) => {
    const finalStatus = paymentStatus || status
    const variants = {
      completed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      ready: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      awaiting_payment: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
      in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      cod: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
    const className = variants[finalStatus] || 'bg-zinc-100 text-zinc-800 dark:bg-zinc-900/30 dark:text-zinc-400'
    return <Badge className={`${className} text-xs px-2 py-0.5`}>{getStatusText(paymentStatus, orderStatus, status)}</Badge>
  }

  const allTransactions = data?.transactions?.transactions || []
  
  // Get recent transactions for overview (latest 5 from recent data)
  const recentTransactions = (data?.recent?.transactions || []).slice(0, 5)

  const filteredTransactions = allTransactions.filter(t => {
    const matchesSearch = (t.recipientName || t.customerName)?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.occasion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.razorpayPaymentId?.includes(searchTerm) ||
                         t.id?.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && (t.paymentStatus === 'paid' || t.status === 'completed')) ||
      (statusFilter === 'cod' && t.paymentStatus === 'cod') ||
      (statusFilter === 'failed' && (t.paymentStatus === 'failed' || t.status === 'failed')) ||
      (statusFilter === 'pending' && (t.paymentStatus === 'pending' || t.status === 'pending')) ||
      (statusFilter === 'ready' && t.status === 'ready') ||
      (statusFilter === 'awaiting_payment' && t.status === 'awaiting_payment')

    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'shop' && t.type === 'shop') ||
      (typeFilter === 'course' && t.type === 'course') ||
      (typeFilter === 'custom_song' && t.type === 'custom_song')

    return matchesSearch && matchesStatus && matchesType
  })

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'all': return 'All Time'
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case '6months': return 'Last 6 Months'
      case 'year': return 'This Year'
      default: return 'All Time'
    }
  }

  const revenueChartData = useMemo(() => {
    if (!allTransactions.length) return { data: [], domain: [0, 100] }
    
    const days = graphPeriod === 'week' ? 7 : graphPeriod === 'month' ? 30 : graphPeriod === '3months' ? 90 : graphPeriod === '6months' ? 180 : 365
    const dateRange = Array.from({ length: days + 1 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i) + 1) // Add 1 to include future date
      return date.toISOString().split('T')[0]
    })
    
    const chartData = dateRange.map(date => {
      const isFutureDate = new Date(date) > new Date()
      
      if (isFutureDate) {
        // For future dates, only show the date but no data points
        return {
          date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        }
      }
      
      const dayTransactions = allTransactions.filter(t => {
        // Use updatedAt for completed payments to show when they were actually paid
        const transactionDate = (t.paymentStatus === 'paid' || t.paymentStatus === 'cod' || t.status === 'completed') 
          ? new Date(t.updatedAt).toISOString().split('T')[0]
          : new Date(t.createdAt).toISOString().split('T')[0]
        
        return transactionDate === date &&
               (t.paymentStatus === 'paid' || t.paymentStatus === 'cod' || t.status === 'completed')
      })
      
      // Calculate revenue from all payment types
      const totalRevenue = dayTransactions.reduce((sum, t) => {
        return sum + (t.amount || 0)
      }, 0)
      
      // Break down by type for detailed view
      const customSongRevenue = dayTransactions
        .filter(t => t.type === 'custom_song')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      
      const courseRevenue = dayTransactions
        .filter(t => t.type === 'course')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      
      const shopRevenue = dayTransactions
        .filter(t => t.type === 'shop')
        .reduce((sum, t) => sum + (t.amount || 0), 0)
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Revenue: totalRevenue,
        'Custom Songs': customSongRevenue,
        'Courses': courseRevenue,
        'Shop Orders': shopRevenue
      }
    })
    
    const revenues = chartData.map(d => d.Revenue).filter(r => r > 0)
    const maxRevenue = Math.max(...revenues, 0)
    const minRevenue = Math.min(...revenues, 0)
    const padding = (maxRevenue - minRevenue) * 0.3 || maxRevenue * 0.3 || 100
    
    return {
      data: chartData,
      domain: [Math.max(0, minRevenue - padding), maxRevenue + padding]
    }
  }, [allTransactions, graphPeriod])

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
    return null
  }

  if (selectedTransaction) {
    return (
      <div className="pt-16 dark:bg-black min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="mb-6">
            <Button 
              onClick={() => setSelectedTransaction(null)}
              variant="ghost" 
              className="mb-4"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Payments
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
              Transaction Details #{selectedTransaction.id.slice(0, 8)}
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5" />
                  Payment Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Status:</span>
                  {getStatusBadge(selectedTransaction.paymentStatus, selectedTransaction.status, selectedTransaction.status)}
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="font-bold text-lg">₹{selectedTransaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Order Date:</span>
                  <span>{new Date(selectedTransaction.createdAt).toLocaleDateString('en-IN', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
                {selectedTransaction.razorpayPaymentId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Payment ID:</span>
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-950 px-2 py-1 rounded">
                      {selectedTransaction.razorpayPaymentId}
                    </code>
                  </div>
                )}
                {selectedTransaction.razorpayOrderId && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Order ID:</span>
                    <code className="text-xs bg-zinc-100 dark:bg-zinc-950 px-2 py-1 rounded">
                      {selectedTransaction.razorpayOrderId}
                    </code>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="font-medium">{selectedTransaction.customerName || selectedTransaction.recipientName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="text-sm">{selectedTransaction.customerEmail || selectedTransaction.userEmail}</span>
                </div>
                {selectedTransaction.customerPhone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                    <span>{selectedTransaction.customerPhone}</span>
                  </div>
                )}
                {selectedTransaction.shippingAddress && (
                  <div className="pt-2">
                    <span className="text-gray-600 dark:text-gray-400 block mb-2">Shipping Address:</span>
                    <div className="text-sm bg-zinc-50 dark:bg-zinc-950 p-3 rounded">
                      <p className="font-medium">{selectedTransaction.shippingAddress.name}</p>
                      <p>{selectedTransaction.shippingAddress.address}</p>
                      <p>{selectedTransaction.shippingAddress.city}, {selectedTransaction.shippingAddress.state} - {selectedTransaction.shippingAddress.pincode}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>



            {/* Payment History Card - Only for custom songs */}
            {selectedTransaction.type === 'custom_song' && (selectedTransaction.orderIdHistory?.length > 0 || selectedTransaction.repaymentCount > 0 || selectedTransaction.adminResetCount > 0) && (
              <Card className="md:col-span-2 bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <RefreshCw className="w-5 h-5" />
                    Payment History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                      <div className="text-2xl font-bold text-blue-600">{selectedTransaction.orderIdHistory?.length || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Customer Repayments</div>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded">
                      <div className="text-2xl font-bold text-orange-600">{selectedTransaction.adminResetCount || 0}</div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">Admin Resets</div>
                    </div>
                  </div>
                  {selectedTransaction.orderIdHistory?.length > 0 && (
                    <div className="pt-2 border-t">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2">Order History ({selectedTransaction.orderIdHistory.length} previous orders):</div>
                      <div className="space-y-1">
                        {selectedTransaction.orderIdHistory.slice(-3).map((orderId, index) => (
                          <code key={index} className="text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded block">
                            {orderId}
                          </code>
                        ))}
                        {selectedTransaction.orderIdHistory.length > 3 && (
                          <div className="text-xs text-gray-400">... and {selectedTransaction.orderIdHistory.length - 3} more</div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            <Card className="md:col-span-2 bg-white dark:bg-zinc-950 border dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Order Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedTransaction.items?.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-zinc-50 dark:bg-zinc-950 rounded">
                      <div>
                        <h4 className="font-medium">{item.productName}</h4>
                        {item.recipientName && <p className="text-sm text-gray-600 dark:text-gray-400">For: {item.recipientName}</p>}
                        {item.variant && <p className="text-sm text-gray-600 dark:text-gray-400">Variant: {item.variant}</p>}
                        {item.customText && <p className="text-sm text-gray-600 dark:text-gray-400">Message: "{item.customText}"</p>}
                      </div>
                      <span className="font-bold">₹{item.price.toLocaleString()}</span>
                    </div>
                  )) || (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded">
                      <h4 className="font-medium">
                        {selectedTransaction.type === 'custom_song' ? `Custom Song - ${selectedTransaction.occasion}` : 
                         selectedTransaction.type === 'course' ? 'Course Purchase' : 'Order'}
                      </h4>
                      {selectedTransaction.occasion && <p className="text-sm text-gray-600 dark:text-gray-400">Occasion: {selectedTransaction.occasion}</p>}
                      {selectedTransaction.recipientName && <p className="text-sm text-gray-600 dark:text-gray-400">For: {selectedTransaction.recipientName}</p>}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="pt-16 dark:bg-black min-h-screen">
        <div className="p-6 space-y-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto md:px-6 py-8">
        <div className="flex items-center justify-between mb-8 px-4 md:px-0">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Payment Management</h1>
            <p className="text-gray-600 dark:text-gray-300">Monitor all payment transactions and revenue</p>
          </div>
          <Button onClick={fetchData} size="sm" variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Critical Alerts */}
        {data?.monitoring?.criticalAlerts?.length > 0 && (
          <Card className="border-red-200 bg-red-50 mb-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Critical Payment Issues ({data.monitoring.criticalAlerts.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {data.monitoring.criticalAlerts.map((alert, i) => (
                <div key={i} className="text-sm text-red-700 bg-white p-2 rounded border">
                  {alert}
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Tabs */}
        <div className="border-b mb-6">
          <nav className="flex space-x-4 md:space-x-8 overflow-x-auto">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'transactions', label: 'Transactions' },
              { id: 'monitoring', label: 'Monitor' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-2 md:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-4 md:space-y-6">
            {/* Revenue Chart */}
            {allTransactions.length > 0 && (
              <Card className="dark:bg-zinc-950 dark:border-zinc-800 mx-0 border-x-0 md:border-x">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5" />
                      Revenue Trends
                    </CardTitle>
                    <select 
                      value={graphPeriod} 
                      onChange={(e) => setGraphPeriod(e.target.value)}
                      className="text-sm border rounded px-3 py-1.5 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 dark:border-zinc-700"
                    >
                      <option value="week">Last 7 Days</option>
                      <option value="month">Last 30 Days</option>
                      <option value="3months">Last 3 Months</option>
                      <option value="6months">Last 6 Months</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={revenueChartData.data}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-800" />
                      <XAxis 
                        dataKey="date" 
                        stroke="currentColor"
                        tick={{ fontSize: 10 }}
                        angle={-15}
                        textAnchor="end"
                        height={50}
                      />
                      <YAxis 
                        stroke="currentColor"
                        domain={revenueChartData.domain}
                        tickFormatter={(value) => `₹${value.toLocaleString()}`}
                        tick={{ fontSize: 10 }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--background)', 
                          border: '1px solid var(--border)',
                          borderRadius: '6px'
                        }}
                        formatter={(value, name) => {
                          if (name === 'Revenue') return [`₹${value.toLocaleString()}`, 'Total Revenue']
                          if (name === 'Custom Songs') return [`₹${value.toLocaleString()}`, 'Custom Songs']
                          if (name === 'Courses') return [`₹${value.toLocaleString()}`, 'Course Sales']
                          if (name === 'Shop Orders') return [`₹${value.toLocaleString()}`, 'Shop Sales']
                          return [`₹${value.toLocaleString()}`, name]
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '12px' }} />
                      <Line 
                        type="monotone" 
                        dataKey="Revenue" 
                        stroke="#10b981" 
                        strokeWidth={3}
                        dot={{ fill: '#10b981', r: 4 }}
                        connectNulls
                        name="Total Revenue"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Custom Songs" 
                        stroke="#8B5CF6" 
                        strokeWidth={2}
                        dot={{ fill: '#8B5CF6', r: 2 }}
                        connectNulls={false}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Courses" 
                        stroke="#F59E0B" 
                        strokeWidth={2}
                        dot={{ fill: '#F59E0B', r: 2 }}
                        connectNulls={false}
                        strokeDasharray="5 5"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="Shop Orders" 
                        stroke="#3B82F6" 
                        strokeWidth={2}
                        dot={{ fill: '#3B82F6', r: 2 }}
                        connectNulls={false}
                        strokeDasharray="5 5"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4 px-4 md:px-0">
              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Period</CardTitle>
                  <Calendar className="h-4 w-4 text-gray-400" />
                </CardHeader>
                <CardContent>
                  <select 
                    value={period} 
                    onChange={(e) => setPeriod(e.target.value)}
                    className="w-full text-sm border rounded px-2 py-1 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300"
                  >
                    <option value="all">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="6months">Last 6 Months</option>
                    <option value="year">This Year</option>
                  </select>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">₹{data?.transactions?.stats?.totalReceived?.toLocaleString() || 0}</div>
                  <p className="text-xs text-gray-500">{getPeriodLabel(period)}</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Successful</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {(data?.transactions?.stats?.successfulTransactions || 0) + (data?.transactions?.stats?.codTransactions || 0)}
                  </div>
                  <p className="text-xs text-green-600">₹{((data?.transactions?.stats?.successfulAmount || 0) + (data?.transactions?.stats?.codAmount || 0)).toLocaleString()}</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</CardTitle>
                  <XCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.transactions?.stats?.failedTransactions || 0}</div>
                  <p className="text-xs text-red-600">Payment failures</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</CardTitle>
                  <Clock className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.transactions?.stats?.pendingTransactions || 0}</div>
                  <p className="text-xs text-yellow-600">Being processed</p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Ready</CardTitle>
                  <Clock className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">{data?.transactions?.stats?.readyTransactions || 0}</div>
                  <p className="text-xs text-blue-600">Awaiting payment</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 mx-0 border-x-0 md:border-x">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Recent Transactions</CardTitle>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Showing latest 5 transactions • <button onClick={() => setActiveTab('transactions')} className="text-blue-600 hover:text-blue-700 underline">View all</button></p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  {recentTransactions.map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 px-4 md:px-0 -mx-4 md:mx-0 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                          {(transaction.recipientName || transaction.customerName)?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{transaction.recipientName || transaction.customerName}</div>
                          <div className="text-xs text-gray-500">{new Date(transaction.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">₹{transaction.amount.toLocaleString()}</div>
                        {getStatusBadge(transaction.paymentStatus, transaction.status, transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Transactions Tab */}
        {activeTab === 'transactions' && (
          <div className="space-y-4">
            {/* Filters */}
            <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 mx-0 border-x-0 md:border-x">
              <CardContent className="p-4">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Search by order ID, customer name, email, or phone..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <select 
                      value={typeFilter} 
                      onChange={(e) => setTypeFilter(e.target.value)}
                      className="border rounded px-3 py-2 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-sm w-full sm:w-auto"
                    >
                      <option value="all">All Types</option>
                      <option value="shop">Shop Orders</option>
                      <option value="course">Course Purchases</option>
                      <option value="custom_song">Custom Songs</option>
                    </select>
                    <select 
                      value={statusFilter} 
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="border rounded px-3 py-2 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-sm w-full sm:w-auto"
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="cod">Cash on Delivery</option>
                      <option value="failed">Failed</option>
                      <option value="pending">Pending</option>
                      <option value="ready">Ready</option>
                      <option value="awaiting_payment">Awaiting Payment</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Transactions List */}
            <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 mx-0 border-x-0 md:border-x">
              <CardHeader>
                <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {filteredTransactions.map((transaction) => (
                    <motion.div
                      key={transaction.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="py-5 px-4 md:px-0 -mx-4 md:mx-0 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors cursor-pointer"
                      onClick={() => setSelectedTransaction(transaction)}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 shadow-sm">
                          {(transaction.customerName || transaction.recipientName)?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-base truncate text-gray-900 dark:text-white">{transaction.customerName || transaction.recipientName}</span>
                            <div className="text-right">
                              <div className="font-bold text-lg text-gray-900 dark:text-white">₹{transaction.amount.toLocaleString()}</div>
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                transaction.type === 'shop' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' :
                                transaction.type === 'course' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300' :
                                'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                              }`}>
                                {transaction.type === 'shop' ? 'Shop' : transaction.type === 'course' ? 'Course' : 'Song'}
                              </span>
                              <span className="text-xs text-gray-500">
                                {new Date(transaction.createdAt).toLocaleDateString('en-IN', { 
                                  month: 'short', 
                                  day: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            {getStatusBadge(transaction.paymentStatus, transaction.status, transaction.status)}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                  
                  {filteredTransactions.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      No transactions found matching your criteria
                    </div>
                  )}
                </div>

                {pagination && pagination.totalPages > 1 && (
                  <Pagination 
                    currentPage={currentPage} 
                    totalPages={pagination.totalPages} 
                    onPageChange={setCurrentPage} 
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6">
              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 mx-0 border-x-0 md:border-x">
                <CardHeader>
                  <CardTitle>Payment Status Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {(() => {
                    const statusCounts = {}
                    const totalRevenue = {}
                    
                    allTransactions.forEach(t => {
                      const status = t.paymentStatus || t.status || 'pending'
                      statusCounts[status] = (statusCounts[status] || 0) + 1
                      totalRevenue[status] = (totalRevenue[status] || 0) + (t.amount || 0)
                    })
                    
                    if (Object.keys(statusCounts).length === 0) {
                      return (
                        <div className="text-center py-4 text-zinc-500">
                          No transactions found for selected period
                        </div>
                      )
                    }
                    
                    return Object.entries(statusCounts).map(([status, count]) => (
                      <div key={status} className="flex items-center justify-between p-2 bg-zinc-50 dark:bg-zinc-900 rounded">
                        <div className="flex items-center gap-2">
                          {getStatusBadge(null, null, status)}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{count} orders</div>
                          <div className="text-xs text-gray-500">₹{totalRevenue[status].toLocaleString()}</div>
                        </div>
                      </div>
                    ))
                  })()}
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 mx-0 border-x-0 md:border-x">
                <CardHeader>
                  <CardTitle>Recent Payment Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {(() => {
                      const now = new Date()
                      const last24Hours = new Date(now.getTime() - 24 * 60 * 60 * 1000)
                      const thisWeekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
                      
                      const last24HoursCount = allTransactions.filter(t => 
                        new Date(t.createdAt) >= last24Hours
                      ).length
                      
                      const thisWeekCount = allTransactions.filter(t => 
                        new Date(t.createdAt) >= thisWeekStart
                      ).length
                      
                      const successfulCount = allTransactions.filter(t => 
                        t.paymentStatus === 'paid' || t.paymentStatus === 'cod' || t.status === 'completed'
                      ).length
                      
                      const successRate = allTransactions.length > 0 
                        ? Math.round((successfulCount / allTransactions.length) * 100)
                        : 0
                      
                      return (
                        <>
                          <div className="flex justify-between">
                            <span>Last 24 hours:</span>
                            <span className="font-medium">{last24HoursCount} payments</span>
                          </div>
                          <div className="flex justify-between">
                            <span>This week:</span>
                            <span className="font-medium">{thisWeekCount} payments</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Success rate:</span>
                            <span className="font-medium text-green-600">{successRate}%</span>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Live Updates */}
            <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 mx-0 border-x-0 md:border-x">
              <CardHeader>
                <CardTitle>Live Transaction Feed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto overflow-x-hidden">
                  {allTransactions.slice(0, 10).map(transaction => (
                    <div key={transaction.id} className="flex items-center justify-between py-3 px-4 md:px-0 -mx-4 md:mx-0 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-bold">
                            {(transaction.recipientName || transaction.customerName)?.charAt(0)?.toUpperCase() || 'U'}
                          </div>
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-white dark:border-zinc-950"></div>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{transaction.recipientName || transaction.customerName}</div>
                          <div className="text-xs text-gray-500">{new Date(transaction.updatedAt || transaction.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-sm">₹{transaction.amount.toLocaleString()}</div>
                        {getStatusBadge(transaction.paymentStatus, transaction.status, transaction.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}