'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import Loader from '@/components/Loader'
import { motion } from 'framer-motion'
import { Package, Truck, CheckCircle, Clock, X, MapPin, Phone, Mail, CreditCard, Calendar, User, ShoppingBag, ExternalLink, Copy, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

function OrderTrackingContent() {

  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trackingId, setTrackingId] = useState('')
  const [showSuccess, setShowSuccess] = useState(false)
  const [trackingInfo, setTrackingInfo] = useState(null)
  const [copiedTrackingId, setCopiedTrackingId] = useState(false)

  useEffect(() => {
    if (searchParams.get('success') === 'true') {
      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 5000)
    }
  }, [searchParams])

  useEffect(() => {
    document.title = 'Track Order | Aaroh Story Shop'
    if (status === 'authenticated') {
      fetchOrder()
    }
  }, [status, params.orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/shop/orders/${params.orderId}`)
      const data = await response.json()
      if (data.success) {
        setOrder(data.order)
        setTrackingId(data.order.trackingId || '')
        
        // Fetch tracking info if tracking ID exists
        if (data.order.trackingId) {
          fetchTrackingInfo(data.order.trackingId)
        }
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchTrackingInfo = async (trackingId) => {
    try {
      const response = await fetch(`/api/shop/tracking?trackingId=${trackingId}`)
      const data = await response.json()
      if (data.success) {
        setTrackingInfo(data.tracking)
      }
    } catch (error) {
      console.error('Error fetching tracking info:', error)
    }
  }

  const handleCancelOrder = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return
    
    try {
      const response = await fetch(`/api/shop/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancel' })
      })
      const data = await response.json()
      if (data.success) {
        fetchOrder()
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-5 h-5 text-yellow-500" />
      case 'confirmed': return <Package className="w-5 h-5 text-blue-500" />
      case 'shipped': return <Truck className="w-5 h-5 text-purple-500" />
      case 'delivered': return <CheckCircle className="w-5 h-5 text-green-500" />
      case 'cancelled': return <X className="w-5 h-5 text-red-500" />
      default: return <Clock className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Order Placed'
      case 'confirmed': return 'Order Confirmed'
      case 'shipped': return 'Shipped'
      case 'delivered': return 'Delivered'
      case 'cancelled': return 'Cancelled'
      default: return 'Unknown'
    }
  }

  const copyTrackingId = async () => {
    if (order?.trackingId) {
      await navigator.clipboard.writeText(order.trackingId)
      setCopiedTrackingId(true)
      setTimeout(() => setCopiedTrackingId(false), 2000)
    }
  }

  const getPaymentStatusColor = (paymentStatus, paymentMethod) => {
    if (paymentMethod === 'cod') return 'bg-orange-100 text-orange-700 border-orange-200'
    if (paymentStatus === 'paid') return 'bg-green-100 text-green-700 border-green-200'
    if (paymentStatus === 'failed') return 'bg-red-100 text-red-700 border-red-200'
    return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl p-8">
          <p className="text-gray-600">Order not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 pb-20 px-6">
      <div className="max-w-6xl mx-auto">
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-green-100 border border-green-300 rounded-lg text-green-700"
          >
            🎉 Order placed successfully! You'll receive confirmation emails shortly.
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Order #{order.id.slice(0, 8)}</h1>
          <div className="flex items-center justify-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span>Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', { 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}</span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Order Status */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl">
              <CardContent className="p-0">
                {/* Status Header */}
                <div className="bg-gradient-to-r from-blue-50 to-teal-50 p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border-2 border-blue-200 rounded-xl flex items-center justify-center shadow-sm">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h2 className="text-2xl font-bold text-gray-900">{getStatusText(order.status)}</h2>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-IN', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-3xl font-bold text-gray-900">₹{order.amount.toLocaleString()}</p>
                      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.paymentStatus, order.paymentMethod)}`}>
                        <CreditCard className="w-4 h-4" />
                        {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                         order.paymentStatus === 'paid' ? 'Paid Online' : 'Payment Pending'}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-6">

                {/* Status Timeline */}
                <div className="space-y-4">
                  {['confirmed', 'shipped', 'delivered'].map((status, index) => {
                    const isActive = ['confirmed', 'shipped', 'delivered'].indexOf(order.status) >= index
                    const isCurrent = order.status === status
                    
                    return (
                      <div key={status} className={`flex items-center gap-4 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          isActive ? 'bg-blue-500 text-white' : 'bg-gray-200'
                        }`}>
                          {isActive ? '✓' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCurrent ? 'text-blue-600' : ''}`}>
                            {getStatusText(status)}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Tracking Information */}
                {order.trackingId && (
                  <div className="mt-6">
                    <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-xl p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <Truck className="w-5 h-5 text-white" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">Package Tracking</h3>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white rounded-lg p-4 border">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-600">Tracking ID</span>
                            <button 
                              onClick={copyTrackingId}
                              className="text-blue-600 hover:text-blue-700 transition-colors"
                            >
                              {copiedTrackingId ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                          <code className="text-sm bg-gray-100 px-3 py-2 rounded font-mono block">{order.trackingId}</code>
                        </div>
                        
                        {trackingInfo && (
                          <div className="bg-white rounded-lg p-4 border">
                            <span className="text-sm font-medium text-gray-600 block mb-2">Courier Service</span>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-gray-900">{trackingInfo.courier}</span>
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                                {trackingInfo.status.replace('_', ' ')}
                              </span>
                            </div>
                            {trackingInfo.location && (
                              <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {trackingInfo.location}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                      
                      <Button 
                        onClick={() => window.open(trackingInfo?.trackingUrl || `https://www.google.com/search?q=${order.trackingId}+tracking`, '_blank')}
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Track Your Package
                      </Button>
                    </div>
                  </div>
                )}

                {/* Cancel Order */}
                {order.status === 'confirmed' && (
                  <div className="mt-6 pt-6 border-t">
                    <Button
                      onClick={handleCancelOrder}
                      variant="outline"
                      className="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Cancel Order
                    </Button>
                  </div>
                )}
                </div>
              </CardContent>
            </Card>

            {/* Order Items */}
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-green-50 to-teal-50 p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-teal-500 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Order Items</h3>
                      <p className="text-sm text-gray-600">{order.items.length} item{order.items.length > 1 ? 's' : ''} in this order</p>
                    </div>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    {order.items.map((item, index) => (
                      <motion.div 
                        key={index} 
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg flex items-center justify-center">
                                <ShoppingBag className="w-6 h-6 text-blue-600" />
                              </div>
                              <div className="flex-1">
                                <h4 className="font-bold text-gray-900 text-lg mb-2">{item.productName}</h4>
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">For: <span className="font-medium">{item.recipientName}</span></span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Package className="w-4 h-4 text-gray-500" />
                                    <span className="text-sm text-gray-600">Variant: <span className="font-medium">{item.variant}</span></span>
                                  </div>
                                  {item.customText && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-2">
                                      <p className="text-sm text-blue-900 italic">"{item.customText}"</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                          <div className="text-right ml-4">
                            <p className="text-2xl font-bold text-gray-900">₹{item.price.toLocaleString()}</p>
                            <p className="text-sm text-gray-500">per item</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary & Address */}
          <div className="space-y-6">
            <Card className="bg-white/95 backdrop-blur-sm border border-gray-200/50 shadow-xl">
              <CardContent className="p-0">
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Order Summary</h3>
                  </div>
                </div>
                
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Total Amount</span>
                        <span className="text-3xl font-bold text-gray-900">₹{order.amount.toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="bg-gradient-to-r from-gray-50 to-white border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-600 font-medium">Payment Status</span>
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium border ${getPaymentStatusColor(order.paymentStatus, order.paymentMethod)}`}>
                          <CreditCard className="w-4 h-4" />
                          {order.paymentMethod === 'cod' ? 'Cash on Delivery' : 
                           order.paymentStatus === 'paid' ? 'Paid Online' : 'Payment Pending'}
                        </div>
                      </div>
                    </div>
                    
                    {order.razorpayPaymentId && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <span className="text-green-700 font-medium">Payment ID</span>
                          <code className="text-xs bg-white px-3 py-2 rounded border font-mono text-green-800">
                            {order.razorpayPaymentId}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  Delivery Address
                </h3>
                <div className="space-y-2 text-sm text-gray-700">
                  <p className="font-semibold">{order.shippingAddress.name}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <Phone className="w-4 h-4 text-blue-500" />
                    <span>{order.shippingAddress.phone}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function OrderTrackingPage() {
  return (
    <Suspense fallback={<Loader />}>
      <OrderTrackingContent />
    </Suspense>
  )
}