"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Loader from "@/components/Loader"
import { Play, Clock, Users, Award, Star, CheckCircle, Globe } from "lucide-react"
import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export default function CourseDetails() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)

  const [hasPurchased, setHasPurchased] = useState(false)

  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id)
      if (session?.user?.role === 'USER') {
        checkPurchase()
      }
    }
  }, [params.id, session])

  const fetchCourse = async (id) => {
    try {
      const response = await fetch(`/api/courses/${id}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
    } finally {
      setLoading(false)
    }
  }

  const checkPurchase = async () => {
    try {
      const response = await fetch('/api/user/purchases')
      if (response.ok) {
        const purchases = await response.json()
        const purchased = purchases.some(p => p.course.id === params.id)
        setHasPurchased(purchased)
      }
    } catch (error) {
      console.error('Failed to check purchase:', error)
    }
  }

  const handlePurchase = () => {
    if (!session) {
      router.push('/login')
      return
    }
    router.push(`/checkout/${params.id}`)
  }

  if (loading) {
    return <Loader />
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course not found</h1>
          <p className="text-gray-600">The course you're looking for doesn't exist.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <span className="inline-block mb-4 px-3 py-1 bg-[#ff6b6b] text-white text-sm font-medium rounded-full">Bestseller</span>
              <h1 className="text-4xl font-bold text-[#a0303f] mb-4">{course.title}</h1>
              <p className="text-xl text-gray-600 mb-6">{course.subtitle || course.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-[#e6b800] fill-current" />
                  <span className="font-semibold">{course.rating}</span>
                  <span className="text-gray-600">({course.students.toLocaleString()} students)</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-5 h-5 text-[#ffb088]" />
                  <span>{course.duration} total</span>
                </div>
              </div>

              <Card className="bg-white/80 backdrop-blur-sm mb-8">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-[#a0303f] mb-4">What you'll learn</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {(course.whatYouLearn || []).map((item, index) => (
                      <div key={index} className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-[#87a96b] mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-2xl font-bold text-[#a0303f] mb-4">Course Curriculum</h3>
                  <div className="space-y-4">
                    {(course.curriculum || []).map((section, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-center">
                          <h4 className="font-semibold text-[#a0303f]">{section.title}</h4>
                          <span className="text-sm text-gray-600">{section.lessons} lessons • {section.duration}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="sticky top-24 bg-white shadow-xl">
                {course.trailerUrl ? (
                  <div className="h-48 relative">
                    <iframe
                      src={`https://www.youtube.com/embed/${course.trailerUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1] || ''}`}
                      className="w-full h-full rounded-t-lg"
                      frameBorder="0"
                      allowFullScreen
                    />
                  </div>
                ) : (
                  <div className="h-48 bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20 flex items-center justify-center relative">
                    <Play className="w-16 h-16 text-[#ff6b6b] bg-white/90 rounded-full p-4 cursor-pointer hover:scale-110 transition-transform" />
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-3xl font-bold text-[#a0303f]">₹{course.price.toLocaleString()}</span>
                    {course.originalPrice && <span className="text-lg text-gray-500 line-through">₹{course.originalPrice.toLocaleString()}</span>}
                    {course.originalPrice && <span className="px-2 py-1 bg-[#e6b800] text-white text-xs font-medium rounded">{Math.round((1 - course.price / course.originalPrice) * 100)}% OFF</span>}
                  </div>
                  
                  {hasPurchased ? (
                    <Button 
                      onClick={() => router.push(`/course/${params.id}`)}
                      className="w-full mb-4 bg-green-600 hover:bg-green-700 text-white text-lg py-3"
                    >
                      Go to Course
                    </Button>
                  ) : (
                    <Button 
                      onClick={handlePurchase}
                      className="w-full mb-4 bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white text-lg py-3"
                    >
                      Buy Course
                    </Button>
                  )}
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#87a96b]" />
                      <span>{course.lessons} lessons ({course.duration})</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#87a96b]" />
                      <span>Lifetime access</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-[#87a96b]" />
                      <span>Certificate of completion</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}