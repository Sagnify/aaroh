'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Music, ArrowRight, Sparkles } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useRouter } from 'next/navigation'


export default function CustomSongPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [step, setStep] = useState(1)

  useEffect(() => {
    document.title = 'Create Your Custom Song | Aaroh Story Shop'
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/shop/custom-song')
    } else if (status === 'authenticated' && session?.user?.role === 'ADMIN') {
      alert('Admin cannot place orders. Please use a regular user account.')
      router.push('/shop')
      return
    }
    fetchPricing()
  }, [status, session])

  const fetchPricing = async () => {
    try {
      const response = await fetch('/api/admin/custom-song-settings')
      const data = await response.json()
      if (data.success) {
        setPricing(data.settings)
      }
    } catch (error) {
      console.error('Error fetching pricing:', error)
    }
  }
  const [formData, setFormData] = useState({
    occasion: '',
    recipientName: '',
    story: '',
    mood: '',
    style: '',
    language: 'English',
    length: '2-3 minutes',
    deadline: 'standard'
  })

  const occasions = ['Birthday', 'Anniversary', 'Wedding', 'Valentine', 'Friendship', 'Other']
  const moods = ['Happy', 'Romantic', 'Emotional', 'Upbeat', 'Calm', 'Nostalgic']
  const styles = ['Pop', 'Acoustic', 'Rock', 'Classical', 'Bollywood', 'Jazz']

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [pricing, setPricing] = useState({ standardPrice: 2999, expressPrice: 4499 })

  const handleSubmit = async () => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/shop/custom-songs/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      const data = await response.json()
      
      if (data.success) {
        router.push(`/shop/custom-song/success?orderId=${data.orderId}`)
      } else {
        alert(data.error || 'Failed to create order')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Failed to create order. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 pt-28 pb-20 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">Create Your Custom Song</h1>
          <p className="text-gray-600">Tell us your story, we'll craft your melody</p>
        </motion.div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                step >= s ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {s}
              </div>
              {s < 3 && <div className={`w-12 h-1 ${step > s ? 'bg-purple-500' : 'bg-gray-200'}`} />}
            </div>
          ))}
        </div>

        <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
          <CardContent className="p-8">
            {/* Step 1: Story & Occasion */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-gray-700 font-semibold mb-3 block">What's the occasion?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {occasions.map((occ) => (
                      <button
                        key={occ}
                        onClick={() => setFormData({ ...formData, occasion: occ })}
                        className={`py-3 px-4 rounded-lg border-2 transition-all ${
                          formData.occasion === occ
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {occ}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label htmlFor="recipientName" className="text-gray-700 font-semibold">Who is this for?</Label>
                  <Input
                    id="recipientName"
                    placeholder="Recipient's name"
                    value={formData.recipientName}
                    onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="story" className="text-gray-700 font-semibold">Tell us your story</Label>
                  <Textarea
                    id="story"
                    placeholder="Share the memories, moments, or message you want in the song..."
                    value={formData.story}
                    onChange={(e) => setFormData({ ...formData, story: e.target.value })}
                    rows={6}
                    className="mt-2"
                  />
                  <p className="text-sm text-gray-500 mt-2">The more details, the more personal your song!</p>
                </div>

                <Button
                  onClick={() => setStep(2)}
                  disabled={!formData.occasion || !formData.story}
                  className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6"
                >
                  Continue <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </motion.div>
            )}

            {/* Step 2: Musical Preferences */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div>
                  <Label className="text-gray-700 font-semibold mb-3 block">What mood should it have?</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {moods.map((mood) => (
                      <button
                        key={mood}
                        onClick={() => setFormData({ ...formData, mood })}
                        className={`py-3 px-4 rounded-lg border-2 transition-all ${
                          formData.mood === mood
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {mood}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <Label className="text-gray-700 font-semibold mb-3 block">Musical style</Label>
                  <div className="grid grid-cols-3 gap-3">
                    {styles.map((style) => (
                      <button
                        key={style}
                        onClick={() => setFormData({ ...formData, style })}
                        className={`py-3 px-4 rounded-lg border-2 transition-all ${
                          formData.style === style
                            ? 'border-purple-500 bg-purple-50 text-purple-700'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {style}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button
                    onClick={() => setStep(1)}
                    variant="outline"
                    className="flex-1 py-6"
                  >
                    Back
                  </Button>
                  <Button
                    onClick={() => setStep(3)}
                    disabled={!formData.mood || !formData.style}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6"
                  >
                    Continue <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Step 3: Details & Pricing */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >


                <div>
                  <Label className="text-gray-700 font-semibold mb-3 block">Choose your package</Label>
                  <div className="space-y-3">
                    {[
                      { value: 'standard', label: 'Standard Package', price: `₹${pricing.standardPrice.toLocaleString()}` },
                      { value: 'express', label: 'Priority Package', price: `₹${pricing.expressPrice.toLocaleString()}` }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setFormData({ ...formData, deadline: option.value })}
                        className={`w-full py-4 px-4 rounded-lg border-2 transition-all flex justify-between items-center ${
                          formData.deadline === option.value
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="font-medium">{option.label}</span>
                        <span className="text-lg font-bold text-purple-600">{option.price}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-purple-50 rounded-lg p-6 border-2 border-purple-200">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="font-semibold text-purple-900">What you'll get:</span>
                  </div>
                  <ul className="space-y-2 text-sm text-purple-800">
                    <li>✓ Professionally produced custom song</li>
                    <li>✓ High-quality audio file (MP3 & WAV)</li>
                    <li>✓ Lyrics sheet with your story</li>
                    <li>✓ Preview before payment</li>
                    <li>✓ Pay only after you love it</li>
                  </ul>
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
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-6 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Order'}
                  </Button>
                </div>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
    </>
  )
}
