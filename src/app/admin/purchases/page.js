"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, User, BookOpen, Calendar, IndianRupee, Edit3, Check, X, Package, Music } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TableSkeleton } from '@/components/AdminSkeleton'

export default function ViewPurchases() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [purchases, setPurchases] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editingStatus, setEditingStatus] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState('all')

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
        endpoint = `/api/admin/custom-songs/${purchaseId}`
        updateField = 'paymentStatus'
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

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Purchases</h1>
          <p className="text-gray-600 dark:text-gray-400">View all purchases: courses, gifts, and custom songs</p>
        </div>

        <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg relative">
          <div className="px-6 py-4 border-b dark:border-gray-800 flex justify-between items-center">
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
                  {purchases.filter(purchase => typeFilter === 'all' || purchase.type === typeFilter).map((purchase) => (
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
                        <div className="font-medium text-gray-900 dark:text-white">₹{purchase.amount.toLocaleString()}</div>
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
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                            (purchase.status === 'completed' || purchase.paymentStatus === 'paid') 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                              : (purchase.status === 'pending' || purchase.paymentStatus === 'pending')
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : (purchase.status === 'failed' || purchase.paymentStatus === 'failed')
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : purchase.paymentStatus === 'cod'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                          }`}>
                            {purchase.paymentStatus === 'cod' ? 'COD' : 
                             purchase.paymentStatus === 'paid' ? 'Paid' :
                             purchase.status || purchase.paymentStatus}
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
                              setEditingStatus(purchase.type === 'course' ? purchase.status : purchase.paymentStatus)
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