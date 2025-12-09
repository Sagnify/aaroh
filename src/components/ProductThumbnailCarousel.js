'use client'

import { useState, useEffect } from 'react'

export default function ProductThumbnailCarousel({ variants, className = "", autoPlay = true, interval = 3000 }) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Get first image from each variant that has images
  const thumbnailImages = variants
    ?.filter(variant => variant.images && variant.images.length > 0)
    ?.map(variant => variant.images[0]) || []
  
  // If no variant images, show placeholder
  if (thumbnailImages.length === 0) {
    return (
      <div className={`aspect-square bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No Image</span>
      </div>
    )
  }
  
  // If only one image, show it without carousel
  if (thumbnailImages.length === 1) {
    return (
      <div className={`aspect-square rounded-lg overflow-hidden ${className}`}>
        <img 
          src={thumbnailImages[0]} 
          alt="Product" 
          className="w-full h-full object-cover"
        />
      </div>
    )
  }
  
  // Auto-play carousel for multiple images
  useEffect(() => {
    if (!autoPlay || thumbnailImages.length <= 1) return
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % thumbnailImages.length)
    }, interval)
    
    return () => clearInterval(timer)
  }, [autoPlay, interval, thumbnailImages.length])
  
  return (
    <div className={`aspect-square rounded-lg overflow-hidden relative ${className}`}>
      {/* Sliding container */}
      <div 
        className="flex h-full transition-transform duration-700 ease-in-out"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {thumbnailImages.map((image, index) => (
          <img 
            key={index}
            src={image} 
            alt="Product" 
            className="w-full h-full object-cover flex-shrink-0"
          />
        ))}
      </div>
      
      {/* Variant indicators */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-1">
        {thumbnailImages.map((_, index) => (
          <div
            key={index}
            className={`w-1.5 h-1.5 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
          />
        ))}
      </div>
    </div>
  )
}