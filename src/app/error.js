'use client'

import { useEffect } from 'react'
import { AlertTriangle, Home, RefreshCw, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }) {
  useEffect(() => {
    console.error('Application error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-10 h-10 text-red-600" />
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Oops! Something went wrong</h1>
        <p className="text-gray-600 mb-6">
          We encountered an unexpected error. Don't worry, our team has been notified.
        </p>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-sm text-red-800 font-mono break-all">
            {error?.message || 'An unexpected error occurred'}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            onClick={() => reset()}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Homepage
          </Button>

          <a
            href={`mailto:${process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'support@aaroh.com'}?subject=Error Report&body=Error: ${encodeURIComponent(error?.message || 'Unknown error')}`}
            className="block"
          >
            <Button variant="outline" className="w-full border-red-200 text-red-600 hover:bg-red-50">
              <Mail className="w-4 h-4 mr-2" />
              Contact Support
            </Button>
          </a>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Error ID: {Date.now().toString(36)}
        </p>
      </div>
    </div>
  )
}
