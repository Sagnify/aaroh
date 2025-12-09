'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, Music, ShoppingBag, Eye, Check, CreditCard, Upload, Save, X, ChevronDown, ChevronUp, MessageCircle, Mail, CheckCircle, Phone } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProductThumbnailCarousel from '@/components/ProductThumbnailCarousel'
import ImageUpload from '@/components/ImageUpload'
import Pagination from '@/components/Pagination'

export default function AdminShopPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('products')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [customSongs, setCustomSongs] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#8B5CF6')
  const [loading, setLoading] = useState(true)
  const [orderFilter, setOrderFilter] = useState('all')
  const [songFilter, setSongFilter] = useState('all')
  const [trackingInputs, setTrackingInputs] = useState({})
  const [expandedOrders, setExpandedOrders] = useState({})
  const [expandedSongs, setExpandedSongs] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [orderFilter, songFilter, activeTab])

  useEffect(() => {
    document.title = 'Shop Management | Aaroh Admin'
    fetchProducts()
    fetchOrders()
    fetchCustomSongs()
    fetchCategories()
    fetchTags()
  }, [])

  const fetchProducts = async () => {
    const response = await fetch('/api/shop/products')
    const data = await response.json()
    setProducts(data.products || [])
    setLoading(false)
  }

  const fetchOrders = async () => {
    const response = await fetch('/api/shop/orders')
    const data = await response.json()
    setOrders(data.orders || [])
  }

  const fetchCustomSongs = async () => {
    const response = await fetch('/api/shop/custom-songs')
    const data = await response.json()
    setCustomSongs(data.songs || [])
  }

  const fetchCategories = async () => {
    const response = await fetch('/api/shop/categories')
    const data = await response.json()
    setCategories(data.categories || [])
  }

  const fetchTags = async () => {
    const response = await fetch('/api/shop/tags')
    const data = await response.json()
    setTags(data.tags || [])
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    try {
      await fetch('/api/shop/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName })
      })
      setNewCategoryName('')
      fetchCategories()
    } catch (error) {
      console.error('Error creating category:', error)
    }
  }

  const handleDeleteCategory = async (id) => {
    if (!confirm('Delete this category?')) return
    try {
      await fetch(`/api/shop/categories/${id}`, { method: 'DELETE' })
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      await fetch('/api/shop/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newTagName, color: newTagColor })
      })
      setNewTagName('')
      setNewTagColor('#8B5CF6')
      fetchTags()
    } catch (error) {
      console.error('Error creating tag:', error)
    }
  }

  const handleDeleteTag = async (id) => {
    if (!confirm('Delete this tag?')) return
    try {
      await fetch(`/api/shop/tags/${id}`, { method: 'DELETE' })
      fetchTags()
    } catch (error) {
      console.error('Error deleting tag:', error)
    }
  }

  const handleUpdateTagColor = async (id, color) => {
    try {
      await fetch(`/api/shop/tags/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ color })
      })
      fetchTags()
    } catch (error) {
      console.error('Error updating tag color:', error)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try {
      const response = await fetch(`/api/shop/products/${id}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) fetchProducts()
    } catch (error) {
      console.error('Error deleting product:', error)
    }
  }

  const updateSongStatus = async (id, status) => {
    try {
      const response = await fetch(`/api/shop/custom-songs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      const data = await response.json()
      if (data.success) fetchCustomSongs()
    } catch (error) {
      console.error('Error updating song status:', error)
    }
  }

  const updateSongLinks = async (id, previewUrl, fullAudioUrl, posterUrl) => {
    try {
      const response = await fetch(`/api/admin/custom-songs/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          previewUrl, 
          fullAudioUrl, 
          posterUrl,
          status: previewUrl ? 'ready' : 'in_progress' 
        })
      })
      const data = await response.json()
      if (data.success) {
        fetchCustomSongs()
        alert('Links saved successfully!')
      }
    } catch (error) {
      console.error('Error updating song links:', error)
      alert('Failed to save links')
    }
  }

  const handleToggleFeatured = async (id, isFeatured) => {
    try {
      await fetch(`/api/shop/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured })
      })
      fetchProducts()
    } catch (error) {
      console.error('Error toggling featured:', error)
    }
  }

  const handleUpdateTracking = async (orderId, trackingId) => {
    try {
      await fetch(`/api/shop/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trackingId, status: 'shipped' })
      })
      fetchOrders()
      setTrackingInputs({ ...trackingInputs, [orderId]: '' })
    } catch (error) {
      console.error('Error updating tracking:', error)
    }
  }

  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      await fetch(`/api/admin/shop-orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })
      fetchOrders()
    } catch (error) {
      console.error('Error updating order status:', error)
    }
  }

  const handleDeleteOrder = async (orderId) => {
    if (!confirm('Are you sure you want to delete this order? This action cannot be undone.')) return
    try {
      const response = await fetch(`/api/admin/shop-orders/${orderId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        fetchOrders()
        alert('Order deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting order:', error)
      alert('Failed to delete order')
    }
  }

  const handleDeleteCustomSong = async (songId) => {
    if (!confirm('Are you sure you want to delete this custom song order? This action cannot be undone.')) return
    try {
      const response = await fetch(`/api/admin/custom-songs/${songId}`, { method: 'DELETE' })
      const data = await response.json()
      if (data.success) {
        fetchCustomSongs()
        alert('Custom song deleted successfully')
      }
    } catch (error) {
      console.error('Error deleting custom song:', error)
      alert('Failed to delete custom song')
    }
  }

  return (
    <div className="p-0 md:p-8 pt-20 md:pt-24">
      <div className="mb-6 md:mb-8 px-4 md:px-0">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Shop Management</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage products, orders, and custom songs</p>
      </div>

      <div className="flex gap-2 mb-6 border-b dark:border-gray-700 overflow-x-auto scrollbar-hide">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 font-medium transition-all whitespace-nowrap text-sm ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <Package className="w-4 h-4 inline mr-2" />
          Products ({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium transition-all whitespace-nowrap text-sm ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-4 py-2 font-medium transition-all whitespace-nowrap text-sm ${activeTab === 'songs' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Music className="w-4 h-4 inline mr-2" />
          Custom Songs ({customSongs.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-all whitespace-nowrap text-sm ${activeTab === 'categories' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 font-medium transition-all whitespace-nowrap text-sm ${activeTab === 'tags' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Tags ({tags.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <div className="flex justify-end mb-6 px-4 md:px-0">
            <Button
              onClick={() => router.push('/admin/shop/add-product')}

            >
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="dark:bg-zinc-950 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gray-200 dark:bg-zinc-900 rounded-lg mb-4 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-zinc-900 rounded mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-zinc-900 rounded mb-3 w-2/3 animate-pulse" />
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 dark:bg-zinc-900 rounded w-20 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-900 rounded animate-pulse" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-900 rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="dark:bg-zinc-950 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Click "Add Product" to create your first product</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="dark:bg-zinc-950 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4 overflow-hidden">
                      <ProductThumbnailCarousel 
                        variants={product.variants || []} 
                        className="w-full h-full"
                      />
                    </div>
                    {product.tags && product.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {product.tags.map((tag) => (
                          <span
                            key={tag.id}
                            className="text-white text-xs px-2 py-1 rounded-full font-semibold"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-2 flex-1">{product.name}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleToggleFeatured(product.id, !product.isFeatured)
                        }}
                        className={`text-xl ${product.isFeatured ? 'opacity-100' : 'opacity-30'}`}
                        title={product.isFeatured ? 'Remove from trending' : 'Add to trending'}
                      >
                        🔥
                      </button>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3 line-clamp-2">{product.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-blue-600">₹{product.price}</span>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => router.push(`/admin/shop/edit/${product.id}`)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDelete(product.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'orders' && (() => {
        const filteredOrders = orders.filter(order => orderFilter === 'all' || order.status === orderFilter)
        const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
        const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        return (
        <div>
          {/* Order Filters */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            <button
              onClick={() => setOrderFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                orderFilter === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
              }`}
            >
              All ({orders.length})
            </button>
            <button
              onClick={() => setOrderFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                orderFilter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
              }`}
            >
              Pending ({orders.filter(o => o.status === 'pending').length})
            </button>
            <button
              onClick={() => setOrderFilter('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                orderFilter === 'confirmed'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
              }`}
            >
              Confirmed ({orders.filter(o => o.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setOrderFilter('shipped')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                orderFilter === 'shipped'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
              }`}
            >
              Shipped ({orders.filter(o => o.status === 'shipped').length})
            </button>
            <button
              onClick={() => setOrderFilter('delivered')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                orderFilter === 'delivered'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
              }`}
            >
              Delivered ({orders.filter(o => o.status === 'delivered').length})
            </button>
            <button
              onClick={() => setOrderFilter('cancelled')}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                orderFilter === 'cancelled'
                  ? 'bg-red-500 text-white shadow-lg'
                  : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
              }`}
            >
              Cancelled ({orders.filter(o => o.status === 'cancelled').length})
            </button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="dark:bg-zinc-950 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-zinc-900 rounded w-32 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-zinc-900 rounded w-48 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-zinc-900 rounded w-24 animate-pulse" />
                      </div>
                      <div>
                        <div className="h-6 bg-gray-200 dark:bg-zinc-900 rounded w-20 mb-2 animate-pulse" />
                        <div className="h-6 bg-gray-200 dark:bg-zinc-900 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="dark:bg-zinc-950 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Orders will appear here when customers make purchases</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paginatedOrders.map((order) => (
                <Card key={order.id} className="dark:bg-zinc-950 dark:border-gray-800 hover:shadow-xl transition-all border-l-4 border-l-blue-500">
                  <CardContent className="p-6">
                    <div className={`flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-950 -mx-6 px-6 py-4 -mt-6 transition-colors ${expandedOrders[order.id] ? 'mb-4' : '-mb-6 pb-10'}`} onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                          <Package className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white text-lg">#{order.id.slice(0, 8)}</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            order.status === 'delivered' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            order.status === 'shipped' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            order.status === 'confirmed' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' :
                            order.status === 'cancelled' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' :
                            'bg-gray-100 dark:bg-zinc-900 text-gray-700 dark:text-gray-300'
                          }`}>
                            {order.status.toUpperCase()}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            order.paymentMethod === 'cod' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                          }`}>
                            {order.paymentMethod === 'cod' ? 'COD' : 'PAID'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400"><strong>Customer:</strong> {order.customerName}</p>
                            <p className="text-gray-600 dark:text-gray-400"><strong>Email:</strong> {order.customerEmail}</p>
                            <p className="text-gray-600 dark:text-gray-400"><strong>Phone:</strong> {order.customerPhone}</p>
                          </div>
                          <div>
                            <p className="text-gray-600 dark:text-gray-400"><strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                            <p className="text-gray-600 dark:text-gray-400"><strong>Items:</strong> {Array.isArray(order.items) ? order.items.length : 1}</p>
                            <p className="text-gray-600 dark:text-gray-400"><strong>Total:</strong> <span className="text-lg font-bold text-blue-600">₹{order.amount.toLocaleString()}</span></p>
                          </div>
                        </div>
                        </div>
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                        {expandedOrders[order.id] ? <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                      </div>
                    </div>
                    
                    {expandedOrders[order.id] && (
                    <>
                    {/* Order Items */}
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Items:</h4>
                      {Array.isArray(order.items) ? (
                        <div className="space-y-2">
                          {order.items.map((item, index) => (
                            <div key={index} className="flex justify-between items-center text-sm">
                              <div>
                                <span className="font-medium">{item.productName}</span>
                                <span className="text-gray-500 ml-2">({item.variant})</span>
                                <br />
                                <span className="text-xs text-gray-500">For: {item.recipientName}</span>
                              </div>
                              <span className="font-semibold">₹{item.price.toLocaleString()}</span>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-600">Legacy order format</p>
                      )}
                    </div>
                    
                    {/* Shipping Address */}
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 mb-4">
                      <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-1 text-sm">Shipping Address:</h4>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        {order.shippingAddress.name}<br />
                        {order.shippingAddress.address}<br />
                        {order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}
                      </p>
                    </div>
                    
                    {/* Tracking ID Section */}
                    {order.trackingId ? (
                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 mb-4">
                        <h4 className="font-semibold text-green-900 dark:text-green-300 mb-1 text-sm">Tracking ID:</h4>
                        <div className="flex items-center gap-2">
                          <code className="text-sm bg-white dark:bg-zinc-900 px-2 py-1 rounded border">{order.trackingId}</code>
                          <Button size="sm" variant="outline" onClick={() => window.open(`https://www.google.com/search?q=${order.trackingId}+tracking`, '_blank')}>
                            🔍 Track
                          </Button>
                        </div>
                      </div>
                    ) : order.status === 'confirmed' && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 mb-4">
                        <h4 className="font-semibold text-yellow-900 dark:text-yellow-300 mb-2 text-sm">Add Tracking ID:</h4>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Enter tracking ID"
                            value={trackingInputs[order.id] || ''}
                            onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                            className="text-sm"
                          />
                          <Button 
                            size="sm" 
                            onClick={() => handleUpdateTracking(order.id, trackingInputs[order.id])}
                            disabled={!trackingInputs[order.id]?.trim()}
                            className="bg-blue-500 hover:bg-blue-600 text-white"
                          >
                            📦 Ship
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 flex-wrap">
                      <Button size="sm" variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)}!%20Your%20order%20%23${order.id.slice(0, 8)}%20${order.trackingId ? `has been shipped. Tracking ID: ${order.trackingId}` : 'update:'}`, '_blank')}>
                        <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                        WhatsApp
                      </Button>
                      <Button size="sm" variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => window.open(`mailto:${order.customerEmail}?subject=Order%20Update%20%23${order.id.slice(0, 8)}`, '_blank')}>
                        <Mail className="w-4 h-4 mr-2" />
                        Email
                      </Button>
                      {order.status === 'shipped' && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Mark Delivered
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteOrder(order.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
        )
      })()}

      {activeTab === 'songs' && (() => {
        const filteredSongs = customSongs.filter(song => songFilter === 'all' || song.status === songFilter)
        const totalPages = Math.ceil(filteredSongs.length / itemsPerPage)
        const paginatedSongs = filteredSongs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
        return (
        <div>
          <div className="flex justify-between items-center mb-6">
            <div className="flex gap-2 overflow-x-auto pb-2">
              <button
                onClick={() => setSongFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  songFilter === 'all'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
                }`}
              >
                All ({customSongs.length})
              </button>
              <button
                onClick={() => setSongFilter('pending')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  songFilter === 'pending'
                    ? 'bg-yellow-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
                }`}
              >
                Pending ({customSongs.filter(s => s.status === 'pending').length})
              </button>
              <button
                onClick={() => setSongFilter('in_progress')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  songFilter === 'in_progress'
                    ? 'bg-purple-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
                }`}
              >
                In Progress ({customSongs.filter(s => s.status === 'in_progress').length})
              </button>
              <button
                onClick={() => setSongFilter('ready')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  songFilter === 'ready'
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
                }`}
              >
                Ready ({customSongs.filter(s => s.status === 'ready').length})
              </button>
              <button
                onClick={() => setSongFilter('completed')}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  songFilter === 'completed'
                    ? 'bg-green-500 text-white shadow-lg'
                    : 'bg-gray-200 dark:bg-zinc-900 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-zinc-800'
                }`}
              >
                Completed ({customSongs.filter(s => s.status === 'completed').length})
              </button>
            </div>
            <Button
              onClick={() => router.push('/admin/custom-song-settings')}
              className="bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-100 whitespace-nowrap"
            >
              <CreditCard className="w-4 h-4 mr-2" />
              Manage Pricing
            </Button>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="dark:bg-zinc-950 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-zinc-900 rounded w-40 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-zinc-900 rounded w-32 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-zinc-900 rounded w-24 animate-pulse" />
                      </div>
                      <div>
                        <div className="h-6 bg-gray-200 dark:bg-zinc-900 rounded w-20 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-zinc-900 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-24 bg-gray-200 dark:bg-zinc-900 rounded mb-4 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 dark:bg-zinc-900 rounded w-32 animate-pulse" />
                      <div className="h-8 bg-gray-200 dark:bg-zinc-900 rounded w-24 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : customSongs.length === 0 ? (
            <Card className="dark:bg-zinc-950 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <Music className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No custom song requests</h3>
                <p className="text-gray-500 dark:text-gray-400">Custom song orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {paginatedSongs.map((song) => (
                <Card key={song.id} className="dark:bg-zinc-950 dark:border-gray-800 hover:shadow-xl transition-all border-l-4 border-l-purple-500">
                  <CardContent className="p-6">
                    <div className={`flex justify-between items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-950 -mx-6 px-6 py-4 -mt-6 transition-colors ${expandedSongs[song.id] ? 'mb-4' : '-mb-6 pb-10'}`} onClick={() => setExpandedSongs(prev => ({ ...prev, [song.id]: !prev[song.id] }))}>
                      <div className="flex items-center gap-4 flex-1">
                        <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                          <Music className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">{song.occasion} Song</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            song.status === 'completed' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' :
                            song.status === 'ready' ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' :
                            song.status === 'in_progress' ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' :
                            'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                          }`}>
                            {song.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">For: {song.recipientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(song.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-xl font-bold text-purple-600">₹{song.amount}</p>
                          <p className="text-xs text-gray-500 mt-1">{song.deliveryType === 'express' ? 'Express' : 'Standard'}</p>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-zinc-900 flex items-center justify-center flex-shrink-0">
                          {expandedSongs[song.id] ? <ChevronUp className="w-4 h-4 text-gray-600 dark:text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-600 dark:text-gray-300" />}
                        </div>
                      </div>
                    </div>
                    
                    {expandedSongs[song.id] && (
                    <>
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2"><span className="font-semibold">Story:</span> {song.story}</p>
                      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400 mb-3">
                        <span>Mood: {song.mood}</span>
                        <span>Style: {song.style}</span>
                        <span>Length: {song.length}</span>
                      </div>
                      
                      {/* Audio Links Section */}
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-3 space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Preview URL:</label>
                            <input
                              type="url"
                              placeholder="Drive/Cloud link"
                              value={song.previewUrl || ''}
                              onChange={(e) => {
                                const updatedSongs = customSongs.map(s => 
                                  s.id === song.id ? { ...s, previewUrl: e.target.value } : s
                                )
                                setCustomSongs(updatedSongs)
                              }}
                              className="w-full text-xs p-2 border rounded text-gray-900 placeholder:text-gray-400 border-gray-300 bg-white dark:border-gray-600 dark:!bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Full Audio URL:</label>
                            <input
                              type="url"
                              placeholder="Drive/Cloud link"
                              value={song.fullAudioUrl || ''}
                              onChange={(e) => {
                                const updatedSongs = customSongs.map(s => 
                                  s.id === song.id ? { ...s, fullAudioUrl: e.target.value } : s
                                )
                                setCustomSongs(updatedSongs)
                              }}
                              className="w-full text-xs p-2 border rounded text-gray-900 placeholder:text-gray-400 border-gray-300 bg-white dark:border-gray-600 dark:!bg-gray-800 dark:text-white dark:placeholder:text-gray-500"
                            />
                          </div>
                        </div>
                        
                        <div className="flex gap-3 items-end">
                          <div className="flex-1">
                            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 block mb-1">Poster Image:</label>
                            <div className="flex gap-2 items-center">
                              {song.posterUrl && (
                                <div className="relative">
                                  <img src={song.posterUrl} alt="Poster" className="w-20 h-20 object-cover rounded border border-gray-300 dark:border-gray-600" />
                                  <button
                                    onClick={() => {
                                      const updatedSongs = customSongs.map(s => 
                                        s.id === song.id ? { ...s, posterUrl: null } : s
                                      )
                                      setCustomSongs(updatedSongs)
                                    }}
                                    className="absolute -top-1 -right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center shadow-lg transition-colors"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                              <label className="flex-1 border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-xs cursor-pointer bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300">
                                <Upload className="w-4 h-4" />
                                <span>{song.posterUrl ? 'Change Poster' : 'Upload Poster'}</span>
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={async (e) => {
                                    const file = e.target.files[0]
                                    if (!file) return
                                    const formData = new FormData()
                                    formData.append('image', file)
                                    try {
                                      const res = await fetch('/api/upload-image', { method: 'POST', body: formData })
                                      const data = await res.json()
                                      if (data.url) {
                                        const updatedSongs = customSongs.map(s => 
                                          s.id === song.id ? { ...s, posterUrl: data.url } : s
                                        )
                                        setCustomSongs(updatedSongs)
                                      }
                                    } catch (err) {
                                      alert('Upload failed')
                                    }
                                  }}
                                />
                              </label>
                            </div>
                          </div>
                          <button
                            onClick={() => updateSongLinks(song.id, song.previewUrl, song.fullAudioUrl, song.posterUrl)}
                            className="flex items-center gap-2 text-xs bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-medium whitespace-nowrap transition-colors"
                          >
                            <Save className="w-3.5 h-3.5" />
                            Save Links
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {song.status === 'pending' && (
                        <Button size="sm" onClick={() => updateSongStatus(song.id, 'in_progress')} className="bg-blue-500 hover:bg-blue-600">
                          <Music className="w-4 h-4 mr-2" />
                          Start Production
                        </Button>
                      )}
                      {song.status === 'in_progress' && (
                        <Button size="sm" onClick={() => updateSongStatus(song.id, 'completed')} className="bg-green-500 hover:bg-green-600">
                          <Check className="w-4 h-4 mr-2" />
                          Mark Complete
                        </Button>
                      )}
                      <Button size="sm" variant="outline" className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteCustomSong(song.id)}>
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                    </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          <Pagination 
            currentPage={currentPage} 
            totalPages={totalPages} 
            onPageChange={setCurrentPage} 
          />
        </div>
        )
      })()}

      {activeTab === 'categories' && (
        <div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="dark:bg-zinc-950 dark:border-gray-800">
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 dark:bg-zinc-900 rounded w-32 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-zinc-900 rounded w-20 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card className="dark:bg-zinc-950 dark:border-gray-800 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Create New Category</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1"
                    />
                    <Button onClick={handleCreateCategory}>Create</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Card key={cat.id} className="dark:bg-zinc-950 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">{cat.name}</h4>
                      <p className="text-sm text-gray-500">{cat._count.products} products</p>
                    </div>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteCategory(cat.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </>
          )}
        </div>
      )}

      {activeTab === 'tags' && (
        <div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="dark:bg-zinc-950 dark:border-gray-800">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 dark:bg-zinc-900 rounded-full w-24 mb-3 animate-pulse" />
                    <div className="h-8 bg-gray-200 dark:bg-zinc-900 rounded w-16 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card className="dark:bg-zinc-950 dark:border-gray-800 mb-6">
                <CardContent className="p-6">
                  <h3 className="font-bold text-gray-900 dark:text-white mb-4">Create New Tag</h3>
                  <div className="flex gap-3">
                    <Input
                      placeholder="Tag name"
                      value={newTagName}
                      onChange={(e) => setNewTagName(e.target.value)}
                      className="flex-1"
                    />
                    <input
                      type="color"
                      value={newTagColor}
                      onChange={(e) => setNewTagColor(e.target.value)}
                      className="w-16 h-10 rounded border cursor-pointer"
                    />
                    <Button onClick={handleCreateTag}>Create</Button>
                  </div>
                </CardContent>
              </Card>

              <div className="grid md:grid-cols-3 gap-4">
            {tags.map((tag) => (
              <Card key={tag.id} className="dark:bg-zinc-950 dark:border-gray-800">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <span
                      className="px-3 py-1 rounded-full text-white text-sm font-semibold"
                      style={{ backgroundColor: tag.color }}
                    >
                      {tag.name}
                    </span>
                    <Button size="sm" variant="outline" className="text-red-500" onClick={() => handleDeleteTag(tag.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={tag.color}
                      onChange={(e) => handleUpdateTagColor(tag.id, e.target.value)}
                      className="w-12 h-8 rounded border cursor-pointer"
                    />
                    <span className="text-sm text-gray-500">{tag._count.products} products</span>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
