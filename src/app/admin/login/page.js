"use client"

import { useState, useEffect } from 'react'
import { signIn, signOut, getSession, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import Loader from '@/components/Loader'
import { Music } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [token, setToken] = useState('')
  const [use2FA, setUse2FA] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    document.title = 'Admin Login - Aaroh'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (session && session.user.role === 'ADMIN') {
      router.push('/admin/dashboard')
    }
  }, [session, status, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const credentials = {
        email: use2FA ? process.env.NEXT_PUBLIC_ADMIN_EMAIL || 'admin@aaroh.com' : email,
        loginType: 'admin',
        redirect: false
      }
      
      if (use2FA) {
        credentials.token = token
      } else {
        credentials.password = password
      }
      
      const result = await signIn('credentials', credentials)

      if (result?.error) {
        setError('Invalid credentials')
      } else {
        const session = await getSession()
        if (session?.user?.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          await signOut({ redirect: false })
          setError('Access denied. Admin privileges required.')
        }
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <Loader />
  }

  if (session && session.user.role === 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gray-50">
      <Card className="w-full max-w-md bg-white shadow-sm border">
        <CardHeader className="text-center space-y-4">
          <div className="w-12 h-12 bg-gray-900 rounded-lg flex items-center justify-center mx-auto">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-gray-900">Admin Login</CardTitle>
            <p className="text-sm text-gray-500 mt-1">Sign in to your account</p>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!use2FA && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@aaroh.com"
                  required
                />
              </div>
            )}
            {!use2FA ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <PasswordInput
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  required
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Authenticator Code
                </label>
                <Input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                  required
                />
              </div>
            )}
            {error && (
              <div className="text-red-600 text-sm text-center">{error}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              disabled={loading}
            >
              Sign In
            </Button>
          </form>
          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setUse2FA(!use2FA)}
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              {use2FA ? 'Use password instead' : 'Use authenticator app'}
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}