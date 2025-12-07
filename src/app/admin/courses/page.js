"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, Star } from 'lucide-react'
import Link from 'next/link'
import { useAdminCourses } from '@/hooks/useCachedData'
import { useQueryClient } from '@tanstack/react-query'
import { TableSkeleton } from '@/components/AdminSkeleton'

export default function ManageCourses() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: coursesData, isLoading } = useAdminCourses()
  const queryClient = useQueryClient()
  const [popularCourses, setPopularCourses] = useState([])
  const [saving, setSaving] = useState(false)

  const courses = coursesData || []

  useEffect(() => {
    document.title = 'Manage Courses - Admin - Aaroh'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
  }, [session, status, router])

  useEffect(() => {
    if (courses.length > 0) {
      setPopularCourses(courses.filter(course => course.popular).map(course => course.id))
    }
  }, [courses])

  const handleDelete = async (courseId) => {
    if (confirm('Are you sure you want to delete this course?')) {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'DELETE'
        })
        if (response.ok) {
          queryClient.invalidateQueries(['adminCourses'])
        } else {
          alert('Failed to delete course')
        }
      } catch (error) {
        alert('Error deleting course')
      }
    }
  }

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all courses and content</p>
        </div>
        
        <div className="mb-6">
          <Link href="/admin/courses/new">
            <Button className="bg-gray-900 hover:bg-gray-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              Add New Course
            </Button>
          </Link>
        </div>

        {/* Popular Courses Section */}
        <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg mb-6">
          <div className="px-6 py-4 border-b">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white flex items-center gap-2">
              <Star className="w-5 h-5 text-yellow-500" />
              Popular Courses (Max 3)
            </h2>
            <p className="text-sm text-gray-600 mt-1">Select up to 3 courses to display on homepage and footer</p>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                  <input
                    type="checkbox"
                    id={`popular-${course.id}`}
                    checked={popularCourses.includes(course.id)}
                    onChange={(e) => {
                      if (e.target.checked && popularCourses.length >= 3) {
                        alert('You can only select up to 3 popular courses')
                        return
                      }
                      setPopularCourses(prev => 
                        e.target.checked 
                          ? [...prev, course.id]
                          : prev.filter(id => id !== course.id)
                      )
                    }}
                    className="w-4 h-4 text-yellow-600"
                  />
                  <label htmlFor={`popular-${course.id}`} className="flex-1 cursor-pointer text-sm">
                    {course.title}
                  </label>
                  {popularCourses.includes(course.id) && (
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-between items-center">
              <p className="text-sm text-gray-600">
                {popularCourses.length}/3 courses selected
              </p>
              <Button 
                onClick={async () => {
                  setSaving(true)
                  try {
                    const response = await fetch('/api/admin/courses', {
                      method: 'PATCH',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({ popularCourseIds: popularCourses })
                    })
                    if (response.ok) {
                      alert('Popular courses updated successfully!')
                      queryClient.invalidateQueries(['adminCourses'])
                    } else {
                      alert('Failed to update popular courses')
                    }
                  } catch (error) {
                    alert('Error updating popular courses')
                  } finally {
                    setSaving(false)
                  }
                }}
                disabled={saving}
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                <Star className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Popular Courses'}
              </Button>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg relative">
          <div className="px-6 py-4 border-b dark:border-gray-800">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Courses</h2>
          </div>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="p-6"><TableSkeleton rows={5} columns={5} /></div>
            ) : (
            <table className="w-full">
              <thead className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                <tr>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Course</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Price</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Students</th>
                  <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Status</th>
                  <th className="text-right py-4 px-6 font-medium text-gray-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {(courses || []).map((course) => (
                  <tr key={course.id} className="border-b dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-900">
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-white">{course.title}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">{course.level} • {course.duration}</div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="font-medium text-gray-900 dark:text-white">₹{course.price.toLocaleString()}</div>
                    </td>
                    <td className="py-4 px-4">
                      <div className="text-gray-900 dark:text-white">{course._count?.purchases || 0}</div>
                    </td>
                    <td className="py-4 px-4">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        course.published 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                      }`}>
                        {course.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/courses/edit/${course.id}`}>
                          <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleDelete(course.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}