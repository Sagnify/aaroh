'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Gift, Search, Filter } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import ProductThumbnailCarousel from '@/components/ProductThumbnailCarousel'

export default function GiftsPage() {
  const router = useRouter()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  useEffect(() => {
    document.title = 'Music-Powered Gifts | Aaroh Story Shop'
    fetchProducts()
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/shop/categories')
      const data = await response.json()
      setCategories(data.categories || [])
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/shop/products')
      const data = await response.json()
      setProducts(data.products || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const featuredProducts = useMemo(() => products.filter(p => p.isFeatured), [products])
  
  const productsByCategory = useMemo(() => {
    const grouped = {}
    categories.forEach(cat => {
      grouped[cat.id] = products.filter(p => p.categoryId === cat.id && p.name.toLowerCase().includes(search.toLowerCase()))
    })
    return grouped
  }, [products, categories, search])

  const ProductCard = ({ product, priority = false }) => (
    <div className="flex-shrink-0 w-[45%] sm:w-[220px] md:w-[260px]">
      <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-lg active:shadow-md hover:shadow-xl transition-all overflow-hidden cursor-pointer h-full">
        <div className="relative h-44 sm:h-48 md:h-56 bg-gradient-to-br from-blue-100 to-teal-100 overflow-hidden">
          <ProductThumbnailCarousel 
            variants={product.variants || []} 
            className="w-full h-full"
          />
          {product.tags?.[0] && (
            <div className="absolute top-2 right-2">
              <span className="text-white text-xs font-semibold px-2 py-1 rounded-full shadow-lg" style={{ backgroundColor: product.tags[0].color }}>
                {product.tags[0].name}
              </span>
            </div>
          )}
        </div>
        <CardContent className="p-3 md:p-4">
          <h3 className="text-sm md:text-base font-bold text-gray-900 mb-1 line-clamp-2 min-h-[2.5rem]">{product.name}</h3>
          <div className="flex items-center justify-between gap-2 mt-2">
            <span className="text-base md:text-xl font-bold text-blue-600">₹{product.price}</span>
            <Button onClick={() => router.push(`/shop/gifts/${product.slug}/configure`)} className="bg-gradient-to-r from-blue-500 to-teal-500 active:scale-95 text-white text-xs md:text-sm px-3 h-8 md:h-9">Buy</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-20 md:pt-28 pb-20 px-3 md:px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 md:mb-12"
        >
          <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
            <Gift className="w-6 h-6 md:w-8 md:h-8 text-white" />
          </div>
          <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 md:mb-3 px-4">Music-Powered Gifts</h1>
          <p className="text-sm md:text-base text-gray-600 px-4">Every product comes with a song attached</p>
        </motion.div>

        {/* Filters */}
        <div className="mb-4 md:mb-8 flex flex-col gap-3 md:gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 md:w-5 md:h-5 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 md:pl-10 h-11 md:h-10 bg-white/80 backdrop-blur-sm text-sm md:text-base"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 md:px-4 py-2 rounded-full md:rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-all active:scale-95 ${
                filter === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-white/80 text-gray-700'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setFilter(cat.id)}
                className={`px-3 md:px-4 py-2 rounded-full md:rounded-lg text-sm md:text-base font-medium whitespace-nowrap transition-all active:scale-95 ${
                  filter === cat.id
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-white/80 text-gray-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products by Category */}
        {loading ? (
          <div className="space-y-8">
            {/* Trending skeleton */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
              <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
                {[1, 2, 3, 4, 5, 6].map((j) => (
                  <div key={j} className="flex-shrink-0 w-[45%] sm:w-[220px] md:w-[260px]">
                    <div className="h-52 md:h-64 bg-gray-200 rounded-lg animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
            {/* Category skeletons */}
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse" />
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide -mx-3 px-3 md:mx-0 md:px-0">
                  {[1, 2, 3, 4, 5, 6].map((j) => (
                    <div key={j} className="flex-shrink-0 w-[45%] sm:w-[220px] md:w-[260px]">
                      <div className="h-52 md:h-64 bg-gray-200 rounded-lg animate-pulse" />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-8 md:p-12 text-center">
              <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No products yet</h3>
              <p className="text-gray-500">Products will be added by admin soon!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Trending Now - only show when 'all' is selected */}
            {filter === 'all' && featuredProducts.length > 0 && (
              <div className="-mx-3 md:mx-0">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 px-3 md:px-0">🔥 Trending Now</h2>
                <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-3 md:px-0">
                  {featuredProducts.map((product, idx) => <ProductCard key={product.id} product={product} priority={idx === 0} />)}
                </div>
              </div>
            )}

            {/* Categories */}
            {categories.filter(cat => filter === 'all' || filter === cat.id).map((category) => {
              const categoryProducts = productsByCategory[category.id] || []
              if (categoryProducts.length === 0) return null
              return (
                <div key={category.id} className="-mx-3 md:mx-0">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-4 px-3 md:px-0">{category.name}</h2>
                  <div className="flex gap-3 md:gap-4 overflow-x-auto pb-4 scrollbar-hide px-3 md:px-0">
                    {categoryProducts.map((product) => <ProductCard key={product.id} product={product} />)}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
