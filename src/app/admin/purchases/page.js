"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, User, BookOpen, Calendar, IndianRupee, Edit3, Check, X, Package, Music, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/AdminSkeleton'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import Pagination from '@/components/Pagination'

export default function ViewPurchases() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [purchases, setPurchases] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingStatus, setEditingStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    document.title = 'Purchases - Admin - Aaroh'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
    fetchPurchases()
  }, [session, status, router])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/admin/purchases')
      const data = await response.json()
      setPurchases(data)
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveStatus = async (purchaseId, purchaseType) => {
    try {
      let endpoint = ''
      let updateField = ''
      
      if (purchaseType === 'course') {
        endpoint = `/api/admin/purchases/${purchaseId}`
        updateField = 'status'
      } else if (purchaseType === 'shop') {
        endpoint = `/api/shop/orders/${purchaseId}`
        updateField = 'paymentStatus'
      } else if (purchaseType === 'custom_song') {
        endpoint = `/api/shop/custom-songs/${purchaseId}`
        updateField = 'status'
      }
      
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [updateField]: editingStatus })
      })
      
      if (response.ok) {
        setPurchases(prev => prev.map(p => 
          p.id === purchaseId ? { 
            ...p, 
            [purchaseType === 'course' ? 'status' : 'paymentStatus']: editingStatus 
          } : p
        ))
        setEditingId(null)
        setEditingStatus('')
      } else {
        alert('Failed to update status')
      }
    } catch (error) {
      alert('Error updating status')
    }
  }

  const chartData = useMemo(() => {
    if (!purchases.length) return { data: [], domain: [0, 10] }
    
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date()
      date.setDate(date.getDate() - (6 - i))
      return date.toISOString().split('T')[0]
    })
    
    const allData = last7Days.map((date, idx) => {
      const dayPurchases = purchases.filter(p => 
        new Date(p.createdAt).toISOString().split('T')[0] === date
      )
      
      const success = dayPurchases.filter(p => 
        p.status === 'completed' || p.paymentStatus === 'paid'
      ).length
      
      const failed = dayPurchases.filter(p => 
        p.status === 'failed' || p.paymentStatus === 'failed' || p.paymentStatus === 'cancelled'
      ).length
      
      const pending = dayPurchases.filter(p => 
        p.status === 'pending' || p.paymentStatus === 'pending' || p.paymentStatus === 'cod'
      ).length
      
      return {
        date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        Success: success,
        Failed: failed,
        Pending: pending,
        hasData: success > 0 || failed > 0 || pending > 0,
        index: idx
      }
    })
    
    const dataIndices = allData.filter(d => d.hasData).map(d => d.index)
    
    // Always start from beginning, sample based on data density
    let data = [allData[0]] // Always include start date
    
    for (let i = 1; i < allData.length; i++) {
      if (allData[i].hasData) {
        // Always include data points and 1 date before
        if (i > 0 && !data.includes(allData[i - 1])) data.push(allData[i - 1])
        data.push(allData[i])
      } else if (i === allData.length - 1) {
        // Always include end date
        data.push(allData[i])
      } else {
        // Sample empty dates - include if near data or every 2nd
        const nearData = dataIndices.some(idx => Math.abs(idx - i) <= 1)
        if (nearData || i % 2 === 0) {
          data.push(allData[i])
        }
      }
    }
    
    // Add 1 future date
    const lastDate = new Date(last7Days[last7Days.length - 1])
    const futureDate = new Date(lastDate)
    futureDate.setDate(futureDate.getDate() + 1)
    data.push({
      date: futureDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      Success: null,
      Failed: null,
      Pending: null
    })
    
    const allValues = data.flatMap(d => [d.Success, d.Failed, d.Pending]).filter(v => v !== null)
    const maxValue = Math.max(...allValues, 0)
    const minValue = Math.min(...allValues, 0)
    const padding = Math.ceil((maxValue - minValue) * 0.3) || Math.ceil(maxValue * 0.3) || 2
    
    return {
      data,
      domain: [Math.max(0, minValue - padding), maxValue + padding]
    }
  }, [purchases])

  const stats = useMemo(() => {
    const total = purchases.length
    const success = purchases.filter(p => p.status === 'completed' || p.paymentStatus === 'paid').length
    const failed = purchases.filter(p => p.status === 'failed' || p.paymentStatus === 'failed' || p.paymentStatus === 'cancelled').length
    const pending = purchases.filter(p => p.status === 'pending' || p.paymentStatus === 'pending' || p.paymentStatus === 'cod').length
    
    return {
      successRate: total ? ((success / total) * 100).toFixed(1) : 0,
      failureRate: total ? ((failed / total) * 100).toFixed(1) : 0,
      pendingRate: total ? ((pending / total) * 100).toFixed(1) : 0
    }
  }, [purchases])

  const filteredPurchases = purchases.filter(purchase => typeFilter === 'all' || purchase.type === typeFilter)
  const totalPages = Math.ceil(filteredPurchases.length / itemsPerPage)
  const paginatedPurchases = filteredPurchases.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <div className="max-w-7xl mx-auto px-0 md:px-6 py-8">
        <div className="mb-8 px-4 md:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Purchases</h1>
          <p className="text-gray-600 dark:text-gray-400">View all purchases: courses, gifts, and custom songs</p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="dark:bg-zinc-950 dark:border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-24 animate-pulse"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-9 bg-gray-200 dark:bg-zinc-700 rounded w-20 mb-2 animate-pulse"></div>
                  <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-32 animate-pulse"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <Card className="dark:bg-zinc-950 dark:border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Success Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.successRate}%</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completed purchases</p>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-zinc-950 dark:border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Failure Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-600 dark:text-red-400">{stats.failureRate}%</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Failed/Cancelled</p>
              </CardContent>
            </Card>
            
            <Card className="dark:bg-zinc-950 dark:border-zinc-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Rate</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{stats.pendingRate}%</div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Awaiting completion</p>
              </CardContent>
            </Card>
          </div>
        )}

        {isLoading ? (
          <Card className="mb-8 dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader>
              <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 dark:bg-zinc-800 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ) : (
          <Card className="mb-8 dark:bg-zinc-950 dark:border-zinc-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Purchase Trends (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.data}>
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
                  domain={chartData.domain}
                  tick={{ fontSize: 10 }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'var(--background)', 
                    border: '1px solid var(--border)',
                    borderRadius: '6px'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line 
                  type="monotone" 
                  dataKey="Success" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={{ fill: '#22c55e', r: 4 }}
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="Failed" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', r: 4 }}
                  connectNulls
                />
                <Line 
                  type="monotone" 
                  dataKey="Pending" 
                  stroke="#eab308" 
                  strokeWidth={2}
                  dot={{ fill: '#eab308', r: 4 }}
                  connectNulls
                />
              </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        )}

        <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg relative">
          <div className="px-4 md:px-6 py-4 border-b dark:border-gray-800 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Purchases</h2>
            <select 
              value={typeFilter} 
              onChange={(e) => setTypeFilter(e.target.value)}
              className="border rounded px-3 py-1 bg-white dark:bg-zinc-900 text-gray-700 dark:text-gray-300 text-sm"
            >
              <option value="all">All Types</option>
              <option value="course">Courses</option>
              <option value="shop">Shop Orders</option>
              <option value="custom_song">Custom Songs</option>
            </select>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6"><TableSkeleton rows={5} columns={6} /></div>
            ) : (
              <table className="w-full">
                <thead className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                  <tr>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Type</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Customer</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Item</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Amount</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Date</th>
                    <th className="text-right py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedPurchases.map((purchase) => (
                    <tr key={purchase.id} className="border-b dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-900">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {purchase.type === 'course' && <BookOpen className="w-4 h-4 text-purple-500" />}
                          {purchase.type === 'shop' && <Package className="w-4 h-4 text-blue-500" />}
                          {purchase.type === 'custom_song' && <Music className="w-4 h-4 text-orange-500" />}
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            purchase.type === 'course' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' :
                            purchase.type === 'shop' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' :
                            'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                          }`}>
                            {purchase.type === 'course' ? 'Course' : purchase.type === 'shop' ? 'Gift' : 'Song'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{purchase.customerName || 'No Name'}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{purchase.customerEmail}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">{purchase.title}</div>
                          {purchase.type === 'course' && purchase.course?.level && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{purchase.course.level}</div>
                          )}
                          {purchase.type === 'shop' && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">{purchase.items?.length || 0} item(s)</div>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900 dark:text-white">₹{(purchase.amount || 0).toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6">
                        {editingId === purchase.id ? (
                          <select
                            value={editingStatus}
                            onChange={(e) => setEditingStatus(e.target.value)}
                            className="px-2 py-1 text-xs border dark:border-gray-700 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-200"
                          >
                            {purchase.type === 'course' ? (
                              <>
                                <option value="pending">Pending</option>
                                <option value="completed">Completed</option>
                                <option value="failed">Failed</option>
                                <option value="refunded">Refunded</option>
                              </>
                            ) : purchase.type === 'custom_song' ? (
                              <>
                                <option value="pending">Pending</option>
                                <option value="in_progress">Processing</option>
                                <option value="ready">Preview Ready</option>
                                <option value="completed">Paid</option>
                                <option value="failed">Failed</option>
                              </>
                            ) : (
                              <>
                                <option value="pending">Pending</option>
                                <option value="paid">Paid</option>
                                <option value="cod">COD</option>
                                <option value="failed">Failed</option>
                                <option value="cancelled">Cancelled</option>
                              </>
                            )}
                          </select>
                        ) : (
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            (purchase.status === 'completed' || purchase.paymentStatus === 'paid') 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : purchase.status === 'ready'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : purchase.status === 'in_progress'
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : (purchase.status === 'pending' || purchase.paymentStatus === 'pending')
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : (purchase.status === 'failed' || purchase.paymentStatus === 'failed')
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : purchase.paymentStatus === 'cod'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {purchase.type === 'custom_song' ? (
                              purchase.status === 'in_progress' ? 'Processing' :
                              purchase.status === 'ready' ? 'Preview Ready' :
                              purchase.status === 'completed' ? 'Paid' :
                              purchase.status === 'failed' ? 'Failed' : 'Pending'
                            ) : (
                              purchase.paymentStatus === 'cod' ? 'COD' : 
                              purchase.paymentStatus === 'paid' ? 'Paid' :
                              purchase.status || purchase.paymentStatus
                            )}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="text-gray-900 dark:text-white">{new Date(purchase.createdAt).toLocaleDateString()}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">{new Date(purchase.createdAt).toLocaleTimeString()}</div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        {editingId === purchase.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleSaveStatus(purchase.id, purchase.type)}
                              className="text-green-600 hover:text-green-700"
                            >
                              <Check className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingId(null)
                                setEditingStatus('')
                              }}
                              className="text-gray-600 hover:text-gray-700"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setEditingId(purchase.id)
                              setEditingStatus(purchase.type === 'shop' ? purchase.paymentStatus : purchase.status)
                            }}
                            className="text-blue-600 hover:text-blue-700"
                          >
                            <Edit3 className="w-4 h-4" />
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
        </div>

        {!isLoading && purchases.length === 0 && (
          <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg">
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No purchases found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}