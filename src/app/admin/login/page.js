"use client"

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { PasswordInput } from '@/components/ui/password-input'
import Loader from '@/components/Loader'
import { Music } from 'lucide-react'

export default function AdminLogin() {
  const [step, setStep] = useState(1)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
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
    if (session && session.user.role === 'USER') {
      setError('Another user is logged in. Please logout first.')
    }
  }, [session, status, router])

  const handleEmailSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/admin/auth/check-2fa')
      const data = await response.json()
      setTwoFactorEnabled(data.twoFactorEnabled)
      setStep(2)
    } catch (error) {
      setError('Failed to verify email')
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const result = await signIn('credentials', {
        email,
        password: twoFactorEnabled ? undefined : password,
        token: twoFactorEnabled ? password : undefined,
        loginType: 'admin',
        redirect: false
      })

      if (result?.error) {
        setError(result.error === 'CredentialsSignin' ? 'Invalid credentials' : result.error)
        setLoading(false)
      } else if (result?.ok) {
        // Keep loading state while redirecting
        router.push('/admin/dashboard')
        router.refresh()
      } else {
        setError('Login failed. Please try again.')
        setLoading(false)
      }
    } catch (error) {
      setError('Login failed. Please try again.')
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
          {step === 1 ? (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
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
                  autoFocus
                />
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                  {session && session.user.role === 'USER' && (
                    <Button
                      type="button"
                      onClick={() => {
                        signIn(null, { redirect: false }).then(() => {
                          setError('')
                          router.refresh()
                        })
                      }}
                      variant="outline"
                      className="w-full mt-2 text-red-600 border-red-300 hover:bg-red-50"
                      size="sm"
                    >
                      Logout Current User
                    </Button>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={loading || (session && session.user.role === 'USER')}
              >
                Continue
              </Button>
            </form>
          ) : (
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md border">
                  <span className="text-sm text-gray-700">{email}</span>
                  <button
                    type="button"
                    onClick={() => { setStep(1); setPassword(''); setError('') }}
                    className="text-xs text-gray-600 hover:text-gray-900"
                  >
                    Change
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {twoFactorEnabled ? 'Authenticator Code' : 'Password'}
                </label>
                {twoFactorEnabled ? (
                  <div className="flex gap-2 justify-center">
                    {[0, 1, 2, 3, 4, 5].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={password[index] || ''}
                        onChange={(e) => {
                          const value = e.target.value
                          if (!/^[0-9]$/.test(value) && value !== '') return
                          const newPassword = password.split('')
                          newPassword[index] = value
                          setPassword(newPassword.join(''))
                          if (value && index < 5) {
                            document.getElementById(`otp-${index + 1}`)?.focus()
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === 'Backspace' && !password[index] && index > 0) {
                            document.getElementById(`otp-${index - 1}`)?.focus()
                          }
                        }}
                        className="w-12 h-12 text-center text-xl font-semibold border border-gray-300 rounded-md focus:border-gray-900 focus:ring-2 focus:ring-gray-400 outline-none"
                        autoFocus={index === 0}
                      />
                    ))}
                  </div>
                ) : (
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    required
                    autoFocus
                  />
                )}
              </div>
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <p className="text-red-600 text-sm text-center">{error}</p>
                  {session && session.user.role === 'USER' && (
                    <Button
                      type="button"
                      onClick={async () => {
                        await signIn(null, { redirect: false })
                        setError('')
                        setStep(1)
                        router.refresh()
                      }}
                      variant="outline"
                      className="w-full mt-2 text-red-600 border-red-300 hover:bg-red-50"
                      size="sm"
                    >
                      Logout Current User
                    </Button>
                  )}
                </div>
              )}
              <Button
                type="submit"
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
                disabled={loading || (session && session.user.role === 'USER')}
              >
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Signing in...</span>
                  </div>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
