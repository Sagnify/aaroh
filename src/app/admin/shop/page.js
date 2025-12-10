'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, Music, ShoppingBag, Eye, Check, CreditCard, Upload, Save, X, ChevronDown, ChevronUp, MessageCircle, Mail, CheckCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import ProductThumbnailCarousel from '@/components/ProductThumbnailCarousel'
import ImageUpload from '@/components/ImageUpload'
import Pagination from '@/components/Pagination'

export default function AdminShopPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('orders')
  const [products, setProducts] = useState([])
  const [orders, setOrders] = useState([])
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#8B5CF6')
  const [loading, setLoading] = useState(true)
  const [orderFilter, setOrderFilter] = useState('all')
  const [trackingInputs, setTrackingInputs] = useState({})
  const [expandedOrders, setExpandedOrders] = useState({})
  const [currentPage, setCurrentPage] = useState(1)
  const [orderTab, setOrderTab] = useState('active')
  const itemsPerPage = 10

  useEffect(() => {
    setCurrentPage(1)
  }, [orderFilter, activeTab])

  useEffect(() => {
    document.title = 'Shop Management | Aaroh Admin'
    fetchProducts()
    fetchOrders()
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
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       await fetch('/api/auth/csrf').then(r => r.json()).then(d => d.csrfToken)
      
      await fetch('/api/shop/categories', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
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
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       await fetch('/api/auth/csrf').then(r => r.json()).then(d => d.csrfToken)
      
      await fetch(`/api/shop/categories/${id}`, { 
        method: 'DELETE',
        headers: { 'X-CSRF-Token': csrfToken }
      })
      fetchCategories()
    } catch (error) {
      console.error('Error deleting category:', error)
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       await fetch('/api/auth/csrf').then(r => r.json()).then(d => d.csrfToken)
      
      await fetch('/api/shop/tags', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
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

  const handleToggleFeatured = async (id, isFeatured) => {
    // Update UI instantly
    setProducts(prev => prev.map(product => 
      product.id === id ? { ...product, isFeatured } : product
    ))
    
    // Handle API call in background
    try {
      await fetch(`/api/shop/products/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured })
      })
    } catch (error) {
      console.error('Error toggling featured:', error)
      // Revert on error
      setProducts(prev => prev.map(product => 
        product.id === id ? { ...product, isFeatured: !isFeatured } : product
      ))
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

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <div className="max-w-7xl mx-auto px-0 md:px-6 py-8">
        <div className="mb-8 px-4 md:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Shop Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage orders, products, categories and tags for your e-commerce store</p>
        </div>

        <div className="border-b border-gray-200 dark:border-gray-700 mb-8 px-4 md:px-0">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('orders')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'orders'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Orders ({orders.length})
            </button>
            <button
              onClick={() => setActiveTab('products')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'products'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Products ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('categories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'categories'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Categories ({categories.length})
            </button>
            <button
              onClick={() => setActiveTab('tags')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'tags'
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Tags ({tags.length})
            </button>
          </nav>
        </div>

        <div className="mt-8">
          {activeTab === 'orders' && (() => {
            const activeOrders = orders.filter(order => !['delivered', 'cancelled'].includes(order.status))
            const pastOrders = orders.filter(order => ['delivered', 'cancelled'].includes(order.status))
            const displayOrders = orderTab === 'active' ? activeOrders : pastOrders
            const filteredOrders = displayOrders.filter(order => orderFilter === 'all' || order.status === orderFilter)
            const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
            const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
            return (
            <div>
              <div className="flex gap-3 mb-6 px-4 md:px-0">
                <button
                  onClick={() => { setOrderTab('active'); setOrderFilter('all'); setCurrentPage(1) }}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all ${
                    orderTab === 'active'
                      ? 'bg-green-50 border-green-200 text-green-700 dark:bg-green-900/20 dark:border-green-700 dark:text-green-300'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Active Orders ({activeOrders.length})
                </button>
                <button
                  onClick={() => { setOrderTab('past'); setOrderFilter('all'); setCurrentPage(1) }}
                  className={`px-6 py-2.5 rounded-lg font-semibold text-sm border-2 transition-all ${
                    orderTab === 'past'
                      ? 'bg-gray-50 border-gray-300 text-gray-700 dark:bg-gray-700 dark:border-gray-500 dark:text-gray-200'
                      : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`}
                >
                  Past Orders ({pastOrders.length})
                </button>
              </div>
              
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2 px-4 md:px-0">
                <button
                  onClick={() => setOrderFilter('all')}
                  className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                    orderFilter === 'all'
                      ? 'bg-blue-100 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700'
                      : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  All ({displayOrders.length})
                </button>
                {orderTab === 'active' && (
                  <>
                    <button
                      onClick={() => setOrderFilter('pending')}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        orderFilter === 'pending'
                          ? 'bg-yellow-100 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      Pending ({activeOrders.filter(o => o.status === 'pending').length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('confirmed')}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        orderFilter === 'confirmed'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-700'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      Confirmed ({activeOrders.filter(o => o.status === 'confirmed').length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('shipped')}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        orderFilter === 'shipped'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      Shipped ({activeOrders.filter(o => o.status === 'shipped').length})
                    </button>
                  </>
                )}
                {orderTab === 'past' && (
                  <>
                    <button
                      onClick={() => setOrderFilter('delivered')}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        orderFilter === 'delivered'
                          ? 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      Delivered ({pastOrders.filter(o => o.status === 'delivered').length})
                    </button>
                    <button
                      onClick={() => setOrderFilter('cancelled')}
                      className={`px-4 py-2 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                        orderFilter === 'cancelled'
                          ? 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-700'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700'
                      }`}
                    >
                      Cancelled ({pastOrders.filter(o => o.status === 'cancelled').length})
                    </button>
                  </>
                )}
              </div>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg p-6">
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
                    </div>
                  ))}
                </div>
              ) : displayOrders.length === 0 ? (
                <div className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 shadow-sm rounded-none md:rounded-lg p-8 md:p-12 text-center mx-0">
                  <ShoppingBag className="w-12 md:w-16 h-12 md:h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg md:text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {orderTab === 'active' ? 'No active orders' : 'No past orders'}
                  </h3>
                  <p className="text-sm md:text-base text-gray-500 dark:text-gray-400">
                    {orderTab === 'active' 
                      ? 'New orders will appear here when customers make purchases'
                      : 'Completed and cancelled orders will appear here'
                    }
                  </p>
                </div>
              ) : (
                <div className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 shadow-sm rounded-none md:rounded-lg mx-0">
                  <div className="px-4 md:px-6 py-4 border-b dark:border-zinc-800">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{orderTab === 'active' ? 'Active' : 'Past'} Orders</h2>
                  </div>
                  <div className="divide-y dark:divide-zinc-800">
                  {paginatedOrders.map((order) => (
                    <div key={order.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors">
                        <div className="px-4 md:px-6 py-4 md:py-5 cursor-pointer" onClick={() => setExpandedOrders(prev => ({ ...prev, [order.id]: !prev[order.id] }))}>
                          <div className="flex items-start md:items-center justify-between gap-3">
                            <div className="flex items-start md:items-center gap-3 md:gap-4 flex-1 min-w-0">
                              <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg md:rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                                <Package className="w-5 h-5 md:w-6 md:h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-2 mb-2 md:mb-3">
                                  <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">#{order.id.slice(0, 8)}</h3>
                                  <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                                    order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' :
                                    order.status === 'shipped' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' :
                                    order.status === 'confirmed' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' :
                                    order.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' :
                                    'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
                                  }`}>
                                    {order.status}
                                  </span>
                                  <span className={`inline-flex px-2 md:px-3 py-0.5 md:py-1 text-xs font-bold rounded-full uppercase tracking-wide ${
                                    order.paymentMethod === 'cod' ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300' : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                                  }`}>
                                    {order.paymentMethod === 'cod' ? 'COD' : 'PAID'}
                                  </span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 md:gap-3 text-sm">
                                  <div className="space-y-1">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">Customer</p>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{order.customerName}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">{order.customerPhone}</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">Order Details</p>
                                    <p className="font-semibold text-gray-900 dark:text-white text-sm md:text-base">{new Date(order.createdAt).toLocaleDateString('en-IN')}</p>
                                    <p className="text-gray-600 dark:text-gray-400 text-xs md:text-sm">{Array.isArray(order.items) ? order.items.length : 1} items</p>
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wide font-medium">Total Amount</p>
                                    <p className="text-xl md:text-2xl font-bold text-blue-600 dark:text-blue-400">₹{order.amount.toLocaleString()}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="w-8 h-8 md:w-10 md:h-10 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center flex-shrink-0">
                              {expandedOrders[order.id] ? <ChevronUp className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" /> : <ChevronDown className="w-4 h-4 md:w-5 md:h-5 text-gray-600 dark:text-gray-300" />}
                            </div>
                          </div>
                        </div>
                        
                        {expandedOrders[order.id] && (
                          <div className="px-4 md:px-6 pb-4 md:pb-6 border-t dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50">
                            <div className="pt-4 md:pt-6 space-y-4 md:space-y-6">
                              <div className="bg-white dark:bg-zinc-900 rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm border dark:border-zinc-800">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 md:mb-4 uppercase tracking-wide">Order Items</h4>
                                {Array.isArray(order.items) ? (
                                  <div className="space-y-4">
                                    {order.items.map((item, index) => (
                                      <div key={index} className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-4 p-3 md:p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg">
                                        <div className="flex-1 min-w-0">
                                          <h5 className="font-bold text-gray-900 dark:text-white text-sm md:text-base">{item.productName}</h5>
                                          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Variant: {item.variant}</p>
                                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">For: {item.recipientName}</p>
                                        </div>
                                        <div className="text-left sm:text-right">
                                          <p className="text-base md:text-lg font-bold text-gray-900 dark:text-white">₹{item.price.toLocaleString()}</p>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                ) : (
                                  <p className="text-sm text-gray-600 dark:text-gray-400 italic">Legacy order format</p>
                                )}
                              </div>
                              
                              <div className="bg-white dark:bg-zinc-900 rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm border dark:border-zinc-800">
                                <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300 mb-3 uppercase tracking-wide">Shipping Address</h4>
                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 md:p-4">
                                  <p className="font-semibold text-blue-900 dark:text-blue-200 text-sm md:text-base">{order.shippingAddress.name}</p>
                                  <p className="text-blue-800 dark:text-blue-300 mt-1 text-sm">{order.shippingAddress.address}</p>
                                  <p className="text-blue-800 dark:text-blue-300 text-sm">{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.pincode}</p>
                                </div>
                              </div>
                              
                              {order.trackingId ? (
                                <div className="bg-white dark:bg-zinc-900 rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm border dark:border-zinc-800">
                                  <h4 className="text-sm font-bold text-green-900 dark:text-green-300 mb-3 uppercase tracking-wide">Tracking Information</h4>
                                  <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3 md:p-4">
                                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                                      <code className="text-xs md:text-sm bg-white dark:bg-zinc-900 px-2 md:px-3 py-1.5 md:py-2 rounded-lg border font-mono font-bold break-all">{order.trackingId}</code>
                                      <Button size="sm" variant="outline" onClick={() => window.open(`https://www.google.com/search?q=${order.trackingId}+tracking`, '_blank')} className="font-semibold w-full sm:w-auto">
                                        Track Package
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              ) : order.status === 'confirmed' && (
                                <div className="bg-white dark:bg-zinc-900 rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm border dark:border-zinc-800">
                                  <h4 className="text-sm font-bold text-amber-900 dark:text-amber-300 mb-3 uppercase tracking-wide">Add Tracking ID</h4>
                                  <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 md:p-4">
                                    <div className="flex flex-col sm:flex-row gap-3">
                                      <Input
                                        placeholder="Enter tracking ID"
                                        value={trackingInputs[order.id] || ''}
                                        onChange={(e) => setTrackingInputs({ ...trackingInputs, [order.id]: e.target.value })}
                                        className="flex-1 font-mono text-sm"
                                      />
                                      <Button 
                                        size="sm" 
                                        onClick={() => handleUpdateTracking(order.id, trackingInputs[order.id])}
                                        disabled={!trackingInputs[order.id]?.trim()}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 md:px-6 w-full sm:w-auto"
                                      >
                                        Ship Order
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              <div className="bg-white dark:bg-zinc-900 rounded-lg md:rounded-xl p-4 md:p-5 shadow-sm border dark:border-zinc-800">
                                <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-3 md:mb-4 uppercase tracking-wide">Actions</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 md:gap-3">
                                  <Button size="sm" variant="outline" className="border-green-200 dark:border-green-800 text-green-700 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 font-semibold" onClick={() => window.open(`https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=Hi%20${encodeURIComponent(order.customerName)}!%20Your%20order%20%23${order.id.slice(0, 8)}%20${order.trackingId ? `has been shipped. Tracking ID: ${order.trackingId}` : 'update:'}`, '_blank')}>
                                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                                    WhatsApp
                                  </Button>
                                  <Button size="sm" variant="outline" className="border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 font-semibold" onClick={() => window.open(`mailto:${order.customerEmail}?subject=Order%20Update%20%23${order.id.slice(0, 8)}`, '_blank')}>
                                    <Mail className="w-4 h-4 mr-2" />
                                    Email
                                  </Button>
                                  {order.status === 'shipped' && (
                                    <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white font-semibold" onClick={() => handleUpdateOrderStatus(order.id, 'delivered')}>
                                      <CheckCircle className="w-4 h-4 mr-2" />
                                      Mark Delivered
                                    </Button>
                                  )}
                                  <Button size="sm" variant="outline" className="border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold" onClick={() => handleDeleteOrder(order.id)}>
                                    <Trash2 className="w-4 h-4 mr-2" />
                                    Delete Order
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                  ))}
                  </div>
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

          {activeTab === 'products' && (
            <div className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 shadow-sm rounded-none md:rounded-lg mx-0">
              <div className="px-4 md:px-6 py-4 border-b dark:border-zinc-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white">Products</h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Manage your store products</p>
                </div>
                <button
                  onClick={() => router.push('/admin/shop/add-product')}
                  className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-100 dark:hover:bg-gray-200 dark:text-gray-900 text-white px-4 py-2 rounded-md text-sm font-medium w-full sm:w-auto"
                >
                  Add Product
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                    <tr>
                      <th className="text-left py-4 px-4 md:px-6 font-medium text-gray-900 dark:text-gray-200">Product</th>
                      <th className="text-left py-4 px-4 md:px-6 font-medium text-gray-900 dark:text-gray-200 hidden md:table-cell">Category</th>
                      <th className="text-left py-4 px-4 md:px-6 font-medium text-gray-900 dark:text-gray-200">Price</th>
                      <th className="text-left py-4 px-4 md:px-6 font-medium text-gray-900 dark:text-gray-200 hidden md:table-cell">Status</th>
                      <th className="text-left py-4 px-4 md:px-6 font-medium text-gray-900 dark:text-gray-200">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y dark:divide-zinc-800">
                    {loading ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <tr key={i}>
                          <td className="py-4 px-4 md:px-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0 bg-gray-200 dark:bg-zinc-700 rounded-lg animate-pulse" />
                              <div className="ml-4">
                                <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-32 mb-1 animate-pulse" />
                                <div className="h-3 bg-gray-200 dark:bg-zinc-700 rounded w-24 animate-pulse" />
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 md:px-6 hidden md:table-cell">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-20 animate-pulse" />
                          </td>
                          <td className="py-4 px-4 md:px-6">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-16 animate-pulse" />
                          </td>
                          <td className="py-4 px-4 md:px-6 hidden md:table-cell">
                            <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded-full w-20 animate-pulse" />
                          </td>
                          <td className="py-4 px-4 md:px-6">
                            <div className="flex gap-2">
                              <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                              <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-3 py-14 text-center text-sm text-gray-500 dark:text-gray-400">
                          <Package className="mx-auto h-12 w-12 text-gray-400" />
                          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No products</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new product.</p>
                          <div className="mt-6">
                            <button
                              onClick={() => router.push('/admin/shop/add-product')}
                              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                              <Plus className="-ml-0.5 mr-1.5 h-5 w-5" />
                              New Product
                            </button>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.map((product) => (
                        <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-zinc-900">
                          <td className="py-4 px-4 md:px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden">
                                <ProductThumbnailCarousel variants={product.variants || []} className="w-full h-full" />
                              </div>
                              <div className="min-w-0">
                                <div className="font-medium text-gray-900 dark:text-white truncate">{product.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{product.description}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 md:px-6 text-gray-600 dark:text-gray-400 hidden md:table-cell">
                            {product.category?.name || 'Uncategorized'}
                          </td>
                          <td className="py-4 px-4 md:px-6 text-gray-600 dark:text-gray-400">₹{product.price}</td>
                          <td className="py-4 px-4 md:px-6 hidden md:table-cell">
                            <div className="flex items-center gap-2">
                              <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                                product.isFeatured ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300' : 'bg-gray-100 text-gray-800 dark:bg-zinc-800 dark:text-gray-300'
                              }`}>
                                {product.isFeatured ? 'Featured' : 'Regular'}
                              </span>
                              {product.tags && product.tags.length > 0 && (
                                <div className="flex gap-1">
                                  {product.tags.slice(0, 2).map((tag) => (
                                    <span
                                      key={tag.id}
                                      className="inline-flex items-center rounded-full px-1.5 py-0.5 text-xs font-medium text-white"
                                      style={{ backgroundColor: tag.color }}
                                    >
                                      {tag.name}
                                    </span>
                                  ))}
                                  {product.tags.length > 2 && (
                                    <span className="text-xs text-gray-400">+{product.tags.length - 2}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 md:px-6">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleToggleFeatured(product.id, !product.isFeatured)}
                                className={`px-3 py-1.5 rounded text-xs font-medium ${
                                  product.isFeatured
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
                                }`}
                                title={product.isFeatured ? 'Remove from featured' : 'Add to featured'}
                              >
                                {product.isFeatured ? 'Featured' : 'Feature'}
                              </button>
                              <button
                                onClick={() => router.push(`/admin/shop/edit/${product.id}`)}
                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 rounded-md p-1.5"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(product.id)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md p-1.5"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="mt-8 flow-root">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Categories</h2>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Organize your products with categories.</p>
                </div>
              </div>
              <div className="mt-8 bg-white dark:bg-zinc-900 shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Add Category</h3>
                </div>
                <div className="px-6 py-4">
                  <div className="flex gap-3">
                    <Input
                      placeholder="Category name"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      className="flex-1"
                    />
                    <button
                      onClick={handleCreateCategory}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-zinc-700">
                  <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Name</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Products</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-32 animate-pulse" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-16 animate-pulse" />
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : categories.length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-3 py-14 text-center text-sm text-gray-500 dark:text-gray-400">
                          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No categories</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new category.</p>
                        </td>
                      </tr>
                    ) : (
                      categories.map((cat) => (
                        <tr key={cat.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            {cat.name}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {cat._count.products} products
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleDeleteCategory(cat.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md p-1.5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'tags' && (
            <div className="mt-8 flow-root">
              <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                  <h2 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Tags</h2>
                  <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">Add colorful tags to highlight product features.</p>
                </div>
              </div>

              <div className="mt-8 bg-white dark:bg-zinc-900 shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <div className="px-6 py-4 border-b border-gray-200 dark:border-zinc-700">
                  <h3 className="text-base font-semibold leading-6 text-gray-900 dark:text-white">Add Tag</h3>
                </div>
                <div className="px-6 py-4">
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
                      className="w-16 h-10 rounded-md border border-gray-300 dark:border-zinc-600 cursor-pointer"
                    />
                    <button
                      onClick={handleCreateTag}
                      className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                      Create
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table className="min-w-full divide-y divide-gray-300 dark:divide-zinc-700">
                  <thead className="bg-gray-50 dark:bg-zinc-800">
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 dark:text-white sm:pl-6">Tag</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Color</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 dark:text-white">Products</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-zinc-800 bg-white dark:bg-zinc-900">
                    {loading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            <div className="h-6 bg-gray-200 dark:bg-zinc-700 rounded-full w-20 animate-pulse" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="h-8 w-12 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <div className="h-4 bg-gray-200 dark:bg-zinc-700 rounded w-16 animate-pulse" />
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" />
                          </td>
                        </tr>
                      ))
                    ) : tags.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-14 text-center text-sm text-gray-500 dark:text-gray-400">
                          <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No tags</h3>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Get started by creating a new tag.</p>
                        </td>
                      </tr>
                    ) : (
                      tags.map((tag) => (
                        <tr key={tag.id}>
                          <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 dark:text-white sm:pl-6">
                            <span
                              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium text-white"
                              style={{ backgroundColor: tag.color }}
                            >
                              {tag.name}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            <input
                              type="color"
                              value={tag.color}
                              onChange={(e) => handleUpdateTagColor(tag.id, e.target.value)}
                              className="w-12 h-8 rounded-md border border-gray-300 dark:border-zinc-600 cursor-pointer"
                            />
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500 dark:text-gray-400">
                            {tag._count.products} products
                          </td>
                          <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button
                              onClick={() => handleDeleteTag(tag.id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 rounded-md p-1.5"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}