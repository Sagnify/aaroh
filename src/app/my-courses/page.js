"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Play, Clock, Award } from 'lucide-react'
import CourseCard from '@/components/CourseCard'
import Link from 'next/link'
import FadeIn from '@/components/FadeIn'

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
        console.log('My courses API response:', data)
        if (data.length > 0) {
          console.log('First course:', data[0])
          console.log('First course.course:', data[0].course)
          console.log('First course thumbnail:', data[0].course?.thumbnail)
          console.log('First course progress:', data[0].latestProgress)
          console.log('First course completed:', data[0].isCompleted)
        }
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
        <FadeIn>
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-[#a0303f] mb-4">My Courses</h1>
            <p className="text-xl text-gray-600">Continue your musical journey</p>
          </div>
        </FadeIn>

        {courses.length === 0 ? (
          <FadeIn delay={200}>
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
          </FadeIn>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((purchase, index) => {
              let badge = null
              if (purchase.latestProgress) {
                if (purchase.isCompleted) {
                  badge = (
                    <div className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/20">
                      <div className="flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Completed
                      </div>
                    </div>
                  )
                } else {
                  badge = (
                    <Link href={`/course/${purchase.course.id}?video=${purchase.latestProgress.videoId}&t=${purchase.latestProgress.timestamp || 0}`}>
                      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg border border-white/20 transition-all duration-200 cursor-pointer">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Resume
                        </div>
                      </div>
                    </Link>
                  )
                }
              }

              return (
                <FadeIn key={purchase.id} delay={index * 100}>
                  <div className="relative">
                    <CourseCard 
                      course={purchase.course} 
                      index={index}
                      variant="my-courses"
                      badge={badge}
                    />
                    <div className="mt-2 text-center">
                      <span className="text-xs text-gray-500">
                        Purchased on {new Date(purchase.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}