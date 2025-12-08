"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BookOpen, Clock, Play } from 'lucide-react'
import Link from 'next/link'

export default function StudentDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [purchases, setPurchases] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    document.title = 'My Dashboard - Aaroh'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'USER') {
      router.push('/login')
      return
    }

    fetchPurchases()
  }, [session, status, router])

  const fetchPurchases = async () => {
    try {
      const response = await fetch('/api/user/purchases')
      if (response.ok) {
        const data = await response.json()
        console.log('Dashboard purchases:', data)
        data.forEach(p => console.log(`${p.course.title} - isCompleted:`, p.isCompleted))
        setPurchases(data)
      }
    } catch (error) {
      console.error('Failed to fetch purchases:', error)
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="mb-8">
            <div className="h-10 bg-gray-200 rounded w-64 mb-4 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-48 animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white/80 backdrop-blur-sm border shadow-lg animate-pulse">
                <div className="h-48 bg-gray-200" />
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-full" />
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-6">
                    <div className="h-4 bg-gray-200 rounded w-24" />
                    <div className="h-4 bg-gray-200 rounded w-20" />
                  </div>
                  <div className="h-10 bg-gray-200 rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'USER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[#a0303f] mb-4">My Dashboard</h1>
          <p className="text-xl text-gray-600">Welcome back, {session.user.name}!</p>
        </div>

        {purchases.length === 0 ? (
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20 flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-12 h-12 text-[#a0303f]" />
              </div>
              <h3 className="text-2xl font-bold text-[#a0303f] mb-4">No Courses Yet</h3>
              <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">Start your musical journey by enrolling in a course and unlock your potential</p>
              <Link href="/courses">
                <Button className="bg-[#ff6b6b] hover:bg-[#e55a5a] text-white px-8 py-3 text-lg">
                  Browse Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-[#a0303f] mb-6">My Courses</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {purchases.map((purchase, index) => {
                const gradients = [
                  "bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20",
                  "bg-gradient-to-br from-[#e6b800]/20 to-[#cc9900]/20",
                  "bg-gradient-to-br from-[#87a96b]/20 to-[#a0303f]/20",
                  "bg-gradient-to-br from-[#ffb088]/20 to-[#ff6b6b]/20",
                  "bg-gradient-to-br from-[#a0303f]/20 to-[#8b2635]/20",
                  "bg-gradient-to-br from-[#cc9900]/20 to-[#e6b800]/20"
                ]
                return (
                  <Card key={purchase.id} className="bg-white/80 backdrop-blur-sm border shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                    <div className={`h-48 ${purchase.course.thumbnail ? '' : gradients[index % gradients.length]} flex items-center justify-center relative overflow-hidden`}>
                      {purchase.course.thumbnail ? (
                        <img 
                          src={purchase.course.thumbnail} 
                          alt={purchase.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <BookOpen className="w-12 h-12 text-[#a0303f]" />
                      )}
                    </div>
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-[#a0303f] mb-2">
                        {purchase.course.title}
                      </CardTitle>
                      <p className="text-gray-600 line-clamp-2">
                        {purchase.course.subtitle}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-600 mb-6">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-1">
                            <BookOpen className="w-4 h-4" />
                            <span>{purchase.course.lessons} lessons</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{purchase.course.duration}</span>
                          </div>
                        </div>
                      </div>
                      <Link href={`/course/${purchase.course.id}`}>
                        <Button className="w-full bg-[#ff6b6b] hover:bg-[#e55a5a] text-white py-3">
                          <Play className="w-4 h-4 mr-2" />
                          {purchase.isCompleted ? 'Review Course' : 'Continue Learning'}
                        </Button>
                      </Link>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </>
        )}

        <div className="mt-16">
          <Card className="bg-white/80 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold text-[#a0303f] mb-4">Explore More Courses</h2>
              <p className="text-gray-600 mb-6">Discover new skills and expand your musical knowledge</p>
              <Link href="/courses">
                <Button className="bg-gradient-to-r from-[#ff6b6b] to-[#ffb088] hover:from-[#e55a5a] hover:to-[#ff9f73] text-white px-8 py-3 text-lg">
                  View All Courses
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}