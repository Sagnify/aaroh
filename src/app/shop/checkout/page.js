'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { MapPin, Phone, Mail, Edit2, Check } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function CheckoutPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState(null)
  const [cart, setCart] = useState(null)
  const [editingAddress, setEditingAddress] = useState(false)
  const [addressForm, setAddressForm] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: ''
  })

  useEffect(() => {
    document.title = 'Checkout | Aaroh Story Shop'
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/shop/checkout')
    } else if (status === 'authenticated') {
      fetchUserProfile()
      fetchCart()
    }
  }, [status])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        setAddressForm({
          name: data.user.name || '',
          phone: data.user.phone || '',
          address: data.user.address || '',
          city: data.user.city || '',
          state: data.user.state || '',
          pincode: data.user.pincode || ''
        })
        
        // Auto-enable editing if address is incomplete
        if (!data.user.address || !data.user.phone || !data.user.city || !data.user.state || !data.user.pincode) {
          setEditingAddress(true)
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/shop/cart')
      const data = await response.json()
      setCart(data.cart)
    } catch (error) {
      console.error('Error fetching cart:', error)
    }
  }

  const calculateTotal = () => {
    if (!cart?.items) return 0
    return cart.items.reduce((sum, item) => sum + (item.configuration.product.price * item.quantity), 0)
  }

  const handleSaveAddress = async () => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressForm)
      })
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
        setEditingAddress(false)
      }
    } catch (error) {
      console.error('Error saving address:', error)
    }
  }

  const isAddressComplete = () => {
    return addressForm.name && addressForm.phone && addressForm.address && 
           addressForm.city && addressForm.state && addressForm.pincode
  }

  const handleProceedToPayment = async () => {
    try {
      const response = await fetch('/api/shop/orders/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart.items.map(item => ({
            product: item.configuration.product,
            recipientName: item.configuration.recipientName,
            customText: item.configuration.customText,
            variant: item.configuration.variant
          })),
          totalAmount: calculateTotal(),
          shippingAddress: {
            name: addressForm.name,
            phone: addressForm.phone,
            address: addressForm.address,
            city: addressForm.city,
            state: addressForm.state,
            pincode: addressForm.pincode
          }
        })
      })
      const data = await response.json()
      if (data.success) {
        // TODO: Integrate with Razorpay payment
        alert('Order created! Payment integration pending')
        router.push(`/orders/${data.orderId}`)
      }
    } catch (error) {
      console.error('Error creating order:', error)
    }
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
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Checkout</h1>
          <p className="text-gray-600">Review your details and complete your order</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Delivery Address */}
          <div className="md:col-span-2 space-y-6">
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Delivery Address
                  </h2>
                  {!editingAddress && isAddressComplete() && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditingAddress(true)}
                    >
                      <Edit2 className="w-4 h-4 mr-2" />
                      Edit
                    </Button>
                  )}
                </div>

                {editingAddress ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        value={addressForm.name}
                        onChange={(e) => setAddressForm({ ...addressForm, name: e.target.value })}
                        placeholder="Enter your full name"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={addressForm.phone}
                        onChange={(e) => setAddressForm({ ...addressForm, phone: e.target.value })}
                        placeholder="Enter your phone number"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={addressForm.address}
                        onChange={(e) => setAddressForm({ ...addressForm, address: e.target.value })}
                        placeholder="House no., Street, Area"
                        className="mt-1"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={addressForm.city}
                          onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                          placeholder="City"
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={addressForm.state}
                          onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                          placeholder="State"
                          className="mt-1"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="pincode">Pincode</Label>
                      <Input
                        id="pincode"
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        placeholder="6-digit pincode"
                        maxLength={6}
                        className="mt-1"
                      />
                    </div>
                    <Button
                      onClick={handleSaveAddress}
                      disabled={!isAddressComplete()}
                      className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600"
                    >
                      <Check className="w-4 h-4 mr-2" />
                      Save Address
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3 text-gray-700">
                    <p className="font-semibold">{user?.name}</p>
                    <p className="text-sm">{user?.address}</p>
                    <p className="text-sm">{user?.city}, {user?.state} - {user?.pincode}</p>
                    <div className="flex items-center gap-4 text-sm pt-2 border-t">
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-blue-500" />
                        {user?.phone}
                      </div>
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-blue-500" />
                        {user?.email}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div>
            <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
                {cart?.items && cart.items.length > 0 && (
                  <div className="mb-4 pb-4 border-b space-y-2 max-h-48 overflow-y-auto">
                    {cart.items.map((item) => (
                      <div key={item.id} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{item.configuration.product.name}</p>
                          <p className="text-xs text-gray-500">For: {item.configuration.recipientName}</p>
                        </div>
                        <p className="font-semibold text-gray-900">₹{item.configuration.product.price}</p>
                      </div>
                    ))}
                  </div>
                )}
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal ({cart?.items?.length || 0} items)</span>
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
                  onClick={handleProceedToPayment}
                  disabled={!isAddressComplete() || editingAddress}
                  className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 py-6"
                >
                  Proceed to Payment
                </Button>
                {!isAddressComplete() && (
                  <p className="text-xs text-red-500 mt-2 text-center">
                    Please complete your address to proceed
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
