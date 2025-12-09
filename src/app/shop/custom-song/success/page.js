'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, Music, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

function SuccessContent() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState(null)

  useEffect(() => {
    document.title = 'Order Confirmed | Aaroh Story Shop'
    if (orderId) {
      fetchOrder()
    }
  }, [orderId])

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/shop/custom-songs/${orderId}`)
      const data = await response.json()
      if (data.success) {
        setOrder(data.order)
      }
    } catch (error) {
      console.error('Error fetching order:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-8"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Order Submitted! 🎵</h1>
          <p className="text-gray-600 text-lg">We'll start crafting your song and notify you when ready for preview</p>
        </motion.div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl mb-6">
          <CardContent className="p-8">
            {order ? (
              <div className="space-y-6">
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Order #{order.id.slice(0, 8)}</h2>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    <Music className="w-4 h-4" />
                    Order Received
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Song Details</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occasion:</span>
                        <span className="font-medium">{order.occasion}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">For:</span>
                        <span className="font-medium">{order.recipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Style:</span>
                        <span className="font-medium">{order.style} - {order.mood}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Length:</span>
                        <span className="font-medium">{order.length}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900">Order Info</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
                        <span className="font-bold text-lg">₹{order.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Delivery:</span>
                        <span className="font-medium">{order.deadline === 'express' ? '3 days' : '7 days'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Status:</span>
                        <span className="text-blue-600 font-medium">Pending</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                  <h3 className="font-semibold text-purple-900 mb-3">What happens next?</h3>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Our music team will start working on your song
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Preview ready in 2-4 days - we'll email you!
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Listen to preview in your music library
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Pay only after you love the preview!
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Get full song after payment
                    </li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-600">Loading order details...</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex gap-4">
          <Link href="/shop" className="flex-1">
            <Button variant="outline" className="w-full py-6">
              Continue Shopping
            </Button>
          </Link>
          <Link href="/shop/music-library" className="flex-1">
            <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6">
              View Music Library <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CustomSongSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-28 pb-20 px-4 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  )
}