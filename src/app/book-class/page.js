"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Users, Phone } from "lucide-react"

export default function BookClass() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const classType = searchParams.get('type')
  
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [userProfile, setUserProfile] = useState(null)
  const [autoBooking, setAutoBooking] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!session) {
      router.push('/login')
      return
    }
    fetchUserProfile()
  }, [session, router])

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/api/profile')
      if (response.ok) {
        const profile = await response.json()
        setUserProfile(profile)
        if (profile.phone) {
          setPhone(profile.phone)
          // Auto-book if user has phone number
          handleAutoBooking(profile.phone)
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleAutoBooking = async (userPhone) => {
    setAutoBooking(true)
    try {
      const response = await fetch('/api/class-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classType,
          phone: userPhone
        })
      })

      if (response.ok) {
        router.push('/booking-success')
      } else {
        const data = await response.json()
        setError(data.error || 'Auto-booking failed. Please fill the form below.')
        setAutoBooking(false)
      }
    } catch (error) {
      setError('Network error during auto-booking. Please fill the form below.')
      setAutoBooking(false)
    }
  }

  const getClassTitle = () => {
    switch(classType) {
      case 'PRIVATE': return '1-on-1 Private Sessions'
      case 'GROUP': return 'Group Classes'
      case 'OFFLINE': return 'Offline Classes (Kolkata)'
      default: return 'Live Classes'
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    
    if (!phone.trim()) {
      setError('Phone number is required')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/class-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          classType,
          phone: phone.trim()
        })
      })

      if (response.ok) {
        router.push('/booking-success')
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to submit booking request')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!session) return null

  if (autoBooking) {
    return (
      <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 flex items-center justify-center">
        <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl border-0">
          <CardContent className="text-center py-12">
            <Users className="w-16 h-16 text-[#a0303f] mx-auto mb-4 animate-pulse" />
            <h2 className="text-xl font-semibold text-[#a0303f] mb-2">Booking Your Class...</h2>
            <p className="text-gray-600">Using your saved information</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 flex items-center justify-center">
      <Card className="w-full max-w-md bg-white/80 backdrop-blur-sm shadow-xl border-0">
        <CardHeader className="text-center">
          <Users className="w-16 h-16 text-[#a0303f] mx-auto mb-4" />
          <CardTitle className="text-2xl text-[#a0303f]">Book {getClassTitle()}</CardTitle>
          <p className="text-gray-600">We need your phone number to contact you</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Name
              </label>
              <Input
                value={session.user.name || ''}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                value={session.user.email}
                disabled
                className="bg-gray-50"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number / WhatsApp Number *
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 9876543210"
                  className="pl-10"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                {userProfile?.phone ? 'Using phone number from your profile' : 'We\'ll contact you on this number to schedule your class'}
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm text-center bg-red-50 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <Button
              type="submit"
              className="w-full bg-[#a0303f] hover:bg-[#a0303f]/90 text-white"
              disabled={loading}
            >
              {loading ? 'Submitting...' : 'Submit Booking Request'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}