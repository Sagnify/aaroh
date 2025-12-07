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
  const [fetchingData, setFetchingData] = useState(true)
  const [success, setSuccess] = useState(false)
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
    } finally {
      setFetchingData(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/courses/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseInt(formData.price),
          originalPrice: formData.originalPrice ? parseInt(formData.originalPrice) : null,
          whatYouLearn: formData.whatYouLearn.filter(item => item.trim()),
          requirements: formData.requirements.filter(item => item.trim()),
          curriculum: formData.curriculum.map((section, index) => ({
            ...section,
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



  if (status === 'loading' || fetchingData) {
    return <Loader />
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-16">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Edit Course</h1>
          <p className="text-gray-500 dark:text-gray-400 text-lg">Update course details and content</p>
          {success && (
            <div className="mt-6 p-5 bg-green-50 dark:bg-green-500/10 border-l-4 border-green-500 rounded-lg">
              <p className="text-green-800 dark:text-green-400 font-semibold flex items-center text-base">
                <span className="w-2.5 h-2.5 bg-green-500 rounded-full mr-3 animate-pulse"></span>
                Course updated successfully!
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          <Card className="bg-white dark:bg-zinc-950 border-0 dark:border dark:border-zinc-800 shadow-xl dark:shadow-2xl">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-6">
              <CardTitle className="text-gray-900 dark:text-white text-2xl font-semibold">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 pt-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Course Title</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Subtitle</label>
                  <Input
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Description</label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  rows={4}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Course Trailer (YouTube URL)</label>
                <Input
                  value={formData.trailerUrl}
                  onChange={(e) => setFormData({...formData, trailerUrl: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>

              <div>
                <ImageUpload
                  currentImage={formData.thumbnail}
                  onImageUpload={(imageUrl) => setFormData({...formData, thumbnail: imageUrl})}
                  label="Course Thumbnail"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Price (₹)</label>
                  <Input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Original Price (₹)</label>
                  <Input
                    type="number"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Level</label>
                  <select
                    value={formData.level}
                    onChange={(e) => setFormData({...formData, level: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-zinc-700 rounded-lg dark:bg-black dark:text-white focus:ring-2 focus:ring-gray-900 dark:focus:ring-white transition-all"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Language</label>
                  <Input
                    value={formData.language}
                    onChange={(e) => setFormData({...formData, language: e.target.value})}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border-0 dark:border dark:border-zinc-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-4">
              <CardTitle className="text-gray-900 dark:text-white text-xl font-semibold">What You'll Learn</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {formData.whatYouLearn.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateWhatYouLearn(index, e.target.value)}
                    placeholder="e.g., Master vocal techniques and breathing exercises"
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

          <Card className="bg-white dark:bg-zinc-950 border-0 dark:border dark:border-zinc-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-4">
              <CardTitle className="text-gray-900 dark:text-white text-xl font-semibold">Requirements</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {formData.requirements.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={item}
                    onChange={(e) => updateRequirement(index, e.target.value)}
                    placeholder="e.g., Basic understanding of music notation"
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

          <Card className="bg-white dark:bg-zinc-950 border-0 dark:border dark:border-zinc-800 shadow-lg">
            <CardHeader className="border-b border-gray-100 dark:border-zinc-800 pb-4">
              <CardTitle className="text-gray-900 dark:text-white text-xl font-semibold">Course Curriculum</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              {formData.curriculum.map((section, sectionIndex) => (
                <div key={sectionIndex} className="border border-gray-200 dark:border-zinc-800 rounded-xl p-6 bg-gray-50 dark:bg-black">
                  <div className="flex justify-between items-center mb-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white text-lg">Section {sectionIndex + 1}</h4>
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
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-2 font-medium">
                      {(section.videos || []).length} lessons • Duration auto-calculated
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h5 className="font-semibold text-gray-700 dark:text-gray-300 text-base">Videos</h5>
                    {(section.videos || []).map((video, videoIndex) => (
                      <div key={videoIndex} className="p-5 bg-white dark:bg-zinc-950 rounded-lg border border-gray-200 dark:border-zinc-800">
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
                          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 font-medium">
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

          <div className="flex gap-4 pt-4">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
            >
              <Save className="w-4 h-4 mr-2" />
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="lg"
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