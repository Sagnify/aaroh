'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Settings, Save } from 'lucide-react'

export default function CustomSongSettingsPage() {
  const [settings, setSettings] = useState({ standardPrice: 2999, expressPrice: 4499 })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    document.title = 'Custom Song Settings | Aaroh Admin'
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/custom-song-settings')
      const data = await response.json()
      if (data.success) {
        setSettings(data.settings)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Get CSRF token
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       await fetch('/api/auth/csrf').then(r => r.json()).then(d => d.csrfToken)
      
      const response = await fetch('/api/admin/custom-song-settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(settings)
      })
      const data = await response.json()
      if (data.success) {
        alert('Settings updated successfully!')
      } else {
        alert(data.error || 'Failed to update settings')
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-black pt-28 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-28 pb-20 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Custom Song Settings</h1>
        </div>

        <Card className="bg-white dark:bg-zinc-950 shadow-lg border dark:border-zinc-800">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div>
                <Label htmlFor="standardPrice" className="text-gray-700 dark:text-gray-300 font-semibold">
                  Standard Price (7 days)
                </Label>
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                  <Input
                    id="standardPrice"
                    type="number"
                    value={settings.standardPrice}
                    onChange={(e) => setSettings({ ...settings, standardPrice: parseInt(e.target.value) || 0 })}
                    className="pl-8 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="expressPrice" className="text-gray-700 dark:text-gray-300 font-semibold">
                  Express Price (3 days)
                </Label>
                <div className="mt-2 relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">₹</span>
                  <Input
                    id="expressPrice"
                    type="number"
                    value={settings.expressPrice}
                    onChange={(e) => setSettings({ ...settings, expressPrice: parseInt(e.target.value) || 0 })}
                    className="pl-8 dark:bg-zinc-900 dark:border-zinc-700 dark:text-white"
                  />
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Preview</h3>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <div>Standard (7 days): ₹{settings.standardPrice.toLocaleString()}</div>
                  <div>Express (3 days): ₹{settings.expressPrice.toLocaleString()}</div>
                </div>
              </div>

              <Button
                onClick={handleSave}
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {saving ? (
                  <div className="flex items-center">
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Saving...
                  </div>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Save Settings
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}