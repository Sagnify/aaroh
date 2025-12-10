'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Music, Upload, Link as LinkIcon, Sparkles, ArrowRight } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter, useParams } from 'next/navigation'
import SpotifySearch from '@/components/shop/SpotifySearch'
import MusicLibrary from '@/components/shop/MusicLibrary'
import Image from 'next/image'
import { useCart } from '@/hooks/useCart'

export default function ConfigureProductPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const { refreshCart } = useCart()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState(1)
  const [selectedImage, setSelectedImage] = useState(0)
  const [currentImages, setCurrentImages] = useState([])
  const [config, setConfig] = useState({
    variant: '',
    customText: '',
    recipientName: '',
    occasion: '',
    songType: null, // 'spotify' | 'upload' | 'link' | 'custom'
    songData: null
  })
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    document.title = 'Customize Your Gift | Aaroh Story Shop'
    if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      alert('Admin cannot place orders. Please use a regular user account.')
      router.push('/shop')
      return
    }
    fetchProduct()
  }, [status, params.productSlug, session])

  useEffect(() => {
    if (product) {
      document.title = `Customize ${product.name} | Aaroh Story Shop`
    }
  }, [product])

  const fetchProduct = async () => {
    try {
      const response = await fetch(`/api/shop/products/${params.productSlug}`)
      const data = await response.json()
      setProduct(data.product)
      // Set default variant - use first variant name or 'Standard' if empty
      const firstVariant = data.product?.variants?.[0]
      const defaultVariant = (firstVariant?.name && firstVariant.name.trim()) ? firstVariant.name : 'Standard'
      setConfig(prev => ({ ...prev, variant: defaultVariant }))
      // Set initial images - use first variant images if available, otherwise main product images
      const initialImages = (firstVariant?.images && firstVariant.images.length > 0) 
        ? firstVariant.images 
        : data.product?.images || []
      setCurrentImages(initialImages)
    } catch (error) {
      console.error('Error fetching product:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSongSelect = (type, data) => {
    setConfig({ ...config, songType: type, songData: data })
  }

  const handleAddToCart = async () => {
    setAddingToCart(true)
    try {
      // Create product configuration (works for both guest and authenticated users)
      const response = await fetch('/api/shop/product-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          configuration: config
        })
      })
      const data = await response.json()
      
      if (data.success) {
        // Check if user is logged in
        if (status === 'authenticated') {
          // Add directly to user's cart
          const cartResponse = await fetch('/api/shop/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ configId: data.orderId })
          })
          
          if (cartResponse.ok) {
            refreshCart()
            router.push('/shop/cart')
          }
        } else {
          // Store in guest cart and redirect to login
          const guestCart = JSON.parse(localStorage.getItem('guestCart') || '[]')
          guestCart.push({ configId: data.orderId, quantity: 1 })
          localStorage.setItem('guestCart', JSON.stringify(guestCart))
          
          // Redirect to login with cart callback
          router.push('/login?callbackUrl=/shop/cart')
        }
      } else {
        alert(data.error || 'Failed to add to cart')
      }
    } catch (error) {
      console.error('Error adding to cart:', error)
      alert('Failed to add to cart. Please try again.')
    } finally {
      setAddingToCart(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 flex items-center justify-center">
        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl p-8">
          <p className="text-gray-600">Product not found</p>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Customize Your {product.name}</h1>
          <p className="text-gray-600">Make it uniquely yours</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-blue-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Product Preview */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl md:sticky md:top-24 h-fit">
            <CardContent className="p-6">
              <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-teal-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                {currentImages && currentImages.length > 0 ? (
                  <Image
                    src={currentImages[selectedImage]}
                    alt={product.name}
                    fill
                    className="object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none'
                      e.target.parentElement.innerHTML = '<svg class="w-20 h-20 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"></path></svg>'
                    }}
                  />
                ) : (
                  <Sparkles className="w-20 h-20 text-blue-300" />
                )}
              </div>
              {currentImages && currentImages.length > 1 && (
                <div className="flex gap-2 mb-4 overflow-x-auto">
                  {currentImages.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImage(idx)}
                      className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        selectedImage === idx ? 'border-blue-500' : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Image src={img} alt={`${product.name} ${idx + 1}`} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900 mb-2">{product.name}</h3>
              <p className="text-gray-600 text-sm mb-4">{product.description}</p>
              <div className="text-3xl font-bold text-blue-600">
                ₹{(() => {
                  if (config.variant && product.variants?.length > 0) {
                    const selectedVariant = product.variants.find(v => v.name === config.variant)
                    return selectedVariant?.price || product.price
                  }
                  return product.price
                })()}
              </div>
            </CardContent>
          </Card>

          {/* Configuration Form */}
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-8">
              {/* Step 1: Product Details */}
              {step === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div>
                    <Label className="text-gray-700 font-semibold mb-3 block">Choose variant</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {product.variants?.map((variant, index) => {
                        const variantPrice = variant.price || product.price
                        return (
                          <button
                            key={variant.id || variant.name || index}
                            onClick={() => {
                              console.log('Clicked variant:', variant.name)
                              console.log('Variant images:', variant.images)
                              console.log('Actual image URLs:', variant.images)
                              
                              setConfig({ ...config, variant: variant.name })
                              // Use variant's own images, fallback to product images only if variant has no images
                              const imagesToShow = variant.images && variant.images.length > 0 
                                ? variant.images 
                                : product.images || []
                              setCurrentImages(imagesToShow)
                              setSelectedImage(0) // Reset to first image
                            }}
                            className={`py-3 px-4 rounded-lg border-2 transition-all text-left relative ${
                              config.variant === variant.name
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-medium">{variant.name}</div>
                            <div className="text-sm text-gray-600">₹{variantPrice}</div>
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="recipientName" className="text-gray-700 font-semibold">Recipient name</Label>
                    <Input
                      id="recipientName"
                      placeholder="Who is this gift for?"
                      value={config.recipientName}
                      onChange={(e) => setConfig({ ...config, recipientName: e.target.value })}
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="customText" className="text-gray-700 font-semibold">Custom message (optional)</Label>
                    <Textarea
                      id="customText"
                      placeholder="Add a personal message..."
                      value={config.customText}
                      onChange={(e) => setConfig({ ...config, customText: e.target.value })}
                      rows={4}
                      className="mt-2"
                    />
                  </div>

                  <Button
                    onClick={() => setStep(2)}
                    disabled={!config.variant || !config.recipientName}
                    className="w-full bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-6"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </motion.div>
              )}

              {/* Step 2: Attach Song (MANDATORY) */}
              {step === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200 mb-6">
                    <p className="text-sm text-blue-800 font-medium">
                      <Music className="w-4 h-4 inline mr-2" />
                      Every gift needs a song! Choose how you want to add music.
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Spotify Search */}
                    <button
                      onClick={() => handleSongSelect('spotify', null)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        config.songType === 'spotify'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Music className="w-6 h-6 text-blue-500" />
                        <div>
                          <div className="font-semibold text-gray-900">Search Spotify</div>
                          <div className="text-sm text-gray-600">Find any song from Spotify</div>
                        </div>
                      </div>
                    </button>

                    {config.songType === 'spotify' && (
                      <div className="pl-4 pt-2">
                        <SpotifySearch onSelect={(song) => setConfig({ ...config, songData: song })} />
                      </div>
                    )}

                    {/* Upload File - Hidden for now */}
                    {false && (
                      <>
                        <button
                          onClick={() => handleSongSelect('upload', null)}
                          className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                            config.songType === 'upload'
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <Upload className="w-6 h-6 text-blue-500" />
                            <div>
                              <div className="font-semibold text-gray-900">Upload Audio</div>
                              <div className="text-sm text-gray-600">Upload your own MP3/WAV file</div>
                            </div>
                          </div>
                        </button>

                        {config.songType === 'upload' && (
                          <div className="pl-4 pt-2">
                            <Input type="file" accept="audio/*" className="bg-white" />
                          </div>
                        )}
                      </>
                    )}

                    {/* Paste Link */}
                    <button
                      onClick={() => handleSongSelect('link', null)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        config.songType === 'link'
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-6 h-6 text-blue-500" />
                        <div>
                          <div className="font-semibold text-gray-900">Paste Link</div>
                          <div className="text-sm text-gray-600">Spotify/YouTube URL</div>
                        </div>
                      </div>
                    </button>

                    {config.songType === 'link' && (
                      <div className="pl-4 pt-2">
                        <Input
                          placeholder="Paste song URL here..."
                          value={config.songData?.url || ''}
                          onChange={(e) => setConfig({ ...config, songData: { url: e.target.value } })}
                          className="bg-white"
                        />
                      </div>
                    )}

                    {/* Select from Library */}
                    <button
                      onClick={() => handleSongSelect('library', null)}
                      className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                        config.songType === 'library'
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-purple-300 bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        <div>
                          <div className="font-semibold text-gray-900">Select from Library</div>
                          <div className="text-sm text-gray-600">Choose from our completed custom songs</div>
                        </div>
                      </div>
                    </button>

                    {config.songType === 'library' && (
                      <div className="pl-4 pt-2">
                        <MusicLibrary 
                          onSelect={(song) => setConfig({ ...config, songData: song })} 
                          selectedSong={config.songData}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      onClick={() => setStep(1)}
                      variant="outline"
                      className="flex-1 py-6"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={() => setStep(3)}
                      disabled={!config.songType || !config.songData}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-6"
                    >
                      Continue <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </motion.div>
              )}

              {/* Step 3: Review & Checkout */}
              {step === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="bg-gradient-to-r from-blue-50 to-teal-50 rounded-lg p-6 border-2 border-blue-200">
                    <h3 className="font-semibold text-gray-900 mb-4">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Product:</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Recipient:</span>
                        <span className="font-medium">{config.recipientName}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Song:</span>
                        <span className="font-medium capitalize">
                          {config.songType === 'library' && config.songData 
                            ? `${config.songData.occasion} Song` 
                            : config.songType}
                        </span>
                      </div>
                      {config.songType === 'library' && config.songData && (
                        <>
                          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3 mt-2 border border-purple-200 dark:border-purple-800">
                            <div className="text-xs text-purple-600 dark:text-purple-300 mb-1">Custom Song Details:</div>
                            <div className="text-xs text-purple-800 dark:text-purple-200 space-y-1">
                              <div>Style: {config.songData.style} • {config.songData.mood}</div>
                              <div>Delivery: {config.songData.deliveryType === 'express' ? 'Express (3 days)' : 'Standard (7 days)'}</div>
                              <div className="font-semibold">Price: ₹{config.songData.amount.toLocaleString()}</div>
                            </div>
                          </div>
                        </>
                      )}
                      <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between text-lg">
                        <span className="font-semibold">Total:</span>
                        <span className="font-bold text-blue-600">
                          ₹{(() => {
                            let basePrice = 0
                            if (config.variant && product.variants?.length > 0) {
                              const selectedVariant = product.variants.find(v => v.name === config.variant)
                              basePrice = selectedVariant?.price || product.price
                            } else {
                              basePrice = product.price
                            }
                            
                            // Add custom song price if selected
                            if (config.songType === 'library' && config.songData) {
                              basePrice += config.songData.amount
                            }
                            
                            return basePrice.toLocaleString()
                          })()}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Button
                      onClick={() => setStep(2)}
                      variant="outline"
                      className="flex-1 py-6"
                    >
                      Back
                    </Button>
                    <Button
                      onClick={handleAddToCart}
                      disabled={addingToCart}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-teal-500 hover:from-blue-600 hover:to-teal-600 text-white py-6 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {addingToCart ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Adding to Cart...
                        </>
                      ) : (
                        'Add to Cart'
                      )}
                    </Button>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
