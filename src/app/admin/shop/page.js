'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit, Trash2, Package, Music, ShoppingBag, Eye, Check } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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

  return (
    <div className="p-4 md:p-8 pt-20 md:pt-24">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2">Shop Management</h1>
        <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">Manage products, orders, and custom songs</p>
      </div>

      <div className="flex gap-1 md:gap-2 mb-6 border-b dark:border-gray-700 overflow-x-auto scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
        <button
          onClick={() => setActiveTab('products')}
          className={`px-3 md:px-4 py-2 font-medium transition-all whitespace-nowrap text-sm md:text-base ${activeTab === 'products' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}
        >
          <Package className="w-4 h-4 inline mr-1 md:mr-2" />
          <span className="hidden sm:inline">Products </span>({products.length})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'orders' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <ShoppingBag className="w-4 h-4 inline mr-2" />
          Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('songs')}
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'songs' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          <Music className="w-4 h-4 inline mr-2" />
          Custom Songs ({customSongs.length})
        </button>
        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'categories' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Categories ({categories.length})
        </button>
        <button
          onClick={() => setActiveTab('tags')}
          className={`px-4 py-2 font-medium transition-all ${activeTab === 'tags' ? 'border-b-2 border-blue-500 text-blue-600 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
          Tags ({tags.length})
        </button>
      </div>

      {activeTab === 'products' && (
        <>
          <div className="flex justify-end mb-6">
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
                <Card key={i} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gray-200 dark:bg-gray-800 rounded-lg mb-4 animate-pulse" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded mb-3 w-2/3 animate-pulse" />
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
                      <div className="flex gap-2">
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                        <div className="h-8 w-8 bg-gray-200 dark:bg-gray-800 rounded animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No products yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Click "Add Product" to create your first product</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {products.map((product) => (
                <Card key={product.id} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="aspect-square bg-gradient-to-br from-blue-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                      {product.images && product.images.length > 0 ? (
                        <img 
                          src={product.images[0]} 
                          alt={product.name} 
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            e.target.style.display = 'none'
                            e.target.parentElement.innerHTML = '<svg class="w-12 h-12 text-blue-300 dark:text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>'
                          }}
                        />
                      ) : (
                        <Package className="w-12 h-12 text-blue-300 dark:text-gray-500" />
                      )}
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

      {activeTab === 'orders' && (
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-48 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
                      </div>
                      <div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-2 animate-pulse" />
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : orders.length === 0 ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <ShoppingBag className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No orders yet</h3>
                <p className="text-gray-500 dark:text-gray-400">Orders will appear here when customers make purchases</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-bold text-gray-900 dark:text-white">Order #{order.id.slice(0, 8)}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{order.customerName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-blue-600">₹{order.amount}</p>
                        <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold ${
                          order.status === 'completed' ? 'bg-green-100 text-green-700' :
                          order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'songs' && (
        <div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card key={i} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between mb-4">
                      <div className="flex-1">
                        <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-40 mb-2 animate-pulse" />
                        <div className="h-4 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
                      </div>
                      <div>
                        <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded w-20 mb-1 animate-pulse" />
                        <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse" />
                      </div>
                    </div>
                    <div className="h-24 bg-gray-200 dark:bg-gray-800 rounded mb-4 animate-pulse" />
                    <div className="flex gap-2">
                      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-32 animate-pulse" />
                      <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-24 animate-pulse" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : customSongs.length === 0 ? (
            <Card className="dark:bg-gray-900 dark:border-gray-800">
              <CardContent className="p-12 text-center">
                <Music className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No custom song requests</h3>
                <p className="text-gray-500 dark:text-gray-400">Custom song orders will appear here</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {customSongs.map((song) => (
                <Card key={song.id} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-bold text-gray-900 dark:text-white">{song.occasion} Song</h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            song.status === 'completed' ? 'bg-green-100 text-green-700' :
                            song.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {song.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">For: {song.recipientName}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-500">{new Date(song.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-bold text-purple-600">₹{song.price}</p>
                        <p className="text-xs text-gray-500 mt-1">{song.deadline === 'express' ? 'Express' : 'Standard'}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-700 dark:text-gray-300 mb-2"><span className="font-semibold">Story:</span> {song.story}</p>
                      <div className="flex gap-4 text-xs text-gray-600 dark:text-gray-400">
                        <span>Mood: {song.mood}</span>
                        <span>Style: {song.style}</span>
                        <span>Length: {song.length}</span>
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
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'categories' && (
        <div>
          {loading ? (
            <div className="grid md:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-4">
                    <div className="h-5 bg-gray-200 dark:bg-gray-800 rounded w-32 mb-2 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-800 rounded w-20 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
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
              <Card key={cat.id} className="dark:bg-gray-900 dark:border-gray-800">
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
                <Card key={i} className="dark:bg-gray-900 dark:border-gray-800">
                  <CardContent className="p-4">
                    <div className="h-6 bg-gray-200 dark:bg-gray-800 rounded-full w-24 mb-3 animate-pulse" />
                    <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-16 animate-pulse" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <>
              <Card className="dark:bg-gray-900 dark:border-gray-800 mb-6">
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
              <Card key={tag.id} className="dark:bg-gray-900 dark:border-gray-800">
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
