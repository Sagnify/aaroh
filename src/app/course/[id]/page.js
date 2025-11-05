"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import VideoPlayer from '@/components/VideoPlayer'
import ReviewModal from '@/components/ReviewModal'
import CertificateModal from '@/components/CertificateModal'
import { useCourseDurations } from '@/hooks/useYouTubeDuration'
import { Play, Lock, CheckCircle, Clock, BookOpen, Star, Award } from 'lucide-react'

function CoursePageContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const [course, setCourse] = useState(null)
  const [hasPurchased, setHasPurchased] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentVideo, setCurrentVideo] = useState(null)
  const [progress, setProgress] = useState([])
  const [currentTimestamp, setCurrentTimestamp] = useState(0)
  const [hasUnsavedProgress, setHasUnsavedProgress] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [courseReviews, setCourseReviews] = useState([])
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0 })
  const { durations, totalDuration, loading: durationsLoading } = useCourseDurations(course?.curriculum)

  // Handle beforeunload and route changes
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (hasUnsavedProgress && currentVideo && currentTimestamp > 0) {
        e.preventDefault()
        e.returnValue = 'You have unsaved progress. Are you sure you want to leave?'
        // Save progress synchronously before leaving
        navigator.sendBeacon('/api/user/progress', JSON.stringify({
          courseId: String(params.id),
          videoId: String(currentVideo.id),
          timestamp: Math.floor(currentTimestamp),
          completed: false
        }))
        return e.returnValue
      }
    }

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && hasUnsavedProgress && currentVideo && currentTimestamp > 0) {
        // Save progress when tab becomes hidden
        saveCurrentProgress()
      }
    }

    window.addEventListener('beforeunload', handleBeforeUnload)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      // Save progress on cleanup
      if (hasUnsavedProgress && currentVideo && currentTimestamp > 0) {
        saveCurrentProgress()
      }
    }
  }, [hasUnsavedProgress, currentVideo, currentTimestamp, params.id])

  const saveCurrentProgress = async () => {
    if (!currentVideo || currentTimestamp <= 0) return
    
    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: String(params.id),
          videoId: String(currentVideo.id),
          timestamp: Math.floor(currentTimestamp),
          completed: false
        })
      })
      
      if (response.ok) {
        setHasUnsavedProgress(false)
      }
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  const handleProgressUpdate = (timestamp) => {
    setCurrentTimestamp(timestamp)
    if (timestamp > 0) {
      setHasUnsavedProgress(true)
    }
  }

  // Auto-save progress every 10 seconds
  useEffect(() => {
    if (!hasUnsavedProgress || !currentVideo || currentTimestamp <= 0) return

    const autoSaveInterval = setInterval(() => {
      saveCurrentProgress()
    }, 10000) // Save every 10 seconds

    return () => clearInterval(autoSaveInterval)
  }, [hasUnsavedProgress, currentVideo, currentTimestamp])

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session || session.user.role !== 'USER') {
      router.push('/login')
      return
    }

    fetchCourse()
    checkPurchase()
    loadProgress()
    loadReviews()
    checkCertificate()
  }, [session, status, router, params.id])

  // Handle URL parameters for resume watching
  useEffect(() => {
    if (!course?.curriculum) return
    
    const videoId = searchParams.get('video')
    const timestamp = searchParams.get('t')
    
    console.log('URL params:', { videoId, timestamp })
    
    if (videoId) {
      const video = findVideoById(videoId)
      console.log('Found video:', video)
      if (video) {
        setCurrentVideo(video)
        if (timestamp) {
          const time = parseInt(timestamp)
          console.log('Setting timestamp:', time)
          setCurrentTimestamp(time)
        }
      }
    }
  }, [course, searchParams])

  // Update completion stats when progress changes
  useEffect(() => {
    updateCompletionStats()
  }, [progress, course])

  const fetchCourse = async () => {
    try {
      const response = await fetch(`/api/courses/${params.id}`)
      if (response.ok) {
        const data = await response.json()
        setCourse(data)
        if (data.curriculum?.[0]?.videos?.[0]) {
          setCurrentVideo(data.curriculum[0].videos[0])
        }
      }
    } catch (error) {
      console.error('Failed to fetch course:', error)
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
    } finally {
      setLoading(false)
    }
  }

  const getNextVideo = () => {
    if (!course?.curriculum || !currentVideo) return null
    
    let found = false
    for (const section of course.curriculum) {
      for (const video of section.videos || []) {
        if (found) return video
        if (video.id === currentVideo.id) found = true
      }
    }
    return null
  }

  const isLastVideo = () => {
    if (!course?.curriculum || !currentVideo) return false
    
    const allVideos = course.curriculum.flatMap(section => section.videos || [])
    const lastVideo = allVideos[allVideos.length - 1]
    return currentVideo.id === lastVideo?.id
  }

  const handleOpenCertificate = () => {
    if (completionStats.completed === completionStats.total && completionStats.total > 0) {
      if (userReview) {
        if (certificate) {
          setShowCertificateModal(true)
        } else {
          handleGenerateCertificate()
        }
      } else {
        setShowReviewModal(true)
      }
    }
  }

  const loadProgress = async () => {
    try {
      const response = await fetch(`/api/user/progress?courseId=${params.id}`)
      if (response.ok) {
        const progressData = await response.json()
        setProgress(progressData)
        
        // Resume from last watched video if no current video set and no URL params
        if (!currentVideo && progressData.length > 0 && !searchParams.get('video')) {
          // Find the most recently updated incomplete video, or the first incomplete video
          const incompleteProgress = progressData.filter(p => !p.completed)
          const lastWatched = incompleteProgress.length > 0 ? incompleteProgress[0] : progressData[0]
          
          const video = findVideoById(lastWatched.videoId)
          if (video) {
            setCurrentVideo(video)
            setCurrentTimestamp(lastWatched.timestamp)
          }
        }
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  const findVideoById = (videoId) => {
    if (!course?.curriculum) return null
    
    for (const section of course.curriculum) {
      const videos = section.videos || []
      for (const video of videos) {
        if (video.id === videoId) return video
      }
    }
    return null
  }

  const handleVideoEnd = () => {
    const nextVideo = getNextVideo()
    if (nextVideo) {
      setCurrentVideo(nextVideo)
      setCurrentTimestamp(0)
    }
  }

  const handleVideoChange = (video) => {
    setCurrentVideo(video)
    const videoProgress = progress.find(p => p.videoId === video.id)
    setCurrentTimestamp(videoProgress?.timestamp || 0)
  }

  const loadReviews = async () => {
    try {
      const response = await fetch(`/api/reviews?courseId=${params.id}`)
      if (response.ok) {
        const reviews = await response.json()
        setCourseReviews(reviews)
        const myReview = reviews.find(r => r.userId === session?.user?.id)
        setUserReview(myReview)
      }
    } catch (error) {
      console.error('Failed to load reviews:', error)
    }
  }

  const checkCertificate = async () => {
    try {
      const response = await fetch(`/api/certificates?courseId=${params.id}`)
      if (response.ok) {
        const certificates = await response.json()
        if (certificates.length > 0) {
          setCertificate(certificates[0])
        }
      }
    } catch (error) {
      console.error('Failed to check certificate:', error)
    }
  }

  const updateCompletionStats = () => {
    if (!course?.curriculum) return
    
    const allVideos = course.curriculum.flatMap(section => section.videos || [])
    const completedCount = progress.filter(p => p.completed).length
    
    setCompletionStats({ completed: completedCount, total: allVideos.length })
  }

  const isVideoUnlocked = (video) => {
    if (!course?.curriculum) return false
    
    const allVideos = course.curriculum.flatMap(section => section.videos || [])
    const videoIndex = allVideos.findIndex(v => v.id === video.id)
    
    if (videoIndex === 0) return true // First video is always unlocked
    
    // Check if previous video is completed
    const previousVideo = allVideos[videoIndex - 1]
    const previousProgress = progress.find(p => p.videoId === previousVideo.id)
    
    return previousProgress?.completed || false
  }

  const getNextUnlockedVideo = () => {
    if (!course?.curriculum) return null
    
    const allVideos = course.curriculum.flatMap(section => section.videos || [])
    
    for (const video of allVideos) {
      const videoProgress = progress.find(p => p.videoId === video.id)
      if (!videoProgress?.completed && isVideoUnlocked(video)) {
        return video
      }
    }
    
    return null // All videos completed
  }

  const handleVideoComplete = async (videoId) => {
    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: String(params.id),
          videoId: String(videoId),
          timestamp: 0,
          completed: true
        })
      })
      
      if (response.ok) {
        // Refresh progress
        await loadProgress()
      }
    } catch (error) {
      console.error('Failed to mark video as complete:', error)
    }
  }

  const handleNextVideo = () => {
    const nextVideo = getNextUnlockedVideo()
    if (nextVideo) {
      setCurrentVideo(nextVideo)
      setCurrentTimestamp(0)
    }
  }

  const handleGenerateCertificate = async () => {
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: params.id })
      })
      
      if (response.ok) {
        const cert = await response.json()
        setCertificate(cert)
        setShowCertificateModal(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate certificate')
      }
    } catch (error) {
      alert('Failed to generate certificate')
    }
  }

  const handleReviewSubmit = (review) => {
    setUserReview(review)
    loadReviews() // Refresh reviews
  }



  if (status === 'loading' || loading) {
    return <Loader />
  }

  if (!session || session.user.role !== 'USER') {
    return null
  }

  if (!course) {
    return <Loader message="Course not found" />
  }

  if (!hasPurchased) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 pt-16">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
            <CardContent className="p-12 text-center">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20 flex items-center justify-center mx-auto mb-6">
                <Lock className="w-12 h-12 text-[#a0303f]" />
              </div>
              <h3 className="text-2xl font-bold text-[#a0303f] mb-4">Course Not Purchased</h3>
              <p className="text-lg text-gray-600 mb-8">You need to purchase this course to access the content</p>
              <Button 
                onClick={() => router.push(`/courses/${params.id}`)}
                className="bg-gradient-to-r from-[#ff6b6b] to-[#ffb088] hover:from-[#e55a5a] hover:to-[#ff9f73] text-white px-8 py-3 text-lg"
              >
                View Course Details
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10 pt-16">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#a0303f] mb-2">{course.title}</h1>
          <p className="text-lg text-gray-600">{course.subtitle}</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
              <CardContent className="p-0">
                {currentVideo && currentVideo.youtubeUrl ? (
                  <VideoPlayer 
                    youtubeUrl={currentVideo.youtubeUrl}
                    title={currentVideo.title}
                    onVideoEnd={handleVideoEnd}
                    courseId={params.id}
                    videoId={currentVideo.id}
                    initialTimestamp={currentTimestamp}
                    onProgressUpdate={handleProgressUpdate}
                    onVideoComplete={(videoId) => {
                      loadProgress() // Refresh progress to update UI
                    }}
                    isLastVideo={isLastVideo()}
                    onOpenCertificate={handleOpenCertificate}
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20 flex items-center justify-center rounded-t-lg">
                    <div className="text-center">
                      <Play className="w-20 h-20 text-[#a0303f] mx-auto mb-4" />
                      <p className="text-[#a0303f] font-medium">Select a video to start learning</p>
                    </div>
                  </div>
                )}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-[#a0303f] mb-2">
                        {currentVideo?.title || 'Welcome to Your Course'}
                      </h2>
                      <p className="text-gray-600">{currentVideo?.description || 'Choose a lesson from the curriculum to begin your learning journey.'}</p>
                    </div>
                    {currentVideo && (
                      <div className="flex items-center space-x-3 ml-4">
                        {(() => {
                          const videoProgress = progress.find(p => p.videoId === currentVideo.id)
                          const isCompleted = videoProgress?.completed
                          
                          return (
                            <Button
                              onClick={() => handleVideoComplete(currentVideo.id)}
                              variant={isCompleted ? "default" : "outline"}
                              size="sm"
                              className={isCompleted ? 
                                "bg-green-500 text-white hover:bg-green-600" : 
                                "border-green-500 text-green-600 hover:bg-green-50"
                              }
                              disabled={isCompleted}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {isCompleted ? 'Completed' : 'Mark Complete'}
                            </Button>
                          )
                        })()}
                        {getNextUnlockedVideo() && (
                          <Button
                            onClick={handleNextVideo}
                            className="bg-[#ff6b6b] hover:bg-[#e55a5a]"
                          >
                            Next Video
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Curriculum */}
          <div>
            <Card className="bg-white/90 backdrop-blur-sm border shadow-lg">
              <CardHeader className="bg-gradient-to-r from-[#a0303f]/10 to-[#ff6b6b]/10">
                <CardTitle className="text-xl font-bold text-[#a0303f]">Course Content</CardTitle>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-4 h-4" />
                    <span>{course.curriculum?.flatMap(s => s.videos || []).length || 0} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-4 h-4" />
                    <span>{durationsLoading ? 'Loading...' : totalDuration}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="max-h-96 overflow-y-auto">
                  {course.curriculum?.map((section, sectionIndex) => (
                    <div key={section.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="p-4 bg-gradient-to-r from-[#fdf6e3] to-[#f7f0e8]">
                        <h3 className="font-bold text-[#a0303f]">{section.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">
                          {(section.videos || []).length} lessons • {(() => {
                            const sectionSeconds = (section.videos || []).reduce((sum, video) => {
                              return sum + (durations[video.id]?.seconds || 0)
                            }, 0)
                            const hours = Math.floor(sectionSeconds / 3600)
                            const minutes = Math.floor((sectionSeconds % 3600) / 60)
                            return hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`
                          })()}
                        </p>
                      </div>
                      <div>
                        {section.videos?.map((video, videoIndex) => {
                          const videoProgress = progress.find(p => p.videoId === video.id)
                          const isCompleted = videoProgress?.completed
                          const hasProgress = videoProgress && videoProgress.timestamp > 0
                          const isUnlocked = isVideoUnlocked(video)
                          
                          return (
                            <button
                              key={video.id}
                              onClick={() => isUnlocked ? handleVideoChange(video) : null}
                              disabled={!isUnlocked}
                              className={`w-full text-left p-4 transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                                !isUnlocked ? 'opacity-50 cursor-not-allowed bg-gray-50' :
                                currentVideo?.id === video.id ? 'bg-gradient-to-r from-[#ff6b6b]/20 to-[#ffb088]/20 border-[#ff6b6b]/30' :
                                'hover:bg-gradient-to-r hover:from-[#ff6b6b]/10 hover:to-[#ffb088]/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                                    !isUnlocked ? 'bg-gray-300 text-gray-500' :
                                    isCompleted ? 'bg-green-500 text-white' :
                                    currentVideo?.id === video.id ? 'bg-[#ff6b6b] text-white' : 
                                    hasProgress ? 'bg-yellow-500 text-white' :
                                    'bg-gradient-to-br from-[#a0303f]/20 to-[#ff6b6b]/20 text-[#a0303f]'
                                  }`}>
                                    {!isUnlocked ? (
                                      <Lock className="w-4 h-4" />
                                    ) : isCompleted ? (
                                      <CheckCircle className="w-4 h-4" />
                                    ) : (
                                      <Play className="w-4 h-4" />
                                    )}
                                  </div>
                                  <div>
                                    <p className={`text-sm font-medium ${
                                      !isUnlocked ? 'text-gray-500' :
                                      currentVideo?.id === video.id ? 'text-[#a0303f]' : 'text-gray-900'
                                    }`}>{video.title}</p>
                                    <div className="flex items-center space-x-2">
                                      <p className={`text-xs ${
                                        !isUnlocked ? 'text-gray-400' : 'text-gray-600'
                                      }`}>{durations[video.id]?.duration || video.duration || 'Loading...'}</p>
                                      {!isUnlocked && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                          Locked
                                        </span>
                                      )}
                                      {isUnlocked && hasProgress && !isCompleted && (
                                        <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                          In Progress
                                        </span>
                                      )}
                                      {isCompleted && (
                                        <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                          ✓ Completed
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Certificate Section */}
                  <div className="border-b border-gray-100 last:border-b-0">
                    <div className="p-4 bg-gradient-to-r from-[#fdf6e3] to-[#f7f0e8]">
                      <h3 className="font-bold text-[#a0303f]">Certificate</h3>
                      <p className="text-sm text-gray-600 mt-1">
                        Complete all lessons • {completionStats.completed}/{completionStats.total} done
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        if (completionStats.completed === completionStats.total && completionStats.total > 0) {
                          if (userReview) {
                            if (certificate) {
                              setShowCertificateModal(true)
                            } else {
                              handleGenerateCertificate()
                            }
                          } else {
                            setShowReviewModal(true)
                          }
                        }
                      }}
                      disabled={completionStats.completed !== completionStats.total || completionStats.total === 0}
                      className={`w-full text-left p-4 transition-all duration-200 ${
                        completionStats.completed !== completionStats.total || completionStats.total === 0
                          ? 'cursor-not-allowed bg-gray-50'
                          : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            completionStats.completed !== completionStats.total || completionStats.total === 0
                              ? 'bg-gray-300 text-gray-500'
                              : userReview && certificate
                              ? 'bg-green-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {completionStats.completed !== completionStats.total || completionStats.total === 0 ? (
                              <Lock className="w-4 h-4" />
                            ) : userReview && certificate ? (
                              <Award className="w-4 h-4" />
                            ) : (
                              <Star className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium ${
                              completionStats.completed !== completionStats.total || completionStats.total === 0
                                ? 'text-gray-500'
                                : 'text-gray-900'
                            }`}>
                              Certificate of Completion
                            </p>
                            <div className="flex items-center space-x-2">
                              <p className={`text-xs ${
                                completionStats.completed !== completionStats.total || completionStats.total === 0
                                  ? 'text-gray-400'
                                  : 'text-gray-600'
                              }`}>
                                {completionStats.completed !== completionStats.total || completionStats.total === 0
                                  ? 'Complete all lessons'
                                  : userReview && certificate
                                  ? 'Ready to download'
                                  : userReview
                                  ? 'Generate certificate'
                                  : 'Rate course first'
                                }
                              </p>
                              {completionStats.completed !== completionStats.total || completionStats.total === 0 ? (
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                  Locked
                                </span>
                              ) : userReview && certificate ? (
                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">
                                  ✓ Available
                                </span>
                              ) : (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                  Action Required
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
            

          </div>
        </div>
        
        {/* Modals */}
        {showReviewModal && (
          <ReviewModal
            courseId={params.id}
            existingReview={userReview}
            onClose={() => setShowReviewModal(false)}
            onSubmit={handleReviewSubmit}
          />
        )}
        
        {showCertificateModal && certificate && (
          <CertificateModal
            certificate={certificate}
            userName={session?.user?.name}
            onClose={() => setShowCertificateModal(false)}
          />
        )}
      </div>
    </div>
  )
}

export default function CoursePage() {
  return (
    <Suspense fallback={<Loader />}>
      <CoursePageContent />
    </Suspense>
  )
}