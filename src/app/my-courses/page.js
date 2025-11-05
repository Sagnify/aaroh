"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Play, Clock, Award } from 'lucide-react'
import CourseCard from '@/components/CourseCard'
import Link from 'next/link'

export default function MyCourses() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/login')
      return
    }
    fetchMyCourses()
  }, [session, status, router])

  const fetchMyCourses = async () => {
    try {
      const response = await fetch('/api/my-courses')
      if (response.ok) {
        const data = await response.json()
        console.log('My courses data:', data)
        data.forEach(course => {
          if (course.latestProgress) {
            console.log('Progress for', course.course.title, ':', course.latestProgress)
          }
        })
        setCourses(data)
      } else {
        console.error('API response not ok:', response.status, await response.text())
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
        <div className="relative">
          <div className="w-16 h-16 bg-[#a0303f] rounded-full flex items-center justify-center mx-auto animate-pulse">
            <BookOpen className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!session) {
    return null
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-[#a0303f] mb-4">My Courses</h1>
          <p className="text-xl text-gray-600">Continue your musical journey</p>
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No courses yet</h3>
            <p className="text-gray-600 mb-6">Start learning by enrolling in a course</p>
            <Link href="/courses">
              <Button className="bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white">
                Browse Courses
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((purchase, index) => (
              <div key={purchase.id} className="relative">
                <CourseCard 
                  course={purchase.course} 
                  index={index}
                  variant="my-courses"
                />
                {purchase.latestProgress && (
                  <div className="absolute top-4 right-4 z-10">
                    <Link href={`/course/${purchase.course.id}?video=${purchase.latestProgress.videoId}&t=${purchase.latestProgress.timestamp || 0}`}>
                      <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white text-xs">
                        Resume
                      </Button>
                    </Link>
                  </div>
                )}
                <div className="mt-2 text-center">
                  <span className="text-xs text-gray-500">
                    Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}