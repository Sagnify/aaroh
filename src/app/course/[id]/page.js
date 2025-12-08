"use client"

import { useSession } from 'next-auth/react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState, useRef, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Loader from '@/components/Loader'
import VideoPlayer from '@/components/VideoPlayer'
import ReviewModal from '@/components/ReviewModal'
import CertificateModal from '@/components/CertificateModal'
import { useCourseDurations } from '@/hooks/useYouTubeDuration'
import { Play, Lock, CheckCircle, Clock, BookOpen, Star, Award, X } from 'lucide-react'
import Confetti from 'react-confetti'

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

  const [showReviewModal, setShowReviewModal] = useState(false)
  const [showCertificateModal, setShowCertificateModal] = useState(false)
  const [userReview, setUserReview] = useState(null)
  const [certificate, setCertificate] = useState(null)
  const [courseReviews, setCourseReviews] = useState([])
  const [completionStats, setCompletionStats] = useState({ completed: 0, total: 0 })
  const { durations, totalDuration, loading: durationsLoading } = useCourseDurations(course?.curriculum)
  const [showSuccessMessage, setShowSuccessMessage] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [isGeneratingCert, setIsGeneratingCert] = useState(false)
  const videoListRef = useRef(null)

  // Check for review submission success
  useEffect(() => {
    if (searchParams.get('reviewSubmitted') === 'true') {
      setShowSuccessMessage(true)
      setShowConfetti(true)
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
      
      const timer = setTimeout(() => {
        setShowConfetti(false)
      }, 4000)
      
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
      
      return () => clearTimeout(timer)
    }
  }, [searchParams])



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

  const getAllVideos = () => {
    if (!course?.curriculum) return []
    return course.curriculum.flatMap(section => section.videos || [])
  }

  const getCurrentVideoIndex = () => {
    const allVideos = getAllVideos()
    return allVideos.findIndex(v => v.id === currentVideo?.id)
  }

  const getPrevVideo = () => {
    const allVideos = getAllVideos()
    const currentIndex = getCurrentVideoIndex()
    return currentIndex > 0 ? allVideos[currentIndex - 1] : null
  }

  const getNextVideo = () => {
    const allVideos = getAllVideos()
    const currentIndex = getCurrentVideoIndex()
    return currentIndex < allVideos.length - 1 ? allVideos[currentIndex + 1] : null
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
        
        // Resume from last watched video if no current video set
        if (!currentVideo && progressData.length > 0) {
          const lastWatched = progressData[0] // Most recent by updatedAt
          const video = findVideoById(lastWatched.videoId)
          if (video) {
            setCurrentVideo(video)
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

  const handleVideoChange = async (video) => {
    setCurrentVideo(video)
    // Save current video as last watched
    try {
      await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: String(params.id),
          videoId: String(video.id),
          completed: false
        })
      })
    } catch (error) {
      console.error('Failed to save progress:', error)
    }
  }

  // Scroll to current video in list
  useEffect(() => {
    if (currentVideo && videoListRef.current) {
      const videoElement = document.getElementById(`video-${currentVideo.id}`)
      if (videoElement) {
        videoElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [currentVideo])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return
      
      if (e.key === 'ArrowLeft' && getPrevVideo()) {
        e.preventDefault()
        handleVideoChange(getPrevVideo())
      } else if (e.key === 'ArrowRight' && getNextVideo()) {
        e.preventDefault()
        handleVideoChange(getNextVideo())
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [currentVideo, course])

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



  const handleVideoComplete = async () => {
    if (!currentVideo) return
    try {
      const response = await fetch('/api/user/progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: String(params.id),
          videoId: String(currentVideo.id),
          completed: true
        })
      })
      
      if (response.ok) {
        await loadProgress()
      }
    } catch (error) {
      console.error('Failed to mark video as complete:', error)
    }
  }

  const handleGenerateCertificate = async () => {
    setIsGeneratingCert(true)
    try {
      const response = await fetch('/api/certificates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courseId: params.id })
      })
      
      if (response.ok) {
        const cert = await response.json()
        const certWithCourse = {
          ...cert,
          courseTitle: cert.courseTitle || course?.title,
          userName: cert.userName || session?.user?.name
        }
        setCertificate(certWithCourse)
        // Small delay for smooth transition
        await new Promise(resolve => setTimeout(resolve, 300))
        setShowCertificateModal(true)
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to generate certificate')
      }
    } catch (error) {
      alert('Failed to generate certificate')
    } finally {
      setIsGeneratingCert(false)
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
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#ff6b6b', '#ffb088', '#a0303f', '#e55a5a', '#ff69b4', '#4ecdc4']}
          gravity={0.3}
          initialVelocityY={-20}
        />
      )}
      
      {showSuccessMessage && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <Card className="w-full max-w-md bg-white animate-in zoom-in-95 duration-300">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Star className="w-6 h-6 text-green-600 fill-current" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Thank You!</h3>
                    <p className="text-sm text-gray-600">Review submitted successfully</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowSuccessMessage(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-gray-700 mb-2">🎉 Your review helps us improve!</p>
                <p className="text-sm text-gray-600">You can now generate your certificate by clicking the Certificate section below.</p>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setShowSuccessMessage(false)
                    handleGenerateCertificate()
                  }}
                  disabled={isGeneratingCert}
                  className="flex-1 bg-[#ff6b6b] hover:bg-[#e55a5a] disabled:opacity-50"
                >
                  {isGeneratingCert ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Award className="w-4 h-4 mr-2" />
                      Get Certificate
                    </>
                  )}
                </Button>
                <Button
                  onClick={() => setShowSuccessMessage(false)}
                  variant="outline"
                  disabled={isGeneratingCert}
                >
                  Later
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto lg:px-6 lg:py-8">
        <div className="mb-8 hidden lg:block px-6">
          <h1 className="text-3xl font-bold text-[#a0303f] mb-2">{course.title}</h1>
          <p className="text-lg text-gray-600">{course.subtitle}</p>
        </div>
        <div className="lg:grid lg:grid-cols-3 lg:gap-8">
          {/* Video Player */}
          <div className="lg:col-span-2">
            <Card className="bg-white/90 backdrop-blur-sm border-0 lg:border shadow-none lg:shadow-lg rounded-none lg:rounded-lg">
              <CardContent className="p-0">
                {currentVideo && currentVideo.youtubeUrl ? (
                  <VideoPlayer 
                    youtubeUrl={currentVideo.youtubeUrl}
                    title={currentVideo.title}
                  />
                ) : (
                  <div className="aspect-video bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20 flex items-center justify-center rounded-t-lg">
                    <div className="text-center">
                      <Play className="w-20 h-20 text-[#a0303f] mx-auto mb-4" />
                      <p className="text-[#a0303f] font-medium">Select a video to start learning</p>
                    </div>
                  </div>
                )}
                <div className="p-4 lg:p-6">
                  <div className="mb-4">
                    <h2 className="text-lg lg:text-2xl font-bold text-[#a0303f] mb-1 lg:mb-2">
                      {currentVideo?.title || 'Welcome to Your Course'}
                    </h2>
                    <p className="text-sm lg:text-base text-gray-600">{currentVideo?.description || 'Choose a lesson from the curriculum to begin your learning journey.'}</p>
                  </div>
                  {currentVideo && (
                    <>
                      <div className="flex items-center justify-between gap-2 mb-4">
                        <Button
                          onClick={() => handleVideoChange(getPrevVideo())}
                          disabled={!getPrevVideo()}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          ← Previous
                        </Button>
                        {(() => {
                          const videoProgress = progress.find(p => p.videoId === currentVideo.id)
                          const isCompleted = videoProgress?.completed
                          return (
                            <Button
                              onClick={handleVideoComplete}
                              variant={isCompleted ? "default" : "outline"}
                              size="sm"
                              className={`flex-1 ${isCompleted ? "bg-green-500 hover:bg-green-600" : "border-green-500 text-green-600 hover:bg-green-50"}`}
                              disabled={isCompleted}
                            >
                              <CheckCircle className="w-4 h-4 mr-1" />
                              {isCompleted ? 'Completed' : 'Complete'}
                            </Button>
                          )
                        })()}
                        <Button
                          onClick={() => handleVideoChange(getNextVideo())}
                          disabled={!getNextVideo()}
                          size="sm"
                          className="flex-1 bg-[#ff6b6b] hover:bg-[#e55a5a]"
                        >
                          Next →
                        </Button>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-xs text-gray-600 mb-1">💡 Quick Tip</p>
                        <p className="text-sm text-gray-700">Use keyboard shortcuts: ← Previous | → Next | Space Play/Pause</p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Course Curriculum */}
          <div className="lg:block">
            <Card className="bg-white/90 backdrop-blur-sm border-0 lg:border shadow-none lg:shadow-lg rounded-none lg:rounded-lg">
              <CardHeader className="bg-gradient-to-r from-[#a0303f]/10 to-[#ff6b6b]/10 py-3 lg:py-6">
                <CardTitle className="text-lg lg:text-xl font-bold text-[#a0303f]">Course Content</CardTitle>
                <div className="flex items-center space-x-4 text-xs lg:text-sm text-gray-600 mt-2">
                  <div className="flex items-center space-x-1">
                    <BookOpen className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>{course.curriculum?.flatMap(s => s.videos || []).length || 0} lessons</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3 h-3 lg:w-4 lg:h-4" />
                    <span>{durationsLoading ? 'Loading...' : totalDuration}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div ref={videoListRef} className="lg:max-h-96 lg:overflow-y-auto">
                  {course.curriculum?.map((section, sectionIndex) => (
                    <div key={section.id} className="border-b border-gray-100 last:border-b-0">
                      <div className="p-3 lg:p-4 bg-gradient-to-r from-[#fdf6e3] to-[#f7f0e8]">
                        <h3 className="font-bold text-[#a0303f] text-sm lg:text-base">{section.title}</h3>
                        <p className="text-xs lg:text-sm text-gray-600 mt-1">
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
                        {section.videos?.map((video) => {
                          const videoProgress = progress.find(p => p.videoId === video.id)
                          const isCompleted = videoProgress?.completed
                          
                          return (
                            <button
                              key={video.id}
                              id={`video-${video.id}`}
                              onClick={() => handleVideoChange(video)}
                              className={`w-full text-left p-3 lg:p-4 transition-all duration-200 border-b border-gray-50 last:border-b-0 ${
                                currentVideo?.id === video.id ? 'bg-gradient-to-r from-[#ff6b6b]/20 to-[#ffb088]/20 border-l-4 border-l-[#ff6b6b]' :
                                'hover:bg-gradient-to-r hover:from-[#ff6b6b]/10 hover:to-[#ffb088]/10'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2 lg:space-x-3 flex-1">
                                  <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                                    isCompleted ? 'bg-green-500 text-white' :
                                    currentVideo?.id === video.id ? 'bg-[#ff6b6b] text-white' : 
                                    'bg-gradient-to-br from-[#a0303f]/20 to-[#ff6b6b]/20 text-[#a0303f]'
                                  }`}>
                                    {isCompleted ? (
                                      <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4" />
                                    ) : (
                                      <Play className="w-3 h-3 lg:w-4 lg:h-4" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className={`text-xs lg:text-sm font-medium truncate ${
                                      currentVideo?.id === video.id ? 'text-[#a0303f] font-bold' : 'text-gray-900'
                                    }`}>{video.title}</p>
                                    <p className="text-[10px] lg:text-xs text-gray-600">{durations[video.id]?.duration || video.duration || 'Loading...'}</p>
                                  </div>
                                </div>
                                {isCompleted && (
                                  <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                                )}
                              </div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                  ))}
                  
                  {/* Certificate Section */}
                  <div className="border-b border-gray-100 last:border-b-0">
                    <div className="p-3 lg:p-4 bg-gradient-to-r from-[#fdf6e3] to-[#f7f0e8]">
                      <h3 className="font-bold text-[#a0303f] text-sm lg:text-base">Certificate</h3>
                      <p className="text-xs lg:text-sm text-gray-600 mt-1">
                        Complete all lessons • {completionStats.completed}/{completionStats.total} done
                      </p>
                    </div>
                    <button
                      onClick={handleOpenCertificate}
                      disabled={completionStats.completed !== completionStats.total || completionStats.total === 0}
                      className={`w-full text-left p-3 lg:p-4 transition-all duration-200 ${
                        completionStats.completed !== completionStats.total || completionStats.total === 0
                          ? 'cursor-not-allowed bg-gray-50'
                          : 'hover:bg-gradient-to-r hover:from-green-50 hover:to-blue-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 lg:space-x-3">
                          <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                            completionStats.completed !== completionStats.total || completionStats.total === 0
                              ? 'bg-gray-300 text-gray-500'
                              : userReview && certificate
                              ? 'bg-green-500 text-white'
                              : 'bg-yellow-500 text-white'
                          }`}>
                            {completionStats.completed !== completionStats.total || completionStats.total === 0 ? (
                              <Lock className="w-3 h-3 lg:w-4 lg:h-4" />
                            ) : userReview && certificate ? (
                              <Award className="w-3 h-3 lg:w-4 lg:h-4" />
                            ) : (
                              <Star className="w-3 h-3 lg:w-4 lg:h-4" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={`text-xs lg:text-sm font-medium ${
                              completionStats.completed !== completionStats.total || completionStats.total === 0
                                ? 'text-gray-500'
                                : 'text-gray-900'
                            }`}>
                              Certificate of Completion
                            </p>
                            <div className="flex items-center space-x-1 lg:space-x-2">
                              <p className={`text-[10px] lg:text-xs ${
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
                                <span className="text-[10px] lg:text-xs bg-gray-100 text-gray-600 px-1.5 lg:px-2 py-0.5 rounded-full whitespace-nowrap">
                                  Locked
                                </span>
                              ) : userReview && certificate ? (
                                <span className="text-[10px] lg:text-xs bg-green-100 text-green-800 px-1.5 lg:px-2 py-0.5 rounded-full whitespace-nowrap">
                                  ✓ Available
                                </span>
                              ) : (
                                <span className="text-[10px] lg:text-xs bg-yellow-100 text-yellow-800 px-1.5 lg:px-2 py-0.5 rounded-full whitespace-nowrap">
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