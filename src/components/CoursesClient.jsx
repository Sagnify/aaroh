"use client"

import { motion } from "framer-motion"
import CourseCard from "@/components/CourseCard"
import { Piano, Mic, Music, BookOpen } from "lucide-react"
import { useEffect, useState } from "react"

export default function CoursesClient() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'All Courses - Aaroh Music Academy'
    fetchCourses()
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      console.log('Fetched courses:', data)
      console.log('First course thumbnail:', data[0]?.thumbnail)
      setCourses(data || [])
    } catch (error) {
      console.error('Failed to fetch courses:', error)
      setCourses([])
    } finally {
      setLoading(false)
    }
  }

  const getIconForCourse = (index) => {
    const icons = [
      <Mic className="w-12 h-12 text-[#ff6b6b]" />,
      <Piano className="w-12 h-12 text-[#e6b800]" />,
      <Music className="w-12 h-12 text-[#87a96b]" />,
      <BookOpen className="w-12 h-12 text-[#ffb088]" />,
      <Music className="w-12 h-12 text-[#a0303f]" />,
      <Music className="w-12 h-12 text-[#cc9900]" />
    ]
    return icons[index % icons.length]
  }

  const getThumbnailForCourse = (index) => {
    const thumbnails = [
      "bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20",
      "bg-gradient-to-br from-[#e6b800]/20 to-[#cc9900]/20",
      "bg-gradient-to-br from-[#87a96b]/20 to-[#a0303f]/20",
      "bg-gradient-to-br from-[#ffb088]/20 to-[#ff6b6b]/20",
      "bg-gradient-to-br from-[#a0303f]/20 to-[#8b2635]/20",
      "bg-gradient-to-br from-[#cc9900]/20 to-[#e6b800]/20"
    ]
    return thumbnails[index % thumbnails.length]
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-[#a0303f] mb-6">Our Courses</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover our comprehensive range of music courses designed to nurture your musical talents. 
            Each course is carefully crafted to provide you with the skills and knowledge you need to excel.
          </p>
        </motion.div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-6 space-y-4">
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                    <div className="h-10 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {courses.map((course, index) => {
            console.log(`Course ${index} thumbnail:`, course.thumbnail)
            const courseWithVisuals = {
              ...course,
              id: course.id,
              name: course.title,
              price: `₹${course.price.toLocaleString()}`,
              thumbnail: course.thumbnail, // Only pass actual image URL, not CSS class
              fallbackClass: getThumbnailForCourse(index),
              icon: getIconForCourse(index)
            }
              return (
                <CourseCard key={course.id} course={courseWithVisuals} index={index} />
              )
            })}
          </div>
        )}
        
        {!loading && courses.length === 0 && (
          <div className="text-center py-12">
            <Music className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No courses available at the moment.</p>
          </div>
        )}
      </div>
    </div>
  )
}