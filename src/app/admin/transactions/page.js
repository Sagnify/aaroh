'use client'

import { useState, useEffect, useMemo } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  CreditCard, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Banknote,
  Search,
  Filter,
  Eye,
  ArrowLeft,
  Calendar,
  User,
  Phone,
  Mail
} from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Pagination from '@/components/Pagination'

export default function TransactionsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [transactions, setTransactions] = useState([])
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('month')
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')
  const [selectedTransaction, setSelectedTransaction] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [graphPeriod, setGraphPeriod] = useState('month')

  useEffect(() => {
    document.title = 'Transactions - Admin Dashboard'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchTransactions()
  }, [session, status, router, period, currentPage])

  const fetchTransactions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/transactions?period=${period}&page=${currentPage}&limit=20`)
      const data = await response.json()
      if (data.success) {
        setTransactions(data.transactions)
        setStats(data.stats)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error('Error fetching transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'paid') return <CheckCircle className="w-4 h-4 text-green-500" />
    if (paymentStatus === 'cod') return <Banknote className="w-4 h-4 text-blue-500" />
    if (paymentStatus === 'failed') return <XCircle className="w-4 h-4 text-red-500" />
    if (orderStatus === 'cancelled') return <XCircle className="w-4 h-4 text-gray-500" />
    return <Clock className="w-4 h-4 text-yellow-500" />
  }

  const getStatusText = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'paid') return 'Paid Online'
    if (paymentStatus === 'cod') return 'Cash on Delivery'
    if (paymentStatus === 'failed') return 'Payment Failed'
    if (orderStatus === 'cancelled') return 'Cancelled'
    return 'Pending Payment'
  }

  const getStatusColor = (paymentStatus, orderStatus) => {
    if (paymentStatus === 'paid') return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (paymentStatus === 'cod') return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    if (paymentStatus === 'failed') return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
    if (orderStatus === 'cancelled') return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300'
    return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
  }

  const filteredTransactions = transactions.filter(transaction => {
    const matchesSearch = 
      transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      transaction.customerPhone.includes(searchTerm)

    const matchesStatus = statusFilter === 'all' || 
      (statusFilter === 'paid' && transaction.paymentStatus === 'paid') ||
      (statusFilter === 'cod' && transaction.paymentStatus === 'cod') ||
      (statusFilter === 'failed' && transaction.paymentStatus === 'failed') ||
      (statusFilter === 'pending' && transaction.paymentStatus === 'pending')

    const matchesType = typeFilter === 'all' ||
      (typeFilter === 'shop' && transaction.type === 'shop') ||
      (typeFilter === 'course' && transaction.type === 'course') ||
      (typeFilter === 'custom_song' && transaction.type === 'custom_song')

    return matchesSearch && matchesStatus && matchesType
  })

  const getPeriodLabel = (period) => {
    switch (period) {
      case 'week': return 'This Week'
      case 'month': return 'This Month'
      case '6months': return 'Last 6 Months'
      case 'year': return 'This Year'
      default: return 'This Month'
    }
  }

  const revenueChartData = useMemo(() => {
    if (!transactions.length) return { data: [], domain: [0, 100] }
    
    const days = graphPeriod === 'week' ? 7 : graphPeriod === 'month' ? 30 : graphPeriod === '3months' ? 90 : graphPeriod === '6months' ? 180 : 365
    const dateRange = Array.from({ length: days }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (days - 1 - i))
      return date.toISOString().split('T')[0]
    })
    
    const allData = dateRange.map((date, idx) => {
      const dayTransactions = transactions.filter(t => 
        new Date(t.createdAt).toISOString().split('T')[0] === date &&
        (t.paymentStatus === 'paid' || t.paymentStatus === 'cod')
      )
      
      const revenue = dayTransactions.reduce((sum, t) => sum + (t.amount || 0), 0)
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Revenue: revenue,
        hasData: revenue > 0,
        index: idx
      }
    })
    
    const dataIndices = allData.filter(d => d.hasData).map(d => d.index)
    
    // Always start from beginning, sample based on period and data density
    let data = [allData[0]] // Always include start date
    const baseSampleRate = days > 180 ? 30 : days > 90 ? 15 : days > 30 ? 7 : days > 7 ? 2 : 1
    
    for (let i = 1; i < allData.length; i++) {
      if (allData[i].hasData) {
        // Always include data points and 1 date before
        if (i > 0 && !data.includes(allData[i - 1])) data.push(allData[i - 1])
        data.push(allData[i])
      } else if (i === allData.length - 1) {
        // Always include end date
        data.push(allData[i])
      } else {
        // Sample empty dates based on rate
        const nearData = dataIndices.some(idx => Math.abs(idx - i) <= 2)
        if (nearData || i % baseSampleRate === 0) {
          data.push(allData[i])
        }
      }
    }
    
    // Add 1 future date
    const lastDate = new Date(dateRange[dateRange.length - 1])
    const futureDate = new Date(lastDate)
    futureDate.setDate(futureDate.getDate() + 1)
    data.push({
      date: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Revenue: null
    })
    
    const revenues = data.map(d => d.Revenue).filter(r => r !== null)
    const maxRevenue = Math.max(...revenues, 0)
    const minRevenue = Math.min(...revenues, 0)
    const padding = (maxRevenue - minRevenue) * 0.3 || maxRevenue * 0.3 || 100
    
    return {
      data,
      domain: [Math.max(0, minRevenue - padding), maxRevenue + padding]
    }
  }, [transactions, graphPeriod])

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
              Back to Transactions
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
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(selectedTransaction.paymentStatus, selectedTransaction.status)}`}>
                    {getStatusText(selectedTransaction.paymentStatus, selectedTransaction.status)}
                  </span>
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
                    <code className="text-xs bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      {selectedTransaction.razorpayPaymentId}
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
                  <span className="font-medium">{selectedTransaction.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Email:</span>
                  <span className="text-sm">{selectedTransaction.customerEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Phone:</span>
                  <span>{selectedTransaction.customerPhone}</span>
                </div>
                <div className="pt-2">
                  <span className="text-gray-600 dark:text-gray-400 block mb-2">Shipping Address:</span>
                  <div className="text-sm bg-gray-50 dark:bg-zinc-800 p-3 rounded">
                    <p className="font-medium">{selectedTransaction.shippingAddress.name}</p>
                    <p>{selectedTransaction.shippingAddress.address}</p>
                    <p>{selectedTransaction.shippingAddress.city}, {selectedTransaction.shippingAddress.state} - {selectedTransaction.shippingAddress.pincode}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="md:col-span-2 bg-white dark:bg-zinc-950 border dark:border-zinc-800">
              <CardHeader>
                <CardTitle>Order Items</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedTransaction.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-start p-3 bg-gray-50 dark:bg-zinc-800 rounded">
                      <div>
                        <h4 className="font-medium">{item.productName}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">For: {item.recipientName}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Variant: {item.variant}</p>
                        {item.customText && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">Message: "{item.customText}"</p>
                        )}
                      </div>
                      <span className="font-bold">₹{item.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-0 md:px-6 py-8">
        <div className="mb-8 px-4 md:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Transaction Management</h1>
          <p className="text-gray-600 dark:text-gray-300">Monitor all payment transactions and revenue</p>
        </div>

        {/* Revenue Graph */}
        {loading ? (
          <Card className="mb-8 dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-40 animate-pulse"></div>
                <div className="h-8 bg-gray-200 dark:bg-zinc-700 rounded w-32 animate-pulse"></div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 dark:bg-zinc-800 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ) : transactions.length > 0 && (
          <Card className="mb-8 dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Revenue Trends
                </CardTitle>
                <select 
                  value={graphPeriod} 
                  onChange={(e) => setGraphPeriod(e.target.value)}
                  className="text-sm border rounded px-3 py-1.5 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 dark:border-zinc-700"
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
                    formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
                  />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                  <Line 
                    type="monotone" 
                    dataKey="Revenue" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    dot={{ fill: '#10b981', r: 3 }}
                    connectNulls
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        {/* Stats Cards */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {[...Array(5)].map((_, i) => (
              <Card key={i} className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-12"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Period</CardTitle>
              <Calendar className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <select 
                value={period} 
                onChange={(e) => setPeriod(e.target.value)}
                className="w-full text-sm border rounded px-2 py-1 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300"
              >
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
              <div className="text-2xl font-bold text-green-600">₹{stats?.totalReceived?.toLocaleString() || 0}</div>
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
                {(stats?.successfulTransactions || 0) + (stats?.codTransactions || 0)}
              </div>
              <p className="text-xs text-green-600">₹{((stats?.successfulAmount || 0) + (stats?.codAmount || 0)).toLocaleString()}</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Failed</CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.failedTransactions || 0}</div>
              <p className="text-xs text-red-600">Payment failures</p>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.pendingTransactions || 0}</div>
              <p className="text-xs text-yellow-600">Awaiting payment</p>
            </CardContent>
          </Card>
        </div>
        )}

        {/* Filters */}
        <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 mb-6">
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
              <div className="flex gap-2">
                <select 
                  value={typeFilter} 
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="border rounded px-3 py-2 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Types</option>
                  <option value="shop">Shop Orders</option>
                  <option value="course">Course Purchases</option>
                  <option value="custom_song">Custom Songs</option>
                </select>
                <select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="border rounded px-3 py-2 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300"
                >
                  <option value="all">All Status</option>
                  <option value="paid">Paid Online</option>
                  <option value="cod">Cash on Delivery</option>
                  <option value="failed">Failed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Transactions Table */}
        <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Transactions ({filteredTransactions.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="animate-pulse p-4 border dark:border-zinc-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-4 h-4 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-20"></div>
                            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-12"></div>
                            <div className="h-5 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
                          </div>
                          <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-48"></div>
                          <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-32"></div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right space-y-1">
                          <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-20"></div>
                          <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-16"></div>
                        </div>
                        <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredTransactions.map((transaction) => (
                  <motion.div
                    key={transaction.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 border dark:border-zinc-700 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        {getStatusIcon(transaction.paymentStatus, transaction.status)}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span className="font-medium text-sm">#{transaction.id.slice(0, 8)}</span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              transaction.type === 'shop' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                              transaction.type === 'course' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                              'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                            }`}>
                              {transaction.type === 'shop' ? 'Shop' : transaction.type === 'course' ? 'Course' : 'Song'}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                            {transaction.customerName}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(transaction.createdAt).toLocaleDateString('en-IN', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setSelectedTransaction(transaction)}
                        className="flex-shrink-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t dark:border-zinc-700">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(transaction.paymentStatus, transaction.status)}`}>
                        {getStatusText(transaction.paymentStatus, transaction.status)}
                      </span>
                      <div className="text-right">
                        <div className="font-bold text-lg">₹{transaction.amount.toLocaleString()}</div>
                        <div className="text-xs text-gray-500">{transaction.items.length} item(s)</div>
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
            )}

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
    </div>
  )
}