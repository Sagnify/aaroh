"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
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
  const [isLoaderVisible, setIsLoaderVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  const activeCountRef = useRef(0)
  const showTimerRef = useRef(null)
  const fadeTimerRef = useRef(null)
  const pathname = usePathname()
  const isLoaderVisibleRef = useRef(false)

  const SHOW_DELAY = 100
  const FADE_DURATION = 300

  const clearTimers = () => {
    if (showTimerRef.current) {
      clearTimeout(showTimerRef.current)
      showTimerRef.current = null
    }
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current)
      fadeTimerRef.current = null
    }
  }

  const startLoading = useCallback(() => {
    activeCountRef.current += 1
    if (activeCountRef.current === 1) {
      clearTimers()
      showTimerRef.current = setTimeout(() => {
        setIsFadingOut(false)
        setIsLoaderVisible(true)
        isLoaderVisibleRef.current = true
        showTimerRef.current = null
      }, SHOW_DELAY)
    }
  }, [])

  const finishLoading = useCallback(() => {
    activeCountRef.current = Math.max(0, activeCountRef.current - 1)
    if (activeCountRef.current === 0) {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current)
        showTimerRef.current = null
        return
      }

      if (isLoaderVisibleRef.current) {
        setIsFadingOut(true)
        fadeTimerRef.current = setTimeout(() => {
          setIsLoaderVisible(false)
          setIsFadingOut(false)
          isLoaderVisibleRef.current = false
          fadeTimerRef.current = null
        }, FADE_DURATION)
      }
    }
  }, [])

  useEffect(() => {
    isLoaderVisibleRef.current = isLoaderVisible
  }, [isLoaderVisible])

  useEffect(() => {
    return () => clearTimers()
  }, [])

  useEffect(() => {
    startLoading()
    const timer = setTimeout(() => {
      finishLoading()
    }, 50)
    return () => clearTimeout(timer)
  }, [pathname])

  const contextValue = {
    isLoading: isLoaderVisible,
    startLoading,
    finishLoading,
  }

  return (
    <LoadingContext.Provider value={contextValue}>
      <div className="relative">
        <div className={`transition-opacity duration-300 ${isLoaderVisible && !isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
          {children}
        </div>

        {isLoaderVisible && (
          <div className={`fixed inset-0 z-50 transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
            <Loader />
          </div>
        )}
      </div>
    </LoadingContext.Provider>
  )
}