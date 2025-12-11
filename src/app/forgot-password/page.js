"use client"

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Mail } from 'lucide-react'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage('')

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })

      const result = await response.json()

      if (response.ok) {
        setIsSuccess(true)
        setMessage('Password reset email sent! Check your inbox for instructions.')
      } else {
        setMessage(result.error || 'Failed to send reset email')
      }
    } catch (error) {
      console.error('Forgot password error:', error)
      setMessage('Failed to send reset email. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Mail className="w-12 h-12 text-[#a0303f] mx-auto mb-4" />
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password?</CardTitle>
          <p className="text-gray-600">Enter your email to receive reset instructions</p>
        </CardHeader>
        <CardContent>
          {isSuccess ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-green-600 font-medium">{message}</p>
              <Link href="/login">
                <Button className="w-full bg-[#a0303f] hover:bg-[#8a2a37]">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Login
                </Button>
              </Link>
            </div>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                {message && (
                  <div className={`p-3 rounded-lg text-sm ${
                    isSuccess ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-[#a0303f] hover:bg-[#8a2a37]"
                >
                  {isLoading ? 'Sending...' : 'Send Reset Email'}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <Link href="/login" className="text-sm text-[#a0303f] hover:text-[#8a2a37] font-medium">
                  <ArrowLeft className="w-4 h-4 inline mr-1" />
                  Back to Login
                </Link>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}