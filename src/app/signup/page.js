"use client"

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import Loader from '@/components/Loader'
import { Music, Mail, ArrowLeft } from 'lucide-react'

export default function Signup() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get('callbackUrl') || '/dashboard'
  const { data: session, status } = useSession()

  useEffect(() => {
    document.title = 'Sign Up - Aaroh'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (session) {
      if (session.user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push(callbackUrl)
      }
    }
  }, [session, status, router, callbackUrl])

  const handleSendOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (response.ok) {
        setStep(2)
      } else {
        const data = await response.json()
        setError(data.error || 'Failed to send OTP')
      }
    } catch (error) {
      setError('Failed to send OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOTP = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      })

      if (response.ok) {
        setStep(3)
      } else {
        const data = await response.json()
        setError(data.error || 'Invalid OTP')
      }
    } catch (error) {
      setError('Failed to verify OTP. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'Password must be at least 8 characters long'
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Password must contain at least one lowercase letter'
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Password must contain at least one uppercase letter'
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Password must contain at least one number'
    }
    return null
  }

  const validatePhone = (phone) => {
    const phoneRegex = /^[6-9]\d{9}$/
    if (!phoneRegex.test(phone.replace(/\D/g, ''))) {
      return 'Please enter a valid 10-digit Indian mobile number'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Validate phone number
    const phoneError = validatePhone(formData.phone)
    if (phoneError) {
      setError(phoneError)
      setLoading(false)
      return
    }

    // Validate password strength
    const passwordError = validatePassword(formData.password)
    if (passwordError) {
      setError(passwordError)
      setLoading(false)
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      setLoading(false)
      return
    }

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: email,
          phone: formData.phone,
          password: formData.password
        })
      })

      if (response.ok) {
        const result = await signIn('credentials', {
          email: email,
          password: formData.password,
          redirect: false
        })

        if (!result?.error) {
          router.push(callbackUrl)
        } else {
          setError('Registration successful but login failed. Please login manually.')
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Registration failed')
      }
    } catch (error) {
      setError('Registration failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <Loader />
  }

  if (session) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50 pt-16">
      <Card className="w-full max-w-md bg-white shadow-sm border">
        <CardHeader className="text-center space-y-4">
          <div className="w-12 h-12 bg-[#a0303f] rounded-lg flex items-center justify-center mx-auto">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">
              {step === 1 ? 'Create Account' : step === 2 ? 'Verify Email' : 'Complete Profile'}
            </CardTitle>
            <p className="text-sm text-gray-500 mt-1">
              {step === 1 ? 'Join Aaroh and start learning' : step === 2 ? 'Enter the code sent to your email' : 'Fill in your details'}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSendOTP} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#ff6b6b] hover:bg-[#e55a5a] text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Sending OTP...</span>
                  </div>
                ) : (
                  <><Mail className="w-4 h-4 mr-2" />Send Verification Code</>
                )}
              </Button>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
                <p className="text-blue-800 text-sm text-center">
                  We sent a 6-digit code to <strong>{email}</strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verification Code
                </label>
                <Input
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  maxLength={6}
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => { setStep(1); setOtp(''); setError('') }}
                  className="flex-1"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />Change Email
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-[#ff6b6b] hover:bg-[#e55a5a] text-white"
                  disabled={loading || otp.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify'}
                </Button>
              </div>
              <Button
                type="button"
                variant="ghost"
                onClick={handleSendOTP}
                className="w-full text-sm"
                disabled={loading}
              >
                Resend Code
              </Button>
            </form>
          )}

          {step === 3 && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-3 mb-4">
                <p className="text-green-800 text-sm text-center">
                  Email verified: <strong>{email}</strong>
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <Input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="Enter your full name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  placeholder="Enter 10-digit mobile number"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <PasswordInput
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  placeholder="Create a password"
                  required
                />
                <p className="text-xs text-gray-500 mt-1">Min 8 chars with uppercase, lowercase & number</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <PasswordInput
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                  placeholder="Confirm your password"
                  required
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-[#ff6b6b] hover:bg-[#e55a5a] text-white"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creating account...</span>
                  </div>
                ) : (
                  'Create Account'
                )}
              </Button>
            </form>
          )}

          {step !== 3 && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <Link href={`/login${callbackUrl !== '/dashboard' ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`} className="text-[#ff6b6b] hover:text-[#e55a5a] font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}