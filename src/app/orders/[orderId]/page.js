'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Package, MapPin, Truck, X, ExternalLink, AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Image from 'next/image'

export default function OrderDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCancelDialog, setShowCancelDialog] = useState(false)
  const [cancelReason, setCancelReason] = useState('')

  useEffect(() => {
    document.title = 'Order Details | Aaroh'
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/orders')
    } else if (status === 'authenticated') {
      fetchOrder()
    }
  }, [status])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/shop/orders/${params.orderId}`)
      const data = await response.json()
      setOrder(data.order)
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelOrder = async () => {
    if (!cancelReason.trim()) {
      alert('Please provide a reason for cancellation')
      return
    }
    try {
      const response = await fetch(`/api/shop/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled', cancelReason })
      })
      if (response.ok) {
        fetchOrder()
        setShowCancelDialog(false)
        setCancelReason('')
      }
    } catch (error) {
      console.error('Error cancelling order:', error)
    }
  }

  if (loading || status === 'loading') {
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700'
      case 'confirmed': return 'bg-blue-100 text-blue-700'
      case 'shipped': return 'bg-purple-100 text-purple-700'
      case 'delivered': return 'bg-green-100 text-green-700'
      case 'cancelled': return 'bg-red-100 text-red-700'
      default: return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <Button variant="outline" onClick={() => router.push('/orders')} className="mb-4">
            ← Back to Orders
          </Button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
              <p className="text-gray-600 mt-1">Placed on {new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusColor(order.status)}`}>
              {order.status.toUpperCase()}
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            {/* Order Items */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Package className="w-5 h-5" />
                  Order Items
                </h2>
                <div className="space-y-4">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex gap-4 pb-4 border-b last:border-0">
                      <div className="relative w-20 h-20 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.product.images?.[0] ? (
                          <Image src={item.product.images[0]} alt={item.product.name} fill className="object-cover" />
                        ) : (
                          <Package className="w-10 h-10 text-blue-300 absolute inset-0 m-auto" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
                        <p className="text-sm text-gray-600">For: {item.recipientName}</p>
                        {item.customText && (
                          <p className="text-xs text-gray-500 mt-1">Message: {item.customText}</p>
                        )}
                        <p className="text-sm font-bold text-blue-600 mt-2">₹{item.product.price}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Shipping Address
                </h2>
                <div className="text-gray-700 space-y-1">
                  <p className="font-semibold">{order.shippingAddress.name}</p>
                  <p className="text-sm">{order.shippingAddress.address}</p>
                  <p className="text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                  <p className="text-sm mt-2">Phone: {order.shippingAddress.phone}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    Tracking Information
                  </h2>
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Tracking Number</p>
                      <p className="font-semibold text-gray-900">{order.trackingNumber}</p>
                    </div>
                    {order.trackingUrl && (
                      <Button
                        variant="outline"
                        onClick={() => window.open(order.trackingUrl, '_blank')}
                        className="w-full"
                      >
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Track Shipment
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Cancel Reason */}
            {order.status === 'cancelled' && order.cancelReason && (
              <Card className="bg-red-50 border-red-200 shadow-xl">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-red-900 mb-2 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5" />
                    Cancellation Reason
                  </h2>
                  <p className="text-red-700">{order.cancelReason}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Order Summary & Actions */}
          <div className="space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">₹{order.totalAmount}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between text-lg">
                    <span className="font-bold">Total</span>
                    <span className="font-bold text-blue-600">₹{order.totalAmount}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                {order.status === 'pending' && (
                  <Button
                    variant="outline"
                    className="w-full text-red-600 border-red-300 hover:bg-red-50"
                    onClick={() => setShowCancelDialog(true)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel Order
                  </Button>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Cancel Dialog */}
        {showCancelDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="bg-white max-w-md w-full">
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Cancel Order</h3>
                <p className="text-gray-600 mb-4">Please provide a reason for cancellation:</p>
                <Textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter cancellation reason..."
                  rows={4}
                  className="mb-4"
                />
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowCancelDialog(false)
                      setCancelReason('')
                    }}
                    className="flex-1"
                  >
                    Keep Order
                  </Button>
                  <Button
                    onClick={handleCancelOrder}
                    className="flex-1 bg-red-600 hover:bg-red-700"
                  >
                    Cancel Order
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
