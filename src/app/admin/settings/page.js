"use client"

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Shield, Check, X, Key } from 'lucide-react'
import { useAdmin2FAStatus } from '@/hooks/useCachedData'
import { useQueryClient } from '@tanstack/react-query'

export default function AdminSettings() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const queryClient = useQueryClient()
  const { data: statusData } = useAdmin2FAStatus()
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false)
  const [showSetup, setShowSetup] = useState(false)
  const [qrCode, setQrCode] = useState('')
  const [secret, setSecret] = useState('')
  const [verifyToken, setVerifyToken] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordSuccess, setPasswordSuccess] = useState('')

  useEffect(() => {
    document.title = 'Settings - Admin - Aaroh'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (statusData) {
      setTwoFactorEnabled(statusData.enabled)
    }
  }, [statusData])

  const handleSetup2FA = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/2fa/setup', {
        method: 'POST'
      })
      
      if (response.ok) {
        const data = await response.json()
        setQrCode(data.qrCode)
        setSecret(data.secret)
        setShowSetup(true)
      } else {
        setError('Failed to setup 2FA')
      }
    } catch (error) {
      setError('Error setting up 2FA')
    } finally {
      setLoading(false)
    }
  }

  const handleVerify2FA = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verifyToken, secret })
      })
      
      if (response.ok) {
        setSuccess('2FA enabled successfully!')
        setTwoFactorEnabled(true)
        setShowSetup(false)
        setVerifyToken('')
        queryClient.invalidateQueries(['admin2FAStatus'])
      } else {
        setError('Invalid token. Please try again.')
      }
    } catch (error) {
      setError('Verification failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDisable2FA = async () => {
    if (!confirm('Are you sure you want to disable 2FA?')) return
    
    setLoading(true)
    try {
      const response = await fetch('/api/admin/2fa/disable', {
        method: 'POST'
      })
      
      if (response.ok) {
        setSuccess('2FA disabled successfully')
        setTwoFactorEnabled(false)
        queryClient.invalidateQueries(['admin2FAStatus'])
      } else {
        setError('Failed to disable 2FA')
      }
    } catch (error) {
      setError('Error disabling 2FA')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <div className="p-6">Loading...</div>
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess('')

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }

    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword })
      })

      const data = await response.json()

      if (response.ok) {
        setPasswordSuccess(data.message)
        setNewPassword('')
        setConfirmPassword('')
      } else {
        setPasswordError(data.error)
      }
    } catch (error) {
      setPasswordError('Failed to change password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 min-h-screen dark:bg-black">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>

      <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Key className="w-5 h-5" />
            Change Password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {passwordError && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
                {passwordError}
              </div>
            )}

            {passwordSuccess && (
              <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-sm">
                {passwordSuccess}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium dark:text-gray-200 mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium dark:text-gray-200 mb-2">
                Confirm New Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>

            <Button type="submit" disabled={loading}>
              Change Password
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 dark:text-white">
            <Shield className="w-5 h-5" />
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div>
              <p className="font-medium dark:text-gray-200">Status</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {twoFactorEnabled ? 'Enabled' : 'Disabled'}
              </p>
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              twoFactorEnabled ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
            }`}>
              {twoFactorEnabled ? <Check className="w-4 h-4" /> : <X className="w-4 h-4" />}
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200 text-sm">
              {success}
            </div>
          )}

          {!twoFactorEnabled && !showSetup && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Enable two-factor authentication for enhanced security. You'll need an authenticator app like Google Authenticator or Authy.
              </p>
              <Button onClick={handleSetup2FA} disabled={loading}>
                <Shield className="w-4 h-4 mr-2" />
                Enable 2FA
              </Button>
            </div>
          )}

          {showSetup && (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg">
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
                  Scan this QR code with your authenticator app:
                </p>
                <div className="flex justify-center mb-4">
                  <img src={qrCode} alt="2FA QR Code" className="w-64 h-64" />
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 text-center">
                  Or enter this code manually: <code className="bg-white dark:bg-gray-900 dark:text-gray-200 px-2 py-1 rounded border dark:border-gray-700">{secret}</code>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium dark:text-gray-200 mb-2">
                  Enter verification code from your app
                </label>
                <Input
                  type="text"
                  value={verifyToken}
                  onChange={(e) => setVerifyToken(e.target.value)}
                  placeholder="000000"
                  maxLength={6}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleVerify2FA} disabled={loading || verifyToken.length !== 6}>
                  Verify & Enable
                </Button>
                <Button variant="outline" onClick={() => setShowSetup(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {twoFactorEnabled && (
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Two-factor authentication is currently enabled. You'll need your authenticator app to login.
              </p>
              <Button variant="outline" onClick={handleDisable2FA} disabled={loading}>
                Disable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
