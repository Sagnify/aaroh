'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Music, Check, Clock, AlertCircle, Upload, Save, Filter, Search, CreditCard, History, ChevronDown, ChevronUp } from 'lucide-react'
import Pagination from '@/components/Pagination'

export default function AdminCustomSongsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('active')
  const [songs, setSongs] = useState([])
  const [completedSongs, setCompletedSongs] = useState([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState({})
  const [saving, setSaving] = useState({})
  const [uploading, setUploading] = useState({})
  const [updatingPayment, setUpdatingPayment] = useState({})
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [completedPage, setCompletedPage] = useState(1)
  const [pagination, setPagination] = useState(null)
  const [completedPagination, setCompletedPagination] = useState(null)
  const [expandedSongs, setExpandedSongs] = useState(new Set())

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }

    document.title = 'Custom Songs | Aaroh Admin'
    fetchSongs()
  }, [session, status, router])

  const fetchSongs = async () => {
    try {
      // Fallback to existing API for now
      const response = await fetch('/api/shop/custom-songs')
      const data = await response.json()
      
      if (data.success) {
        const allSongs = data.songs
        
        // Separate active and completed songs
        const activeSongs = allSongs.filter(song => 
          song.status === 'pending' || song.status === 'in_progress' || song.status === 'ready'
        )
        const completedSongs = allSongs.filter(song => song.status === 'completed')
        
        // Sort by priority (express first) then by creation date
        activeSongs.sort((a, b) => {
          if (a.deliveryType === 'express' && b.deliveryType !== 'express') return -1
          if (b.deliveryType === 'express' && a.deliveryType !== 'express') return 1
          return new Date(b.createdAt) - new Date(a.createdAt)
        })
        
        setSongs(activeSongs)
        setCompletedSongs(completedSongs)
        
        // Simple pagination simulation
        setPagination({ currentPage: 1, totalPages: 1, totalCount: activeSongs.length })
        setCompletedPagination({ currentPage: 1, totalPages: 1, totalCount: completedSongs.length })
      }
    } catch (error) {
      console.error('Error fetching songs:', error)
    } finally {
      setLoading(false)
    }
  }

  const updateSong = async (songId, updates) => {
    // Validate songId to prevent SSRF
    if (!songId || typeof songId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(songId)) {
      console.error('Invalid songId provided')
      return
    }
    
    setUpdating(prev => ({ ...prev, [songId]: true }))
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || session?.csrfToken
      
      const response = await fetch(`/api/admin/custom-songs/${encodeURIComponent(songId)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        await fetchSongs()
      }
    } catch (error) {
      console.error('Error updating song:', error)
    } finally {
      setUpdating(prev => ({ ...prev, [songId]: false }))
    }
  }

  const saveSong = async (songId, updates) => {
    // Validate songId to prevent SSRF
    if (!songId || typeof songId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(songId)) {
      console.error('Invalid songId provided')
      return
    }
    
    setSaving(prev => ({ ...prev, [songId]: true }))
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || session?.csrfToken
      
      const response = await fetch(`/api/admin/custom-songs/${encodeURIComponent(songId)}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(updates)
      })
      
      if (response.ok) {
        await fetchSongs()
        alert('Changes saved successfully!')
      }
    } catch (error) {
      console.error('Error saving song:', error)
      alert('Failed to save changes')
    } finally {
      setSaving(prev => ({ ...prev, [songId]: false }))
    }
  }

  const uploadImage = async (songId, file) => {
    // Validate songId to prevent SSRF
    if (!songId || typeof songId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(songId)) {
      console.error('Invalid songId provided')
      return
    }
    
    setUploading(prev => ({ ...prev, [songId]: true }))
    try {
      const formData = new FormData()
      formData.append('image', file)
      formData.append('songId', songId)
      
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || session?.csrfToken
      if (csrfToken) {
        formData.append('csrfToken', csrfToken)
      }
      
      const response = await fetch('/api/admin/custom-songs/upload-image', {
        method: 'POST',
        body: formData
      })
      
      if (response.ok) {
        const data = await response.json()
        await updateSong(songId, { posterUrl: data.imageUrl })
      } else {
        alert('Failed to upload image')
      }
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image')
    } finally {
      setUploading(prev => ({ ...prev, [songId]: false }))
    }
  }

  const approveSong = async (songId) => {
    // Validate songId to prevent SSRF
    if (!songId || typeof songId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(songId)) {
      console.error('Invalid songId provided')
      return
    }
    
    setUpdating(prev => ({ ...prev, [songId]: true }))
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || session?.csrfToken
      
      const response = await fetch('/api/admin/custom-songs/approve', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ songId })
      })
      
      if (response.ok) {
        await fetchSongs()
        alert('Song approved and user notified!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to approve song')
      }
    } catch (error) {
      console.error('Error approving song:', error)
      alert('Failed to approve song')
    } finally {
      setUpdating(prev => ({ ...prev, [songId]: false }))
    }
  }

  const toggleSongExpansion = (songId) => {
    setExpandedSongs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(songId)) {
        newSet.delete(songId)
      } else {
        newSet.add(songId)
      }
      return newSet
    })
  }

  const updatePaymentStatus = async (songId, paymentStatus) => {
    if (!confirm(`Are you sure you want to mark this song as ${paymentStatus}?`)) return
    
    // Validate songId to prevent SSRF
    if (!songId || typeof songId !== 'string' || !/^[a-zA-Z0-9_-]+$/.test(songId)) {
      console.error('Invalid songId provided')
      return
    }
    
    setUpdatingPayment(prev => ({ ...prev, [songId]: true }))
    try {
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || session?.csrfToken
      
      const response = await fetch(`/api/admin/custom-songs/${encodeURIComponent(songId)}/update-payment-status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify({ paymentStatus })
      })
      
      if (response.ok) {
        await fetchSongs()
        alert(`Payment status updated to ${paymentStatus}!`)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to update payment status')
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
      alert('Failed to update payment status')
    } finally {
      setUpdatingPayment(prev => ({ ...prev, [songId]: false }))
    }
  }

  const getStatusBadge = (song) => {
    if (song.status === 'completed') {
      return <Badge className="bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300">Paid</Badge>
    }
    if (song.status === 'ready' && song.isApproved) {
      return <Badge className="bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300">Ready</Badge>
    }
    if (song.previewUrl && !song.isApproved) {
      return <Badge className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-300">Needs Approval</Badge>
    }
    if (song.status === 'in_progress') {
      return <Badge className="bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300">In Progress</Badge>
    }
    return <Badge className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300">Pending</Badge>
  }

  const getPriorityBadge = (song) => {
    if (song.deliveryType === 'express') {
      return <Badge className="bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-200 dark:border-red-800">🔥 High Priority</Badge>
    }
    return <Badge className="bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700">Standard</Badge>
  }

  if (loading) {
    return (
      <div className="pt-16 dark:bg-black min-h-screen">
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-zinc-200 rounded w-1/4"></div>
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-zinc-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-16 dark:bg-black min-h-screen">
      <div className="max-w-7xl mx-auto px-0 md:px-6 py-4 md:py-8">
        <div className="mb-6 md:mb-8 px-3 md:px-0">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">Custom Songs Management</h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">Manage custom song orders and approvals</p>
        </div>

        {/* Tabs */}
        <div className="border-b mb-4 md:mb-6 -mx-3 md:mx-0">
          <nav className="flex space-x-4 md:space-x-8 px-3 md:px-0">
            {[
              { id: 'active', label: 'Active Orders', count: songs.length },
              { id: 'completed', label: 'Past Orders', count: completedSongs.length }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-xs md:text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden">{tab.id === 'active' ? 'Active' : 'Past'}</span>
                <span className="ml-1">({tab.count})</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Filters - Only for Active Tab */}
        {activeTab === 'active' && (
          <Card className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mb-4 md:mb-6 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
            <CardContent className="p-3 md:p-4">
              <div className="flex flex-col gap-3 md:gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search by customer name, occasion, or recipient..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 text-sm md:text-base"
                    />
                  </div>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-3 px-3 md:mx-0 md:px-0">
                  <select 
                    value={statusFilter} 
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="border dark:border-zinc-700 rounded-lg px-2 md:px-3 py-2 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs md:text-sm whitespace-nowrap"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="needs_approval">Needs Approval</option>
                  </select>
                  <select 
                    value={priorityFilter} 
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="border dark:border-zinc-700 rounded-lg px-2 md:px-3 py-2 bg-white dark:bg-zinc-950 text-zinc-700 dark:text-zinc-300 text-xs md:text-sm whitespace-nowrap"
                  >
                    <option value="all">All Priority</option>
                    <option value="express">High Priority</option>
                    <option value="standard">Standard</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="space-y-0 md:space-y-4">
          {(activeTab === 'active' ? 
            songs.filter(song => {
              const matchesSearch = searchTerm === '' || 
                song.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                song.occasion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                song.recipientName?.toLowerCase().includes(searchTerm.toLowerCase())
              
              const matchesStatus = statusFilter === 'all' ||
                (statusFilter === 'needs_approval' && song.previewUrl && !song.isApproved) ||
                song.status === statusFilter
              
              const matchesPriority = priorityFilter === 'all' || song.deliveryType === priorityFilter
              
              return matchesSearch && matchesStatus && matchesPriority
            }) : completedSongs
          ).map((song) => (
            <Card key={song.id} className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
              <CardContent className="p-0">
                <div 
                  className="p-3 md:p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-zinc-900/50 transition-colors"
                  onClick={() => toggleSongExpansion(song.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center flex-shrink-0">
                      {song.posterUrl ? (
                        <img src={song.posterUrl} alt={song.occasion} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <Music className="w-5 h-5 md:w-6 md:h-6 text-white" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm md:text-base font-bold text-gray-900 dark:text-white truncate">{song.occasion} Song</h3>
                        {getPriorityBadge(song)}
                        {getStatusBadge(song)}
                      </div>
                      <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 truncate">For: {song.recipientName} • ₹{song.amount}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-blue-600 font-medium hidden sm:inline">
                        {expandedSongs.has(song.id) ? 'Less' : 'More'}
                      </span>
                      {expandedSongs.has(song.id) ? 
                        <ChevronUp className="w-4 h-4 text-blue-600" /> : 
                        <ChevronDown className="w-4 h-4 text-blue-600" />
                      }
                    </div>
                  </div>
                </div>
                
                {expandedSongs.has(song.id) && (
                  <div className="border-t dark:border-zinc-800 p-3 md:p-6 bg-gray-50 dark:bg-zinc-900/30">
                <div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-6">
                  <div className="relative w-12 h-12 md:w-16 md:h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center flex-shrink-0 group cursor-pointer overflow-hidden">
                    {song.posterUrl ? (
                      <img src={song.posterUrl} alt={song.occasion} className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-6 h-6 md:w-8 md:h-8 text-white" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      {uploading[song.id] ? (
                        <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full" />
                      ) : (
                        <Upload className="w-3 h-3 md:w-4 md:h-4 text-white" />
                      )}
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) uploadImage(song.id, file)
                      }}
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                      <h3 className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                        {song.occasion} Song
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {getPriorityBadge(song)}
                        {getStatusBadge(song)}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 text-xs md:text-sm text-gray-600 dark:text-gray-400 mb-4">
                      <div className="break-words">
                        <span className="font-medium">For:</span> {song.recipientName}
                      </div>
                      <div className="break-words">
                        <span className="font-medium">Customer:</span> {song.userName}
                      </div>
                      <div className="break-words">
                        <span className="font-medium">Style:</span> {song.style} • {song.mood}
                      </div>
                      <div>
                        <span className="font-medium">Amount:</span> ₹{song.amount}
                      </div>
                    </div>

                    {/* Payment History - Only show if there's history */}
                    {(song.orderIdHistory?.length > 0 || song.repaymentCount > 0 || song.adminResetCount > 0) && (
                      <div className="mb-4 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                        <div className="flex items-center gap-2 mb-2">
                          <History className="w-4 h-4 text-gray-500" />
                          <span className="text-xs md:text-sm font-medium text-gray-700 dark:text-gray-300">Payment History</span>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-xs">
                          <div className="text-center">
                            <div className="font-bold text-blue-600">{song.orderIdHistory?.length || 0}</div>
                            <div className="text-gray-500 text-xs">Customer Repayments</div>
                          </div>
                          <div className="text-center">
                            <div className="font-bold text-orange-600">{song.adminResetCount || 0}</div>
                            <div className="text-gray-500 text-xs">Admin Resets</div>
                          </div>
                        </div>
                        {song.orderIdHistory?.length > 0 && (
                          <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                            <div className="text-xs text-gray-500 mb-1">Order History ({song.orderIdHistory.length} previous orders):</div>
                            <div className="space-y-1">
                              {song.orderIdHistory.slice(-3).map((orderId, index) => (
                                <div key={index} className="text-xs text-gray-500">
                                  <code className="bg-gray-100 dark:bg-gray-800 px-1 rounded break-all">{orderId}</code>
                                </div>
                              ))}
                              {song.orderIdHistory.length > 3 && (
                                <div className="text-xs text-gray-400">... and {song.orderIdHistory.length - 3} more</div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}



                    {activeTab === 'active' ? (
                      <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Preview URL</label>
                          <Input
                            id={`preview-${song.id}`}
                            placeholder="Enter preview URL"
                            defaultValue={song.previewUrl || ''}
                            className="text-xs md:text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Full Audio URL</label>
                          <Input
                            id={`full-${song.id}`}
                            placeholder="Enter full audio URL"
                            defaultValue={song.fullAudioUrl || ''}
                            className="text-xs md:text-sm"
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-3 md:gap-4 mb-4">
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Preview URL</label>
                          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg break-all">
                            {song.previewUrl || 'Not provided'}
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs md:text-sm font-medium mb-1 text-gray-900 dark:text-gray-200">Full Audio URL</label>
                          <div className="text-xs md:text-sm text-gray-600 dark:text-gray-400 p-2 bg-gray-50 dark:bg-zinc-900 rounded-lg break-all">
                            {song.fullAudioUrl || 'Not provided'}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeTab === 'active' && (
                      <div className="flex gap-2 mb-4">
                        <Button
                          onClick={() => {
                            const previewUrl = document.getElementById(`preview-${song.id}`).value
                            const fullAudioUrl = document.getElementById(`full-${song.id}`).value
                            saveSong(song.id, { previewUrl, fullAudioUrl })
                          }}
                          disabled={saving[song.id]}
                          variant="outline"
                          size="sm"
                          className="text-xs md:text-sm"
                        >
                          {saving[song.id] ? (
                            <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-gray-600 border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <Save className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              <span className="hidden sm:inline">Save Changes</span>
                              <span className="sm:hidden">Save</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {activeTab === 'active' && song.previewUrl && !song.isApproved && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                        <AlertCircle className="w-5 h-5 text-orange-500 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-orange-800 dark:text-orange-200">
                            Ready for Approval
                          </p>
                          <p className="text-xs text-orange-600 dark:text-orange-300">
                            Preview URL added. Click approve to notify the user.
                          </p>
                        </div>
                        <Button
                          onClick={() => approveSong(song.id)}
                          disabled={updating[song.id]}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm self-start sm:self-auto"
                          size="sm"
                        >
                          {updating[song.id] ? (
                            <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <>
                              <Check className="w-3 h-3 md:w-4 md:h-4 mr-1 md:mr-2" />
                              <span className="hidden sm:inline">Approve & Notify</span>
                              <span className="sm:hidden">Approve</span>
                            </>
                          )}
                        </Button>
                      </div>
                    )}

                    {song.isApproved && (
                      <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                        <Check className="w-4 h-4" />
                        <span className="text-xs md:text-sm font-medium">Approved - User notified</span>
                      </div>
                    )}

                    {/* Payment Status Management */}
                    {activeTab === 'active' && song.status === 'ready' && song.isApproved && (
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl mt-4">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs md:text-sm font-medium text-blue-800 dark:text-blue-200">
                            Payment Management
                          </p>
                          <p className="text-xs text-blue-600 dark:text-blue-300">
                            User can now pay for the full version. You can manually mark as paid if needed.
                          </p>
                        </div>
                        <Button
                          onClick={() => updatePaymentStatus(song.id, 'paid')}
                          disabled={updatingPayment[song.id]}
                          className="bg-green-600 hover:bg-green-700 text-white text-xs md:text-sm self-start sm:self-auto"
                          size="sm"
                        >
                          {updatingPayment[song.id] ? (
                            <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-white border-t-transparent rounded-full" />
                          ) : (
                            <span className="whitespace-nowrap">Mark as Paid</span>
                          )}
                        </Button>
                      </div>
                    )}

                    {activeTab === 'completed' && song.status === 'completed' && (
                      <div className="space-y-3">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 md:p-4 bg-green-50 dark:bg-green-900/20 rounded-xl">
                          <div className="flex-1 min-w-0">
                            <p className="text-xs md:text-sm font-medium text-green-800 dark:text-green-200">
                              Payment Completed
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-300">
                              User has paid ₹{song.amount}. You can reset to unpaid if there was an issue.
                            </p>
                            {song.razorpayPaymentId && (
                              <p className="text-xs text-green-600 dark:text-green-300 mt-1 break-all">
                                Payment ID: {song.razorpayPaymentId}
                              </p>
                            )}
                          </div>
                          <Button
                            onClick={() => updatePaymentStatus(song.id, 'unpaid')}
                            disabled={updatingPayment[song.id]}
                            variant="outline"
                            className="border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20 text-xs md:text-sm self-start sm:self-auto"
                            size="sm"
                          >
                            {updatingPayment[song.id] ? (
                              <div className="animate-spin w-3 h-3 md:w-4 md:h-4 border-2 border-orange-600 border-t-transparent rounded-full" />
                            ) : (
                              <span className="whitespace-nowrap">Reset to Unpaid</span>
                            )}
                          </Button>
                        </div>
                      </div>
                    )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {(activeTab === 'active' ? songs : completedSongs).length === 0 && (
            <Card className="bg-white dark:bg-zinc-950 border-0 md:border dark:border-zinc-800 mx-0 rounded-none md:rounded-2xl shadow-sm md:shadow-lg">
              <CardContent className="p-8 md:p-12 text-center">
                <Music className="w-10 h-10 md:w-12 md:h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-base md:text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {activeTab === 'active' ? 'No active orders' : 'No completed orders'}
                </h3>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-400">
                  {activeTab === 'active' 
                    ? 'Active custom song orders will appear here for management.'
                    : 'Completed orders will appear here for reference.'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Pagination */}
        {activeTab === 'active' && pagination && pagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination 
              currentPage={currentPage} 
              totalPages={pagination.totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}
        
        {activeTab === 'completed' && completedPagination && completedPagination.totalPages > 1 && (
          <div className="mt-6">
            <Pagination 
              currentPage={completedPage} 
              totalPages={completedPagination.totalPages} 
              onPageChange={setCompletedPage} 
            />
          </div>
        )}
      </div>
    </div>
  )
}