"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import Loader from '@/components/Loader'
import ImageUpload from '@/components/ImageUpload'
import { Plus, Trash2, Save } from 'lucide-react'

export default function EditCourse() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
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
    trailerUrl: '',
    thumbnail: '',
    whatYouLearn: [''],
    requirements: [''],
    curriculum: []
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
    if (params.id) {
      fetchCourse()
    }
  }, [session, status, router, params.id])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/admin/courses/${params.id}`)
      if (response.ok) {
        const course = await response.json()
        setFormData({
          title: course.title || '',
          subtitle: course.subtitle || '',
          description: course.description || '',
          price: course.price?.toString() || '',
          originalPrice: course.originalPrice?.toString() || '',
          duration: course.duration || '',
          lessons: course.lessons?.toString() || '',
          level: course.level || 'Beginner',
          language: course.language || 'Hindi/English',
          trailerUrl: course.trailerUrl || '',
          thumbnail: course.thumbnail || '',
          whatYouLearn: course.whatYouLearn?.length ? course.whatYouLearn : [''],
          requirements: course.requirements?.length ? course.requirements : [''],
          curriculum: course.curriculum || []
        })
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const courseStats = calculateCourseStats()
      const response = await fetch(`/api/admin/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
          duration: courseStats.duration,
          lessons: courseStats.lessons,
          whatYouLearn: formData.whatYouLearn.filter(item => item.trim()),
          requirements: formData.requirements.filter(item => item.trim()),
          curriculum: formData.curriculum.map((section, index) => ({
            ...section,
            ...calculateSectionStats(section),
            order: index
          }))
        })
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 5000)
        // Refresh course data to show updated stats
        fetchCourse()
      } else {
        alert('Failed to update course')
      }
    } catch (error) {
      alert('Error updating course')
    } finally {
      setLoading(false)
    }
  }

  const addWhatYouLearn = () => {
    setFormData(prev => ({
      ...prev,
      whatYouLearn: [...prev.whatYouLearn, '']
    }))
  }

  const removeWhatYouLearn = (index) => {
    setFormData(prev => ({
      ...prev,
      whatYouLearn: prev.whatYouLearn.filter((_, i) => i !== index)
    }))
  }

  const updateWhatYouLearn = (index, value) => {
    setFormData(prev => ({
      ...prev,
      whatYouLearn: prev.whatYouLearn.map((item, i) => i === index ? value : item)
    }))
  }

  const addRequirement = () => {
    setFormData(prev => ({
      ...prev,
      requirements: [...prev.requirements, '']
    }))
  }

  const removeRequirement = (index) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }))
  }

  const updateRequirement = (index, value) => {
    setFormData(prev => ({
      ...prev,
      requirements: prev.requirements.map((item, i) => i === index ? value : item)
    }))
  }

  const parseDuration = (duration) => {
    if (!duration) return 0
    const parts = duration.split(':')
    if (parts.length === 2) {
      return parseInt(parts[0]) * 60 + parseInt(parts[1])
    }
    return 0
  }

  const formatDuration = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    if (hours > 0) {
      return `${hours}h ${minutes}m`
    }
    return `${minutes}m`
  }

  const calculateSectionStats = (section) => {
    const videos = section.videos || []
    const totalSeconds = videos.reduce((sum, video) => sum + parseDuration(video.duration), 0)
    return {
      lessons: videos.length,
      duration: formatDuration(totalSeconds)
    }
  }

  const calculateCourseStats = () => {
    let totalLessons = 0
    let totalSeconds = 0
    
    formData.curriculum.forEach(section => {
      const videos = section.videos || []
      totalLessons += videos.length
      totalSeconds += videos.reduce((sum, video) => sum + parseDuration(video.duration), 0)
    })
    
    return {
      lessons: totalLessons,
      duration: formatDuration(totalSeconds)
    }
  }

  const fetchYouTubeVideoDuration = async (url) => {
    try {
      const response = await fetch('/api/youtube/duration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url })
      })
      
      if (response.ok) {
        const data = await response.json()
        return data.duration
      }
      return null
    } catch (error) {
      console.error('Error fetching video duration:', error)
      return null
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
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">Edit Course</h1>
          <p className="text-gray-600">Update course details and content</p>
          {success && (
            <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md animate-pulse">
              <p className="text-green-800 font-medium flex items-center">
                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                Course updated successfully! All changes have been saved.
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Card className="bg-white border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-gray-900 text-lg font-medium">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
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
                <label className="block text-sm font-medium mb-2">Course Trailer (YouTube URL)</label>
                <Input
                  value={formData.trailerUrl}
                  onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Course Thumbnail</label>
                <ImageUpload
                  currentImage={formData.thumbnail}
                  onImageUpload={(imageUrl) => setFormData({...formData, thumbnail: imageUrl})}
                  placeholder="Upload course thumbnail image"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-gray-900 text-lg font-medium">What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {formData.whatYouLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateWhatYouLearn(index, e.target.value)}
                    placeholder="What students will learn..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeWhatYouLearn(index)}
                    disabled={formData.whatYouLearn.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addWhatYouLearn}>
                <Plus className="w-4 h-4 mr-2" />
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
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="Course requirement..."
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeRequirement(index)}
                    disabled={formData.requirements.length === 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
              <Button type="button" variant="outline" onClick={addRequirement}>
                <Plus className="w-4 h-4 mr-2" />
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white border shadow-sm">
            <CardHeader className="border-b">
              <CardTitle className="text-gray-900 text-lg font-medium">Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {formData.curriculum.map((section, sectionIndex) => (
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
                    <div className="text-sm text-gray-500 mt-2">
                      {calculateSectionStats(section).lessons} lessons • {calculateSectionStats(section).duration}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h5 className="font-medium text-gray-700">Videos</h5>
                    {(section.videos || []).map((video, videoIndex) => (
                      <div key={videoIndex} className="grid grid-cols-1 md:grid-cols-3 gap-2 p-3 bg-gray-50 rounded">
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
                        <Input
                          placeholder="Duration (e.g., 15:30)"
                          value={video.duration || ''}
                          onChange={(e) => {
                            const newCurriculum = [...formData.curriculum]
                            const newVideos = [...(section.videos || [])]
                            newVideos[videoIndex] = {...video, duration: e.target.value}
                            newCurriculum[sectionIndex] = {...section, videos: newVideos}
                            setFormData({...formData, curriculum: newCurriculum})
                          }}
                        />
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
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
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
                    duration: '',
                    lessons: 0,
                    order: formData.curriculum.length,
                    videos: []
                  }
                  setFormData({...formData, curriculum: [...formData.curriculum, newSection]})
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
              <Save className="w-4 h-4 mr-2" />
              Update Course
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
      </div>
    </div>
  )
}