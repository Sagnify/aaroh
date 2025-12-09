'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ShoppingCart, Trash2, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'

export default function CartPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { refreshCart } = useCart()
  const [cart, setCart] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'Shopping Cart | Aaroh Story Shop'
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/shop/cart')
    } else if (status === 'authenticated') {
      if (session?.user?.role === 'ADMIN') {
        alert('Admin cannot place orders. Please use a regular user account.')
        router.push('/shop')
        return
      }
      mergeGuestCart()
      fetchCart()
    }
  }, [status, session])

  const mergeGuestCart = async () => {
    try {
      const guestCart = localStorage.getItem('guestCart')
      if (guestCart) {
        const guestCartItems = JSON.parse(guestCart)
        if (guestCartItems.length > 0) {
          await fetch('/api/shop/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ guestCartItems })
          })
          localStorage.removeItem('guestCart')
          refreshCart()
        }
      }
    } catch (error) {
      console.error('Error merging guest cart:', error)
    }
  }

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/shop/cart')
      const data = await response.json()
      setCart(data.cart)
    } catch (error) {
      console.error('Error fetching cart:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId) => {
    try {
      await fetch(`/api/shop/cart?itemId=${itemId}`, { method: 'DELETE' })
      fetchCart()
      refreshCart()
    } catch (error) {
      console.error('Error removing item:', error)
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + (item.configuration.product.price * item.quantity), 0)
  }

  const handleCheckout = () => {
    router.push('/shop/checkout')
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
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Shopping Cart</h1>
          <p className="text-gray-600">{cart?.items?.length || 0} items in your cart</p>
        </motion.div>

        {!cart?.items || cart.items.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h3>
              <p className="text-gray-500 mb-6">Add some products to get started!</p>
              <Button onClick={() => router.push('/shop/gifts')}>
                Browse Products
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
              {cart.items.map((item) => (
                <Card key={item.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex gap-4">
                      <div className="relative w-24 h-24 bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg overflow-hidden flex-shrink-0">
                        {(() => {
                          // Find the selected variant and get its first image
                          const selectedVariant = item.configuration.product.variants?.find(v => v.name === item.configuration.variant)
                          const variantImage = selectedVariant?.images?.[0]
                          const fallbackImage = item.configuration.product.images?.[0]
                          const imageToShow = variantImage || fallbackImage
                          
                          return imageToShow ? (
                            <Image src={imageToShow} alt={item.configuration.product.name} fill className="object-cover" />
                          ) : (
                            <ShoppingCart className="w-12 h-12 text-blue-300 absolute inset-0 m-auto" />
                          )
                        })()} 
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">{item.configuration.product.name}</h3>
                        <p className="text-sm text-gray-600 mb-1">For: {item.configuration.recipientName}</p>
                        <p className="text-sm text-gray-500 mb-2">Variant: {item.configuration.variant}</p>
                        {item.configuration.customText && (
                          <p className="text-xs text-gray-500 mb-2">Message: {item.configuration.customText}</p>
                        )}
                        <p className="text-lg font-bold text-blue-600">₹{item.configuration.product.price}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-red-500 hover:bg-red-50"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div>
              <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-24">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                  <div className="space-y-3 text-sm mb-6">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Subtotal ({cart.items.length} items)</span>
                      <span className="font-medium">₹{calculateTotal()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Shipping</span>
                      <span className="font-medium text-green-600">FREE</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg">
                      <span className="font-bold">Total</span>
                      <span className="font-bold text-blue-600">₹{calculateTotal()}</span>
                    </div>
                  </div>
                  <Button
                    onClick={handleCheckout}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 py-6"
                  >
                    Proceed to Checkout <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
