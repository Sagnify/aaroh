'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, ShoppingBag, Clock, CheckCircle, Truck, X, ArrowRight, Calendar, CreditCard, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function OrdersPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [expandedOrders, setExpandedOrders] = useState(new Set())

  useEffect(() => {
    document.title = 'My Orders | Aaroh'
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/orders')
    } else if (status === 'authenticated') {
      fetchOrders()
    }
  }, [status])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/shop/orders')
      const data = await response.json()
      setOrders(data.orders || [])
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'confirmed': return <Package className="w-4 h-4 text-blue-500" />
      case 'shipped': return <Truck className="w-4 h-4 text-purple-500" />
      case 'delivered': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'cancelled': return <X className="w-4 h-4 text-red-500" />
      default: return <Clock className="w-4 h-4 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'shipped': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'delivered': return 'bg-green-100 text-green-700 border-green-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPaymentIcon = (paymentMethod, paymentStatus) => {
    if (paymentMethod === 'cod') return '💵'
    if (paymentStatus === 'paid') return '✅'
    return '⏳'
  }

  const toggleOrderExpansion = (orderId, e) => {
    e.stopPropagation()
    setExpandedOrders(prev => {
      const newSet = new Set(prev)
      if (newSet.has(orderId)) {
        newSet.delete(orderId)
      } else {
        newSet.add(orderId)
      }
      return newSet
    })
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-gray-600">Track and manage your shop orders</p>
        </motion.div>

        {orders.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
              <p className="text-gray-500 mb-6">Start shopping to see your orders here!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
              >
                <Card 
                  className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden"
                >
                  <CardContent className="p-0">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-4 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-lg flex items-center justify-center">
                            <Package className="w-5 h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-lg">#{order.id.slice(0, 8)}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                            <CreditCard className="w-3 h-3" />
                            <span>{getPaymentIcon(order.paymentMethod, order.paymentStatus)} {order.paymentMethod === 'cod' ? 'COD' : order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1">{order.customerName}</p>
                          <p className="text-sm text-gray-600">{order.items?.length || 0} item(s)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Items section */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-4">
                          <div 
                            className="bg-gray-50 rounded-lg p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={(e) => toggleOrderExpansion(order.id, e)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">
                                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-gray-600">
                                  {order.items[0].productName}{order.items.length > 1 ? ` and ${order.items.length - 1} more` : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-blue-600 font-medium">
                                  {expandedOrders.has(order.id) ? 'Hide' : 'Show'} Details
                                </span>
                                {expandedOrders.has(order.id) ? 
                                  <ChevronUp className="w-4 h-4 text-blue-600" /> : 
                                  <ChevronDown className="w-4 h-4 text-blue-600" />
                                }
                              </div>
                            </div>
                          </div>
                          
                          {/* Expanded items */}
                          {expandedOrders.has(order.id) && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="mt-2 space-y-2"
                            >
                              {order.items.map((item, index) => (
                                <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <h4 className="font-medium text-gray-900 text-sm">{item.productName}</h4>
                                      <p className="text-xs text-gray-600 mt-1">For: {item.recipientName}</p>
                                      <p className="text-xs text-gray-600">Variant: {item.variant}</p>
                                      {item.customText && (
                                        <p className="text-xs text-gray-600 mt-1 italic">Message: "{item.customText}"</p>
                                      )}
                                    </div>
                                    <span className="font-bold text-sm text-gray-900">₹{item.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Tracking info */}
                      {order.trackingId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center gap-2">
                            <Truck className="w-4 h-4 text-blue-600" />
                            <span className="text-sm font-medium text-blue-900">Tracking ID:</span>
                            <code className="text-xs bg-white px-2 py-1 rounded border font-mono text-blue-800">
                              {order.trackingId}
                            </code>
                          </div>
                        </div>
                      )}

                      {/* Action button */}
                      <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </div>
                        <button 
                          onClick={() => router.push(`/shop/orders/${order.id}`)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer"
                        >
                          <span className="text-sm font-medium">View Details</span>
                          <ArrowRight className="w-4 h-4 hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
