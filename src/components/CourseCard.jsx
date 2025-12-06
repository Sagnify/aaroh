"use client"

import { motion } from "framer-motion"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Clock, BookOpen, Star, Play } from 'lucide-react'
import Link from "next/link"
import { calculateDiscountPercentage, hasDiscount } from '@/lib/discount-utils'
import { useCourseDurations } from '@/hooks/useYouTubeDuration'
import { useState } from 'react'

export default function CourseCard({ course, index = 0, variant = 'default', badge = null }) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const isMyCoursesVariant = variant === 'my-courses'
  const displayTitle = course.title || course.name
  const displayDescription = course.subtitle || course.description
  const { totalDuration, loading: durationsLoading } = useCourseDurations(course?.curriculum)
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -5 }}
      className="h-full relative"
    >
      {badge && (
        <div className="absolute top-4 right-4 z-10">
          {badge}
        </div>
      )}
      <Card className="h-full flex flex-col bg-white/80 backdrop-blur-sm hover:shadow-lg transition-all duration-300">
        <div className={`h-48 ${course.thumbnail ? '' : (course.fallbackClass || 'bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20')} flex items-center justify-center relative overflow-hidden`}>
          {course.thumbnail ? (
            <img 
              src={course.thumbnail} 
              alt={course.title || course.name}
              className={`w-full h-full object-cover transition-opacity duration-500 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
              onLoad={() => setImageLoaded(true)}
            />
          ) : (
            course.icon || <Play className="w-12 h-12 text-[#ff6b6b]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent" />
        </div>
        <CardHeader className="pb-3">
          <CardTitle className="text-[#a0303f] line-clamp-2">{displayTitle}</CardTitle>
          {displayDescription && (
            <CardDescription className="line-clamp-2">{displayDescription}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-grow">
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{totalDuration || course.duration || 'Loading...'}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="w-4 h-4" />
                <span>{course.curriculum?.flatMap(s => s.videos || []).length || course.lessons || 0} lessons</span>
              </div>
            </div>
            
            {!isMyCoursesVariant && course.rating && (
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-[#e6b800] fill-current" />
                <span className="font-medium">{course.rating}</span>
                {course.students && (
                  <span className="text-gray-500">({course.students?.toLocaleString()} students)</span>
                )}
              </div>
            )}
            
            {course.level && (
              <p className="text-sm text-gray-600">Level: {course.level}</p>
            )}
            
            {!isMyCoursesVariant && course.price && (
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xl font-bold text-[#a0303f]">
                    {typeof course.price === 'number' ? `₹${course.price.toLocaleString()}` : course.price}
                  </span>
                  {course.originalPrice && (
                    <span className="text-sm text-gray-500 line-through ml-2">
                      ₹{course.originalPrice.toLocaleString()}
                    </span>
                  )}
                </div>
                {hasDiscount(course.price, course.originalPrice) && (
                  <span className="px-2 py-1 bg-[#e6b800] text-white text-xs font-medium rounded">
                    {calculateDiscountPercentage(course.price, course.originalPrice)}% OFF
                  </span>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Link href={isMyCoursesVariant ? `/course/${course.id}` : `/courses/${course.id}`} className="w-full">
            <Button className="w-full bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white transition-colors">
              {isMyCoursesVariant ? 'Continue Learning' : 'View Course'}
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </motion.div>
  )
}