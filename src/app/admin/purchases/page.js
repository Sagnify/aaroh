"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, User, BookOpen, Calendar, IndianRupee } from 'lucide-react'

export default function ViewPurchases() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [purchases, setPurchases] = useState([])

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
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
        <div className="relative">
          <div className="w-16 h-16 bg-[#a0303f] rounded-full flex items-center justify-center mx-auto animate-pulse">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Purchases</h1>
          <p className="text-gray-600">View all course purchases and transactions</p>
        </div>

        <div className="bg-white border shadow-sm rounded-lg">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900">All Purchases</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-gray-50">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">User</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Course</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Amount</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Status</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900">Date</th>
                </tr>
              </thead>
              <tbody>
                {purchases.map((purchase) => (
                  <tr key={purchase.id} className="border-b hover:bg-gray-50">
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{purchase.user?.name || 'No Name'}</div>
                        <div className="text-sm text-gray-500">{purchase.user?.email}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="font-medium text-gray-900">{purchase.course?.title}</div>
                        <div className="text-sm text-gray-500">{purchase.course?.level}</div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">₹{purchase.amount.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full capitalize ${
                        purchase.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : purchase.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {purchase.status}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div>
                        <div className="text-gray-900">{new Date(purchase.createdAt).toLocaleDateString()}</div>
                        <div className="text-sm text-gray-500">{new Date(purchase.createdAt).toLocaleTimeString()}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {purchases.length === 0 && (
          <div className="bg-white border shadow-sm rounded-lg">
            <div className="text-center py-12">
              <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No purchases found</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}