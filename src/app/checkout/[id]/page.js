"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import Loader from '@/components/Loader'
import { ShoppingCart, CreditCard, Lock, CheckCircle, ArrowLeft, XCircle, Home } from 'lucide-react'
import Link from 'next/link'
import { calculateDiscountPercentage, hasDiscount } from '@/lib/discount-utils'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState(null) // 'success', 'failed', null
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push(`/login?callbackUrl=/checkout/${params.id}`)
      return
    }
    
    fetchCourse()
    fetchUserProfile()
  }, [session, status, params.id])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const profile = await response.json()
        setFormData({
          email: session.user.email || '',
          name: session.user.name || profile.name || '',
          phone: profile.phone || ''
        })
      } else {
        setFormData({
          email: session.user.email || '',
          name: session.user.name || '',
          phone: ''
        })
      }
    } catch (error) {
      setFormData({
        email: session.user.email || '',
        name: session.user.name || '',
        phone: ''
      })
    }
  }

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePurchase = async () => {
    setProcessing(true)
    setError('')

    if (!formData.name || !formData.phone) {
      setError('Please fill in all required fields')
      setProcessing(false)
      return
    }

    try {
      // Load Razorpay script
      const scriptLoaded = await loadRazorpayScript()
      if (!scriptLoaded) {
        setError('Payment gateway failed to load. Please try again.')
        setProcessing(false)
        return
      }

      // Create order
      const orderResponse = await fetch('/api/payment/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: params.id })
      })

      if (!orderResponse.ok) {
        const errorData = await orderResponse.json()
        setError(errorData.error || 'Failed to create order')
        setProcessing(false)
        return
      }

      const orderData = await orderResponse.json()

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Aaroh Music Academy',
        description: `Purchase: ${orderData.course.title}`,
        order_id: orderData.orderId,
        prefill: {
          name: formData.name,
          email: formData.email,
          contact: formData.phone
        },
        theme: {
          color: '#a0303f'
        },
        handler: async function (response) {
          try {
            // Verify payment
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                purchaseId: orderData.purchaseId
              })
            })

            if (verifyResponse.ok) {
              setPaymentStatus('success')
            } else {
              setPaymentStatus('failed')
              setError('Payment verification failed. Please contact support.')
            }
          } catch (error) {
            setPaymentStatus('failed')
            setError('Payment verification failed. Please contact support.')
          } finally {
            setProcessing(false)
          }
        },
        modal: {
          ondismiss: function() {
            setProcessing(false)
            setPaymentStatus('failed')
            setError('Payment was cancelled')
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      setError('Payment failed. Please try again.')
      setProcessing(false)
    }
  }

  if (status === 'loading' || loading) {
    return <Loader />
  }

  if (!session) {
    return null
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <p className="text-gray-600">The course you're trying to purchase doesn't exist.</p>
        </div>
      </div>
    )
  }

  // Success Screen
  if (paymentStatus === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Successful!</h1>
            <p className="text-gray-600 mb-6">Your course purchase has been completed successfully.</p>
            <div className="space-y-3">
              <Button 
                onClick={() => router.push(`/course/${params.id}`)}
                className="w-full bg-gradient-to-r from-[#ff6b6b] to-[#ffb088] hover:from-[#e55a5a] hover:to-[#ff9f73] text-white"
              >
                Access Course
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/my-courses')}
                className="w-full"
              >
                View My Courses
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Failure Screen
  if (paymentStatus === 'failed') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
        <Card className="max-w-md mx-auto bg-white/90 backdrop-blur-sm border shadow-lg">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Failed</h1>
            <p className="text-gray-600 mb-2">Your payment could not be processed.</p>
            {error && <p className="text-red-600 text-sm mb-6">{error}</p>}
            <div className="space-y-3">
              <Button 
                onClick={() => {
                  setPaymentStatus(null)
                  setError('')
                }}
                className="w-full bg-gradient-to-r from-[#ff6b6b] to-[#ffb088] hover:from-[#e55a5a] hover:to-[#ff9f73] text-white"
              >
                Try Again
              </Button>
              <Button 
                variant="outline" 
                onClick={() => router.push('/')}
                className="w-full"
              >
                <Home className="w-4 h-4 mr-2" />
                Go Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href={`/courses/${params.id}`} className="inline-flex items-center text-[#a0303f] hover:text-[#ff6b6b] transition-colors">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Course
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#a0303f]/10 to-[#ff6b6b]/10">
              <CardTitle className="flex items-center gap-2 text-[#a0303f]">
                <ShoppingCart className="w-5 h-5" />
                Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex gap-4 mb-6">
                <div className="w-20 h-20 bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20 rounded-lg flex items-center justify-center">
                  <CreditCard className="w-8 h-8 text-[#a0303f]" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-[#a0303f] mb-1">{course.title}</h3>
                  <p className="text-sm text-gray-600 mb-2">{course.subtitle}</p>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span>{course.lessons} lessons</span>
                    <span>•</span>
                    <span>{course.duration}</span>
                  </div>
                </div>
              </div>

              <div className="border-t pt-4 space-y-3">
                <div className="flex justify-between">
                  <span>Course Price</span>
                  <span>₹{course.price.toLocaleString()}</span>
                </div>
                {hasDiscount(course.price, course.originalPrice) && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount ({calculateDiscountPercentage(course.price, course.originalPrice)}% OFF)</span>
                    <span>-₹{(course.originalPrice - course.price).toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t pt-3 flex justify-between text-lg font-bold text-[#a0303f]">
                  <span>Total</span>
                  <span>₹{course.price.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-6 p-4 bg-green-50 rounded-lg">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-medium">What's included:</span>
                </div>
                <ul className="text-sm text-green-600 space-y-1">
                  <li>• Lifetime access to course content</li>
                  <li>• Certificate of completion</li>
                  <li>• Mobile and desktop access</li>
                  <li>• Progress tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
            <CardHeader className="bg-gradient-to-r from-[#a0303f]/10 to-[#ff6b6b]/10">
              <CardTitle className="flex items-center gap-2 text-[#a0303f]">
                <Lock className="w-5 h-5" />
                Checkout Details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4 mb-6">
                <div>
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="mt-1"
                    disabled
                  />
                </div>
                <div>
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="mt-1"
                    placeholder="+91 98765 43210"
                    required
                  />
                </div>
              </div>

              <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center gap-2 text-blue-700 mb-2">
                  <Lock className="w-4 h-4" />
                  <span className="font-medium">Secure Payment</span>
                </div>
                <p className="text-sm text-blue-600">
                  Your payment information is encrypted and secure. We'll redirect you to our payment gateway to complete the purchase.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button
                onClick={handlePurchase}
                disabled={processing || !formData.name || !formData.phone}
                className="w-full bg-gradient-to-r from-[#ff6b6b] to-[#ffb088] hover:from-[#e55a5a] hover:to-[#ff9f73] text-white text-lg py-3"
              >
                {processing ? 'Processing...' : `Complete Purchase - ₹${course.price.toLocaleString()}`}
              </Button>

              <p className="text-xs text-gray-500 text-center mt-4">
                By completing your purchase, you agree to our Terms of Service and Privacy Policy.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}