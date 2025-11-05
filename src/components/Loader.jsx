"use client"

import { Music } from 'lucide-react'

export default function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="text-center">
        <div className="relative">
          <div className="w-16 h-16 bg-[#a0303f] rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Music className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    </div>
  )
}