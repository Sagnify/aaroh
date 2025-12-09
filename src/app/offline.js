'use client'

import { WifiOff, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Offline() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <WifiOff className="w-10 h-10 text-gray-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">You're Offline</h1>
        <p className="text-gray-600 mb-8">
          Please check your internet connection and try again.
        </p>

        <Button
          onClick={() => window.location.reload()}
          className="w-full bg-gradient-to-r from-gray-700 to-gray-900 hover:from-gray-800 hover:to-black text-white"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry Connection
        </Button>

        <p className="text-sm text-gray-500 mt-6">
          Some features may be available offline
        </p>
      </div>
    </div>
  )
}
