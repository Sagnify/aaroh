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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-20 md:pt-28 pb-20 px-3 md:px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-8"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Package className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">My Orders</h1>
          <p className="text-sm md:text-base text-gray-600">Track and manage your shop orders</p>
        </motion.div>

        {orders.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl rounded-2xl mx-2 md:mx-0">
            <CardContent className="p-8 md:p-12 text-center">
              <ShoppingBag className="w-12 h-12 md:w-16 md:h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg md:text-xl font-semibold text-gray-700 mb-2">No orders yet</h3>
              <p className="text-sm md:text-base text-gray-500 mb-6">Start shopping to see your orders here!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4 md:space-y-6">
            {orders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2 }}
                transition={{ duration: 0.2 }}
                className="mx-2 md:mx-0"
              >
                <Card 
                  className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-lg hover:shadow-2xl transition-all duration-300 group overflow-hidden rounded-2xl"
                >
                  <CardContent className="p-0">
                    {/* Header with gradient */}
                    <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-3 md:p-4 border-b border-gray-100">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 md:w-10 md:h-10 bg-gradient-to-br from-blue-500 to-teal-500 rounded-xl flex items-center justify-center">
                            <Package className="w-4 h-4 md:w-5 md:h-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900 text-base md:text-lg">#{order.id.slice(0, 8)}</h3>
                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-600">
                              <Calendar className="w-3 h-3" />
                              {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric' 
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="text-left sm:text-right">
                          <p className="text-xl md:text-2xl font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
                          <div className="flex items-center gap-1 text-xs md:text-sm text-gray-600 mt-1">
                            <CreditCard className="w-3 h-3" />
                            <span>{getPaymentIcon(order.paymentMethod, order.paymentStatus)} {order.paymentMethod === 'cod' ? 'COD' : order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-3 md:p-4">
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 mb-4">
                        <div>
                          <p className="font-semibold text-gray-900 mb-1 text-sm md:text-base">{order.customerName}</p>
                          <p className="text-xs md:text-sm text-gray-600">{order.items?.length || 0} item(s)</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(order.status)}
                          <span className={`px-2 md:px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {/* Items section */}
                      {order.items && order.items.length > 0 && (
                        <div className="mb-4">
                          <div 
                            className="bg-gray-50 rounded-xl p-3 cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={(e) => toggleOrderExpansion(order.id, e)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900">
                                  {order.items.length} item{order.items.length > 1 ? 's' : ''}
                                </p>
                                <p className="text-xs text-gray-600 truncate">
                                  {order.items[0].productName}{order.items.length > 1 ? ` and ${order.items.length - 1} more` : ''}
                                </p>
                              </div>
                              <div className="flex items-center gap-2 ml-2">
                                <span className="text-xs text-blue-600 font-medium hidden sm:inline">
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
                                <div key={index} className="bg-white border border-gray-200 rounded-xl p-3">
                                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                    <div className="flex-1 min-w-0">
                                      <h4 className="font-medium text-gray-900 text-sm break-words">{item.productName}</h4>
                                      <p className="text-xs text-gray-600 mt-1">For: {item.recipientName}</p>
                                      <p className="text-xs text-gray-600">Variant: {item.variant}</p>
                                      {item.customText && (
                                        <p className="text-xs text-gray-600 mt-1 italic break-words">Message: "{item.customText}"</p>
                                      )}
                                    </div>
                                    <span className="font-bold text-sm text-gray-900 self-start">₹{item.price.toLocaleString()}</span>
                                  </div>
                                </div>
                              ))}
                            </motion.div>
                          )}
                        </div>
                      )}

                      {/* Tracking info */}
                      {order.trackingId && (
                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <div className="flex items-center gap-2">
                              <Truck className="w-4 h-4 text-blue-600" />
                              <span className="text-sm font-medium text-blue-900">Tracking ID:</span>
                            </div>
                            <code className="text-xs bg-white px-2 py-1 rounded-lg border font-mono text-blue-800 break-all">
                              {order.trackingId}
                            </code>
                          </div>
                        </div>
                      )}

                      {/* Action button */}
                      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 pt-2 border-t border-gray-100">
                        <div className="text-xs text-gray-500">
                          {order.shippingAddress?.city}, {order.shippingAddress?.state}
                        </div>
                        <button 
                          onClick={() => router.push(`/shop/orders/${order.id}`)}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors cursor-pointer self-start sm:self-auto"
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
