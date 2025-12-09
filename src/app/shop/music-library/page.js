'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Music, Plus, Play, Download, Lock, Clock } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Script from 'next/script'

export default function MusicLibraryPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [songs, setSongs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Music Library | Aaroh Story Shop'
    if (status === 'unauthenticated') {
      router.push('/login?callbackUrl=/shop/music-library')
    } else if (status === 'authenticated') {
      if (session?.user?.role === 'ADMIN') {
        alert('Admin cannot access user music library. Please use a regular user account.')
        router.push('/shop')
        return
      }
      fetchSongs()
    }
  }, [status, session])

  const fetchSongs = async () => {
    try {
      const response = await fetch('/api/shop/custom-songs/my-library')
      const data = await response.json()
      setSongs(data.songs || [])
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const [paymentLoading, setPaymentLoading] = useState(null)

  const handlePayment = async (songId) => {
    setPaymentLoading(songId)
    try {
      // Create payment order
      const response = await fetch('/api/shop/custom-songs/create-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customSongId: songId })
      })
      const data = await response.json()
      
      if (data.success) {
        // Initialize Razorpay
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.amount,
          currency: data.currency,
          name: 'Aaroh Music',
          description: 'Custom Song Payment',
          order_id: data.orderId,
          handler: async (response) => {
            // Verify payment
            const verifyResponse = await fetch('/api/shop/custom-songs/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                customSongId: data.customSongId
              })
            })
            
            if (verifyResponse.ok) {
              fetchSongs() // Refresh the list
              alert('Payment successful! You can now download your full song.')
            } else {
              alert('Payment verification failed. Please contact support.')
            }
          },
          prefill: {
            name: session?.user?.name || '',
            email: session?.user?.email || ''
          },
          theme: {
            color: '#8B5CF6'
          },
          modal: {
            ondismiss: () => setPaymentLoading(null)
          }
        }
        
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        alert(data.error || 'Failed to create payment order')
      }
    } catch (error) {
      console.error('Payment error:', error)
      alert('Payment failed. Please try again.')
    } finally {
      setPaymentLoading(null)
    }
  }

  const getStatusBadge = (song) => {
    if (song.status === 'completed') {
      return <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">Completed</span>
    }
    if (song.status === 'ready') {
      return <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">Ready for Preview</span>
    }
    if (song.status === 'in_progress') {
      return <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">In Production</span>
    }
    return <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">Pending (2-4 days)</span>
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-teal-50 to-purple-50 pt-28 pb-20 px-4">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">My Music Library</h1>
            <p className="text-gray-600">Your custom songs and compositions</p>
          </div>
          <Button
            onClick={() => router.push('/shop/custom-song')}
            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
          >
            <Plus className="w-4 h-4 mr-2" />
            Order Custom Song
          </Button>
        </motion.div>

        {songs.length === 0 ? (
          <Card className="bg-white/90 backdrop-blur-sm border-0 shadow-xl">
            <CardContent className="p-12 text-center">
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 mb-2">No songs yet</h3>
              <p className="text-gray-500 mb-6">Order your first custom song to get started!</p>
              <Button onClick={() => router.push('/shop/custom-song')}>
                <Plus className="w-4 h-4 mr-2" />
                Order Custom Song
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {songs.map((song) => (
              <Card key={song.id} className="bg-white/90 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="w-full aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden">
                    {song.posterUrl ? (
                      <img src={song.posterUrl} alt={`${song.occasion} Song`} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-16 h-16 text-purple-300" />
                    )}
                  </div>
                  
                  <div className="mb-3">
                    {getStatusBadge(song)}
                  </div>

                  <h3 className="text-lg font-bold text-gray-900 mb-1">{song.occasion} Song</h3>
                  <p className="text-sm text-gray-600 mb-1">For: {song.recipientName}</p>
                  <p className="text-xs text-gray-500 mb-3">{song.style} • {song.mood}</p>
                  
                  {song.status === 'pending' && (
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                      <Clock className="w-4 h-4" />
                      <span>Estimated: 2-3 days</span>
                    </div>
                  )}

                  {song.status === 'ready' && (
                    <div className="space-y-2 mb-4">
                      {song.previewUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => window.open(song.previewUrl, '_blank')}
                        >
                          <Play className="w-4 h-4 mr-2" />
                          Play Preview
                        </Button>
                      )}
                      <Button
                        size="sm"
                        className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
                        onClick={() => handlePayment(song.id)}
                        disabled={paymentLoading === song.id}
                      >
                        {paymentLoading === song.id ? (
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                        ) : (
                          <Lock className="w-4 h-4 mr-2" />
                        )}
                        {paymentLoading === song.id ? 'Processing...' : `Pay ₹${song.amount} to Unlock`}
                      </Button>
                    </div>
                  )}

                  {song.status === 'completed' && (
                    <div className="space-y-2">
                      {song.fullAudioUrl && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="w-full"
                            onClick={() => window.open(song.fullAudioUrl, '_blank')}
                          >
                            <Play className="w-4 h-4 mr-2" />
                            Play Full Song
                          </Button>
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => window.open(song.fullAudioUrl, '_blank')}
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  )
}
