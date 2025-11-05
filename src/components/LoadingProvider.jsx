"use client"

import { createContext, useContext, useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Loader from './Loader'

const LoadingContext = createContext()

export const useLoading = () => {
  const context = useContext(LoadingContext)
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider')
  }
  return context
}

export default function LoadingProvider({ children }) {
  const [isLoading, setIsLoading] = useState(true)
  const [fadeOut, setFadeOut] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setIsLoading(true)
    setFadeOut(false)
    
    const timer = setTimeout(() => {
      setFadeOut(true)
      setTimeout(() => setIsLoading(false), 500)
    }, 800)

    return () => clearTimeout(timer)
  }, [pathname])

  return (
    <LoadingContext.Provider value={{ isLoading, setIsLoading }}>
      <div className="relative">
        <div className={`transition-opacity duration-500 ${fadeOut ? 'opacity-100' : 'opacity-0'}`}>
          {children}
        </div>
        {isLoading && (
          <div className={`absolute inset-0 transition-opacity duration-500 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
            <Loader />
          </div>
        )}
      </div>
    </LoadingContext.Provider>
  )
}