"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Loader from '@/components/Loader'
import ImageUpload from '@/components/ImageUpload'
import { Plus, Trash2 } from 'lucide-react'

export default function AddCourse() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [refreshingVideos, setRefreshingVideos] = useState({})
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    price: '',
    originalPrice: '',
    duration: '',
    lessons: '',
    level: 'Beginner',
    language: 'Hindi/English',
    thumbnail: '',
    whatYouLearn: [''],
    requirements: [''],
    curriculum: []
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
    }
  }, [session, status, router])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch('/api/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        router.push('/admin/courses')
      } else {
        alert('Failed to create course')
      }
    } catch (error) {
      alert('Error creating course')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return <Loader />
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Add New Course</h1>
          <p className="text-gray-600">Create a new course with details and pricing</p>
        </div>

        <Card className="bg-white border shadow-sm">
          <CardHeader className="border-b">
            <CardTitle className="text-gray-900 text-lg font-medium">Course Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Course Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Subtitle</label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div>
                <ImageUpload
                  currentImage={formData.thumbnail}
                  onImageUpload={(url) => setFormData({...formData, thumbnail: url})}
                  label="Course Thumbnail"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Price (₹)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Original Price (₹)</label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  />
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Language</label>
                  <Input
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  />
                </div>
              </div>

              <Card className="bg-white border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-gray-900 text-lg font-medium">What You'll Learn</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {formData.whatYouLearn.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.whatYouLearn]
                          newItems[index] = e.target.value
                          setFormData({...formData, whatYouLearn: newItems})
                        }}
                        placeholder="What students will learn..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = formData.whatYouLearn.filter((_, i) => i !== index)
                          setFormData({...formData, whatYouLearn: newItems})
                        }}
                        disabled={formData.whatYouLearn.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData({...formData, whatYouLearn: [...formData.whatYouLearn, '']})}
                  >
                    Add Learning Point
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-gray-900 text-lg font-medium">Requirements</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4">
                  {formData.requirements.map((item, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        value={item}
                        onChange={(e) => {
                          const newItems = [...formData.requirements]
                          newItems[index] = e.target.value
                          setFormData({...formData, requirements: newItems})
                        }}
                        placeholder="Course requirement..."
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const newItems = formData.requirements.filter((_, i) => i !== index)
                          setFormData({...formData, requirements: newItems})
                        }}
                        disabled={formData.requirements.length === 1}
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setFormData({...formData, requirements: [...formData.requirements, '']})}
                  >
                    Add Requirement
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-white border shadow-sm">
                <CardHeader className="border-b">
                  <CardTitle className="text-gray-900 text-lg font-medium">Course Curriculum</CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  {formData.curriculum?.map((section, sectionIndex) => (
                    <div key={sectionIndex} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center mb-4">
                        <h4 className="font-medium text-gray-900">Section {sectionIndex + 1}</h4>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCurriculum = formData.curriculum.filter((_, i) => i !== sectionIndex)
                            setFormData({...formData, curriculum: newCurriculum})
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="mb-4">
                        <Input
                          placeholder="Section title"
                          value={section.title || ''}
                          onChange={(e) => {
                            const newCurriculum = [...formData.curriculum]
                            newCurriculum[sectionIndex] = {...section, title: e.target.value}
                            setFormData({...formData, curriculum: newCurriculum})
                          }}
                        />
                      </div>

                      <div className="space-y-3">
                        <h5 className="font-medium text-gray-700">Videos</h5>
                        {(section.videos || []).map((video, videoIndex) => (
                          <div key={videoIndex} className="p-4 bg-gray-50 rounded-lg border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <Input
                                placeholder="Video title"
                                value={video.title || ''}
                                onChange={(e) => {
                                  const newCurriculum = [...formData.curriculum]
                                  const newVideos = [...(section.videos || [])]
                                  newVideos[videoIndex] = {...video, title: e.target.value}
                                  newCurriculum[sectionIndex] = {...section, videos: newVideos}
                                  setFormData({...formData, curriculum: newCurriculum})
                                }}
                              />
                              <Input
                                placeholder="YouTube URL"
                                value={video.youtubeUrl || ''}
                                onChange={(e) => {
                                  const newCurriculum = [...formData.curriculum]
                                  const newVideos = [...(section.videos || [])]
                                  newVideos[videoIndex] = {...video, youtubeUrl: e.target.value}
                                  newCurriculum[sectionIndex] = {...section, videos: newVideos}
                                  setFormData({...formData, curriculum: newCurriculum})
                                }}
                              />
                            </div>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm text-gray-500">
                                <span>{video.duration ? `Duration: ${video.duration}` : video.youtubeUrl ? 'Duration: Auto-detected' : 'Add YouTube URL to detect duration'}</span>
                                {video.youtubeUrl && (
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      const videoKey = `${sectionIndex}-${videoIndex}`
                                      setRefreshingVideos(prev => ({...prev, [videoKey]: true}))
                                      try {
                                        const response = await fetch('/api/youtube/duration', {
                                          method: 'POST',
                                          headers: { 'Content-Type': 'application/json' },
                                          body: JSON.stringify({ url: video.youtubeUrl })
                                        })
                                        if (response.ok) {
                                          const data = await response.json()
                                          const newCurriculum = [...formData.curriculum]
                                          const newVideos = [...(section.videos || [])]
                                          newVideos[videoIndex] = {...video, duration: data.duration}
                                          newCurriculum[sectionIndex] = {...section, videos: newVideos}
                                          setFormData({...formData, curriculum: newCurriculum})
                                        }
                                      } catch (error) {
                                        console.error('Error fetching duration:', error)
                                      } finally {
                                        setRefreshingVideos(prev => ({...prev, [videoKey]: false}))
                                      }
                                    }}
                                    className={`text-blue-600 hover:text-blue-800 text-sm p-1 rounded hover:bg-blue-50 transition-all ${
                                      refreshingVideos[`${sectionIndex}-${videoIndex}`] ? 'animate-spin' : ''
                                    }`}
                                    title="Refresh duration"
                                    disabled={refreshingVideos[`${sectionIndex}-${videoIndex}`]}
                                  >
                                    ↻
                                  </button>
                                )}
                              </div>
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const newCurriculum = [...formData.curriculum]
                                  const newVideos = (section.videos || []).filter((_, i) => i !== videoIndex)
                                  newCurriculum[sectionIndex] = {...section, videos: newVideos}
                                  setFormData({...formData, curriculum: newCurriculum})
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            const newCurriculum = [...formData.curriculum]
                            const newVideos = [...(section.videos || []), { title: '', youtubeUrl: '', duration: '', order: (section.videos || []).length }]
                            newCurriculum[sectionIndex] = {...section, videos: newVideos}
                            setFormData({...formData, curriculum: newCurriculum})
                          }}
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Add Video
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      const newSection = {
                        title: '',
                        order: formData.curriculum?.length || 0,
                        videos: []
                      }
                      setFormData({...formData, curriculum: [...(formData.curriculum || []), newSection]})
                    }}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add Section
                  </Button>
                </CardContent>
              </Card>

              <div className="flex gap-3">
                <Button
                  type="submit"
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                  disabled={loading}
                >
                  Create Course
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push('/admin/courses')}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}