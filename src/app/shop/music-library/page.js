'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Music, Plus, Clock, Lock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import AudioPlayer from '@/components/shop/AudioPlayer'
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
        const customSongId = data.customSongId
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
                orderId: customSongId
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
      return <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded">Paid</span>
    }
    if (song.status === 'ready') {
      return <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded">Preview</span>
    }
    if (song.status === 'in_progress') {
      return <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 text-xs rounded">Processing</span>
    }
    return <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 text-xs rounded">Pending</span>
  }

  if (loading || status === 'loading') {
    return (
      <div className="min-h-screen bg-white dark:bg-black pt-28 flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      <div className="min-h-screen bg-white dark:bg-black pt-28 pb-20">
        <div className="max-w-6xl mx-auto px-4 md:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">My Music Library</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">{songs.length} {songs.length === 1 ? 'song' : 'songs'}</p>
            </div>
            <Button
              onClick={() => router.push('/shop/custom-song')}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Song
            </Button>
          </motion.div>

          {songs.length === 0 ? (
            <div className="text-center py-20">
              <Music className="w-16 h-16 text-gray-300 dark:text-gray-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-2">No songs yet</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">Order your first custom song to get started</p>
              <Button onClick={() => router.push('/shop/custom-song')} className="bg-purple-600 hover:bg-purple-700">
                <Plus className="w-4 h-4 mr-2" />
                Order Custom Song
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {songs.map((song, index) => (
                <motion.div
                  key={song.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg hover:bg-gray-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  <div className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Thumbnail */}
                      <div className="w-12 h-12 flex-shrink-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded overflow-hidden">
                        {song.posterUrl ? (
                          <img src={song.posterUrl} alt={song.occasion} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Music className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>

                      {/* Song Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{song.occasion} Song</h3>
                          {getStatusBadge(song)}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <span className="truncate">For: {song.recipientName}</span>
                          <span>•</span>
                          <span>{song.style}</span>
                          <span>•</span>
                          <span>{song.mood}</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {song.status === 'pending' && (
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span className="hidden sm:inline">2-3 days</span>
                          </div>
                        )}

                        {song.status === 'ready' && song.previewUrl && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handlePayment(song.id)}
                            disabled={paymentLoading === song.id}
                            className="whitespace-nowrap"
                          >
                            {paymentLoading === song.id ? (
                              <div className="animate-spin w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full" />
                            ) : (
                              <>
                                <Lock className="w-4 h-4 mr-2" />
                                Unlock ₹{song.amount}
                              </>
                            )}
                          </Button>
                        )}

                        {song.status === 'completed' && song.fullAudioUrl && (
                          <a
                            href={song.fullAudioUrl}
                            download
                            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                          >
                            <Download className="w-5 h-5" />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Audio Player */}
                    {((song.status === 'ready' && song.previewUrl) || (song.status === 'completed' && song.fullAudioUrl)) && (
                      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-zinc-800">
                        <AudioPlayer
                          src={song.status === 'completed' ? song.fullAudioUrl : song.previewUrl}
                          isPreview={song.status === 'ready'}
                          isPaid={song.status === 'completed'}
                          unlockPrice={song.amount}
                          onUnlock={() => handlePayment(song.id)}
                          songId={song.id}
                        />
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
