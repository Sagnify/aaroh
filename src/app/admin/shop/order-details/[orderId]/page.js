'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { ArrowLeft, Package, User, Calendar, Music, ExternalLink, Sparkles, Phone, Mail, MapPin, Truck, CheckCircle, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

export default function OrderDetailsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trackingInput, setTrackingInput] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    fetchOrder()
  }, [session, status, router, params.orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/shop/orders/${params.orderId}`)
      const data = await response.json()
      
      if (data.success) {
        setOrder(data.order)
        document.title = `Order #${data.order.id.slice(0, 8)} | Aaroh Admin`
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateTracking = async () => {
    if (!trackingInput.trim()) return
    setUpdating(true)
    try {
      const response = await fetch(`/api/shop/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId: trackingInput, status: 'shipped' })
      })
      const data = await response.json()
      
      if (data.success) {
        alert(data.message || 'Order shipped and customer notified via email!')
        fetchOrder()
        setTrackingInput('')
      }
    } catch (error) {
      console.error('Error updating tracking:', error)
      alert('Failed to update tracking')
    } finally {
      setUpdating(false)
    }
  }

  const handleUpdateStatus = async (status) => {
    setUpdating(true)
    try {
      await fetch(`/api/shop/orders/${params.orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchOrder()
    } catch (error) {
      console.error('Error updating status:', error)
    } finally {
      setUpdating(false)
    }
  }

  const getSongDisplay = (item) => {
    if (!item.songType || !item.songData) {
      return <span className="text-gray-500 text-sm">No song selected</span>
    }

    const songData = item.songData

    switch (item.songType) {
      case 'spotify':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Music className="w-4 h-4 text-green-500" />
              <span className="font-medium text-sm">Spotify Track</span>
            </div>
            <div className="text-sm text-gray-600">
              <div><strong>Song:</strong> {songData.name}</div>
              <div><strong>Artist:</strong> {songData.artists?.map(a => a.name).join(', ')}</div>
              {songData.external_urls?.spotify && (
                <a 
                  href={songData.external_urls.spotify} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline flex items-center gap-1 mt-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Spotify
                </a>
              )}
            </div>
          </div>
        )
      
      case 'link':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-4 h-4 text-blue-500" />
              <span className="font-medium text-sm">External Link</span>
            </div>
            <div className="text-sm text-gray-600">
              <a 
                href={songData.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {songData.url}
              </a>
            </div>
          </div>
        )
      
      case 'library':
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              <span className="font-medium text-sm">Custom Song from Library</span>
            </div>
            <div className="text-sm text-gray-600">
              <div><strong>Occasion:</strong> {songData.occasion}</div>
              <div><strong>Style:</strong> {songData.style} • {songData.mood}</div>
              <div><strong>Delivery:</strong> {songData.deliveryType === 'express' ? 'Express (3 days)' : 'Standard (7 days)'}</div>
              <div><strong>Price:</strong> ₹{songData.amount?.toLocaleString()}</div>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-sm text-gray-600">
            <strong>Type:</strong> {item.songType}
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="pt-16 dark:bg-black min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-zinc-200 rounded w-1/3"></div>
            <div className="h-64 bg-zinc-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="pt-16 dark:bg-black min-h-screen">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Button onClick={() => router.back()} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Order not found</h2>
              <p className="text-gray-600 dark:text-gray-400">The order you're looking for doesn't exist.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 dark:bg-black min-h-screen">
      <div className="max-w-4xl mx-auto px-0 md:px-6 py-4 md:py-8">
        <div className="px-3 md:px-0">
          <Button onClick={() => router.back()} variant="outline" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Orders
          </Button>
        </div>

        <div className="space-y-6">
          {/* Order Header */}
          <Card className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Package className="w-6 h-6 text-blue-500" />
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Order #{order.id.slice(0, 8)}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    order.status === 'delivered' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' :
                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                    order.status === 'confirmed' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' :
                    order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                    'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                  }`}>
                    {order.status.toUpperCase()}
                  </span>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                    order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  }`}>
                    {order.paymentMethod === 'cod' ? 'COD' : 'PAID'}
                  </span>
                </div>
              </div>
              
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Calendar className="w-4 h-4" />
                    <span>Order Date</span>
                  </div>
                  <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                </div>
                <div>
                  <div className="flex items-center gap-2 text-gray-500 mb-1">
                    <Package className="w-4 h-4" />
                    <span>Items</span>
                  </div>
                  <p className="font-semibold">{Array.isArray(order.items) ? order.items.length : 1} items</p>
                </div>
                <div>
                  <div className="text-gray-500 mb-1">Total Amount</div>
                  <p className="text-2xl font-bold text-blue-600">₹{order.amount.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Customer Information */}
          <Card className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-500" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Customer Information</h2>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Contact Details</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span>{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span>{order.customerEmail}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{order.customerPhone}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">Shipping Address</h3>
                  <div className="flex items-start gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                    <div>
                      <p className="font-medium">{order.shippingAddress.name}</p>
                      <p>{order.shippingAddress.address}</p>
                      <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Order Items */}
          <Card className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Items</h2>
              
              {Array.isArray(order.items) ? (
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="border dark:border-zinc-800 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-white">{item.productName}</h3>
                          <p className="text-sm text-gray-600">Variant: {item.variant}</p>
                          <p className="text-sm text-gray-600">For: {item.recipientName}</p>
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</p>
                      </div>
                      
                      {item.customText && (
                        <div className="mb-3 p-3 bg-gray-50 dark:bg-zinc-900 rounded">
                          <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Custom Message:</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{item.customText}</p>
                        </div>
                      )}
                      
                      <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-800">
                        <h4 className="font-medium text-purple-900 dark:text-purple-200 mb-2">Song Selection</h4>
                        {getSongDisplay(item)}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400 italic">Legacy order format</p>
              )}
            </CardContent>
          </Card>

          {/* Tracking Information */}
          {order.trackingId && (
            <Card className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
              <CardContent className="p-4 md:p-6">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tracking Information</h2>
                <div className="flex items-center gap-3">
                  <code className="bg-gray-100 dark:bg-zinc-800 px-3 py-2 rounded font-mono text-sm">
                    {order.trackingId}
                  </code>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => window.open(`https://www.google.com/search?q=${order.trackingId}+tracking`, '_blank')}
                  >
                    Track Package
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Order Management Actions */}
          <Card className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
            <CardContent className="p-4 md:p-6">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Order Management</h2>
              
              <div className="space-y-4">
                {/* Add Tracking */}
                {order.status === 'confirmed' && !order.trackingId && (
                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <h3 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">Add Tracking Information</h3>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Enter tracking ID"
                        value={trackingInput}
                        onChange={(e) => setTrackingInput(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        onClick={handleUpdateTracking}
                        disabled={!trackingInput.trim() || updating}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                      >
                        <Truck className="w-4 h-4 mr-2" />
                        Ship Order
                      </Button>
                    </div>
                  </div>
                )}

                {/* Mark as Delivered */}
                {order.status === 'shipped' && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="font-medium text-blue-800 dark:text-blue-200 mb-2">Mark as Delivered</h3>
                    <Button 
                      onClick={() => handleUpdateStatus('delivered')}
                      disabled={updating}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="w-4 h-4 mr-2" />
                      Mark Delivered
                    </Button>
                  </div>
                )}

                {/* Contact Customer */}
                <div className="grid md:grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
                    onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)}!%20Your%20order%20%23${order.id.slice(0, 8)}%20${order.trackingId ? `has been shipped. Tracking ID: ${order.trackingId}` : 'update:'}`, '_blank')}
                  >
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                    WhatsApp
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    onClick={() => window.open(`mailto:${order.customerEmail}?subject=Order%20Update%20%23${order.id.slice(0, 8)}`, '_blank')}
                  >
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}