"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Award, Download, X } from 'lucide-react'
import Confetti from 'react-confetti'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

export default function CertificateModal({ certificate, userName, onClose }) {
  const defaultName = userName || certificate?.userName || certificate?.user?.name || 'Student'
  const [customName, setCustomName] = useState(defaultName || '')
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [settings, setSettings] = useState(null)
  const [generatedImageUrl, setGeneratedImageUrl] = useState(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [downloadState, setDownloadState] = useState('idle') // idle, downloading, downloaded
  const [fillProgress, setFillProgress] = useState(0)
  const [showImageReveal, setShowImageReveal] = useState(false)
  const [revealComplete, setRevealComplete] = useState(false)

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    updateWindowDimensions()
    window.addEventListener('resize', updateWindowDimensions)
    
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    
    // Fetch certificate settings
    fetchSettings()
    
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateWindowDimensions)
    }
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/certificate-settings')
      if (response.ok) {
        const data = await response.json()
        setSettings(data)
        // Only generate if we have all required data
        if (certificate?.certificateId && certificate?.issuedAt && (certificate?.courseTitle || certificate?.course?.title)) {
          await generateCertificate(data)
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  useEffect(() => {
    if (isGenerating) {
      setFillProgress(0)
      const interval = setInterval(() => {
        setFillProgress(prev => {
          if (prev >= 95) {
            clearInterval(interval)
            return 95
          }
          return prev + 2
        })
      }, 30)
      return () => clearInterval(interval)
    } else if (fillProgress > 0) {
      setFillProgress(100)
      setTimeout(() => setFillProgress(0), 300)
    }
  }, [isGenerating])

  useEffect(() => {
    if (generatedImageUrl && !isGenerating) {
      setShowImageReveal(true)
      setFillProgress(0)
      setRevealComplete(false)
      
      const interval = setInterval(() => {
        setFillProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval)
            setTimeout(() => {
              setShowImageReveal(false)
              setRevealComplete(true)
            }, 800)
            return 100
          }
          return prev + 0.8
        })
      }, 30)
      
      return () => clearInterval(interval)
    }
  }, [generatedImageUrl, isGenerating])

  const generateCertificate = async (settingsData = settings) => {
    const courseTitle = certificate?.courseTitle || certificate?.course?.title
    if (!settingsData || !certificate || !certificate.certificateId || !certificate.issuedAt || !courseTitle) {
      console.log('Missing data for certificate generation:', { 
        hasSettings: !!settingsData, 
        hasCertificate: !!certificate,
        hasCertId: !!certificate?.certificateId,
        hasDate: !!certificate?.issuedAt,
        hasCourseTitle: !!courseTitle
      })
      return
    }

    setIsGenerating(true)

    try {
      return await new Promise((resolve) => {
        try {
          // Create canvas for certificate generation
          const canvas = document.createElement('canvas')
          const ctx = canvas.getContext('2d')

          canvas.width = 1123
          canvas.height = 794

          const img = new Image()
          img.crossOrigin = 'anonymous'

          img.onload = () => {
            // Draw template
            ctx.drawImage(img, 0, 0, 1123, 794)

            // Helper function to calculate max font size that fits text in box
            const calculateMaxFontSize = (text, boxWidth, boxHeight, minSize = 8) => {
              let fontSize = boxHeight * 0.8 // Start with 80% of box height
              ctx.font = `${fontSize}px sans-serif`

              // Reduce font size until text fits in box width
              while (ctx.measureText(text).width > boxWidth && fontSize > minSize) {
                fontSize -= 1
                ctx.font = `${fontSize}px sans-serif`
              }

              return Math.max(fontSize, minSize)
            }

            // Student Name - Great Vibes font, dark blue, left aligned
            const studentNameWidth = settingsData.studentNameWidth || 200
            const studentNameHeight = settingsData.studentNameHeight || 40
            const studentNameFontSize = calculateMaxFontSize(customName, studentNameWidth, studentNameHeight)
            ctx.font = `bold ${studentNameFontSize}px cursive`
            ctx.fillStyle = '#4A5568'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            const studentNameX = settingsData.studentNameX - studentNameWidth / 2
            const studentNameY = settingsData.studentNameY
            ctx.fillText(customName, studentNameX, studentNameY)

            // Course Title - burgundy, left aligned
            const courseTitle = certificate.courseTitle || certificate.course?.title || 'Course Title'
            if (!courseTitle || courseTitle === 'Course Title') {
              console.log('Course title not available, skipping generation')
              setIsGenerating(false)
              resolve()
              return
            }
            const courseTitleWidth = settingsData.courseTitleWidth || 250
            const courseTitleHeight = settingsData.courseTitleHeight || 40
            const courseTitleFontSize = calculateMaxFontSize(courseTitle, courseTitleWidth, courseTitleHeight)
            ctx.font = `bold ${courseTitleFontSize}px sans-serif`
            ctx.fillStyle = '#800020'
            ctx.textAlign = 'left'
            ctx.textBaseline = 'middle'
            const courseTitleX = settingsData.courseTitleX - courseTitleWidth / 2
            const courseTitleY = settingsData.courseTitleY
            ctx.fillText(courseTitle, courseTitleX, courseTitleY)

            // Date - center aligned, larger font size, moved down
            const issuedDate = certificate.issuedAt ? new Date(certificate.issuedAt) : new Date()
            const day = String(issuedDate.getDate()).padStart(2, '0')
            const month = String(issuedDate.getMonth() + 1).padStart(2, '0')
            const year = issuedDate.getFullYear()
            const dateText = `${day}/${month}/${year}`
            const dateWidth = settingsData.dateWidth || 150
            const dateHeight = settingsData.dateHeight || 30
            const dateFontSize = calculateMaxFontSize(dateText, dateWidth, dateHeight, 10)
            ctx.font = `${dateFontSize}px sans-serif`
            ctx.fillStyle = '#000000'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const dateX = settingsData.dateX
            const dateY = settingsData.dateY + 8
            ctx.fillText(dateText, dateX, dateY)

            // Certificate ID - center aligned, larger font size, moved down
            const certificateId = certificate.certificateId || 'CERT-ID'
            const certificateIdWidth = settingsData.certificateIdWidth || 120
            const certificateIdHeight = settingsData.certificateIdHeight || 30
            const certificateIdFontSize = calculateMaxFontSize(certificateId, certificateIdWidth, certificateIdHeight, 8)
            ctx.font = `${certificateIdFontSize}px sans-serif`
            ctx.fillStyle = '#000000'
            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'
            const certificateIdX = settingsData.certificateIdX
            const certificateIdY = settingsData.certificateIdY + 8
            ctx.fillText(certificateId, certificateIdX, certificateIdY)

            // Set generated image
            setGeneratedImageUrl(canvas.toDataURL('image/png'))
            setIsGenerating(false)
            resolve()
          }

          img.onerror = () => {
            console.error('Failed to load template image')
            setIsGenerating(false)
            resolve()
          }

          img.src = settingsData.templateUrl
        } catch (err) {
          console.error('Failed to generate certificate inner error:', err)
          setIsGenerating(false)
          resolve()
        }
      })
    } catch (error) {
      console.error('Failed to generate certificate:', error)
      setIsGenerating(false)
    }
  }

  const handleDownload = async () => {
    try {
      setDownloadState('downloading')
      
      const element = document.getElementById('certificate-preview')
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        imageTimeout: 0
      })

      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = 297
      const pdfHeight = 210
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight)
      pdf.save(`Certificate-${certificate.certificateId}.pdf`)

      setDownloadState('downloaded')
      setTimeout(() => setDownloadState('idle'), 2000)

    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Error generating certificate. Please try again.')
      setDownloadState('idle')
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-2 sm:p-4 animate-in fade-in duration-200 overflow-hidden">
      {/* Professional Confetti Animation */}
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

      <div className="w-full max-w-6xl bg-white rounded-lg sm:rounded-2xl shadow-2xl my-auto animate-in zoom-in-95 slide-in-from-bottom-4 duration-300 max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#a0303f] to-[#ff6b6b] p-4 sm:p-6 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-2 sm:gap-3 pr-8">
            <Award className="w-6 h-6 sm:w-8 sm:h-8 flex-shrink-0" />
            <div>
              <h1 className="text-lg sm:text-2xl font-bold">🎉 Congratulations!</h1>
              <p className="text-sm sm:text-base text-white/90">Your certificate is ready</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Certificate Preview - Left Side */}
          <div className="lg:w-[60%] mx-auto p-3 sm:p-6 bg-gray-50">
            <div 
              id="certificate-preview" 
              className="relative bg-white rounded-lg sm:rounded-xl shadow-xl border-2 border-gray-200 aspect-[4/3] overflow-hidden"
            >
              {isGenerating ? (
                <div className="relative h-full w-full overflow-hidden bg-white">
                  <div 
                    className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-[#ff6b6b] via-[#ff8a8a] to-[#ffb0b0] transition-all duration-300 ease-out"
                    style={{ height: `${fillProgress}%` }}
                  >
                    <div className="absolute inset-0 opacity-30">
                      <div className="absolute top-0 left-0 right-0 h-8 bg-white/20 rounded-[50%] animate-pulse"></div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="text-center px-4">
                      <Award className="w-16 h-16 text-[#a0303f] mx-auto mb-4 drop-shadow-lg" style={{ filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }} />
                      <p className="text-xl font-semibold text-gray-800 mb-1 drop-shadow-sm">Crafting Certificate</p>
                      <p className="text-3xl font-bold text-[#a0303f] drop-shadow-sm">{fillProgress}%</p>
                    </div>
                  </div>
                </div>
              ) : generatedImageUrl ? (
                <div className="relative w-full h-full overflow-hidden bg-white">
                  <div className="absolute inset-0">
                    <img
                      src={generatedImageUrl}
                      alt="Generated Certificate"
                      className="w-full h-full object-contain"
                      draggable="false"
                    />
                  </div>
                  {showImageReveal && (() => {
                    const dampen = fillProgress > 75 ? Math.max(0, (100 - fillProgress) / 25) : 1
                    
                    return (
                      <div 
                        className="absolute left-0 right-0 bg-white transition-all ease-out pointer-events-none"
                        style={{ 
                          top: 0,
                          bottom: `${fillProgress}%`,
                          transitionDuration: '100ms'
                        }}
                      >
                        <svg 
                          className="absolute bottom-0 w-full transition-all duration-500" 
                          style={{ 
                            height: `${80 * dampen}px`, 
                            transform: `translateY(${79 * dampen}px)`,
                            opacity: dampen
                          }} 
                          viewBox="0 0 1200 80" 
                          preserveAspectRatio="none"
                        >
                          <defs>
                            <linearGradient id="wave-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#ff6b6b" />
                              <stop offset="20%" stopColor="#ffa07a" />
                              <stop offset="40%" stopColor="#ffd700" />
                              <stop offset="60%" stopColor="#98fb98" />
                              <stop offset="80%" stopColor="#87ceeb" />
                              <stop offset="100%" stopColor="#da70d6" />
                            </linearGradient>
                          </defs>
                          {(() => {
                          const convergeTo = 40
                          const wave1Pos = 30 + (convergeTo - 30) * (1 - dampen)
                          const wave2Pos = 45 + (convergeTo - 45) * (1 - dampen)
                          const wave3Pos = 58 + (convergeTo - 58) * (1 - dampen)
                          const minAmplitude = 0.3
                          const amplitudeFactor = minAmplitude + (dampen * (1 - minAmplitude))
                          const wave1Min = 5 * amplitudeFactor
                          const wave1Max = 55 * amplitudeFactor
                          const wave2Min = 22 * amplitudeFactor
                          const wave2Max = 68 * amplitudeFactor
                          const wave3Min = 38 * amplitudeFactor
                          const wave3Max = 78 * amplitudeFactor
                          
                          return (
                            <>
                              <path 
                                fill="url(#wave-gradient)" 
                                opacity="0.9"
                              >
                                <animate attributeName="d" dur="2.5s" repeatCount="indefinite" values={
                                  `M0,0 L1200,0 L1200,${wave1Pos} Q1050,${wave1Pos - wave1Min} 900,${wave1Pos} T600,${wave1Pos} T300,${wave1Pos} T0,${wave1Pos} Z;
                                  M0,0 L1200,0 L1200,${wave1Pos} Q1050,${wave1Pos + wave1Max} 900,${wave1Pos} T600,${wave1Pos} T300,${wave1Pos} T0,${wave1Pos} Z;
                                  M0,0 L1200,0 L1200,${wave1Pos} Q1050,${wave1Pos - wave1Min} 900,${wave1Pos} T600,${wave1Pos} T300,${wave1Pos} T0,${wave1Pos} Z`
                                } />
                              </path>
                              <path 
                                fill="url(#wave-gradient)" 
                                opacity="0.75"
                              >
                                <animate attributeName="d" dur="3s" repeatCount="indefinite" values={
                                  `M0,0 L1200,0 L1200,${wave2Pos} Q1000,${wave2Pos - wave2Min} 800,${wave2Pos} T400,${wave2Pos} T0,${wave2Pos} Z;
                                  M0,0 L1200,0 L1200,${wave2Pos} Q1000,${wave2Pos + wave2Max} 800,${wave2Pos} T400,${wave2Pos} T0,${wave2Pos} Z;
                                  M0,0 L1200,0 L1200,${wave2Pos} Q1000,${wave2Pos - wave2Min} 800,${wave2Pos} T400,${wave2Pos} T0,${wave2Pos} Z`
                                } />
                              </path>
                              <path 
                                fill="url(#wave-gradient)" 
                                opacity="0.6"
                              >
                                <animate attributeName="d" dur="3.5s" repeatCount="indefinite" values={
                                  `M0,0 L1200,0 L1200,${wave3Pos} Q950,${wave3Pos - wave3Min} 700,${wave3Pos} T300,${wave3Pos} T0,${wave3Pos} Z;
                                  M0,0 L1200,0 L1200,${wave3Pos} Q950,${wave3Pos + wave3Max} 700,${wave3Pos} T300,${wave3Pos} T0,${wave3Pos} Z;
                                  M0,0 L1200,0 L1200,${wave3Pos} Q950,${wave3Pos - wave3Min} 700,${wave3Pos} T300,${wave3Pos} T0,${wave3Pos} Z`
                                } />
                              </path>
                            </>
                            )
                          })()}
                        </svg>
                      </div>
                    )
                  })()}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p>Loading certificate...</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Controls - Right Side */}
          <div className="lg:w-1/3 p-4 sm:p-8 bg-white border-t lg:border-t-0 lg:border-l border-gray-200">
            <div className="space-y-4 sm:space-y-6">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Customize Certificate</h3>
                <p className="text-gray-600 text-xs sm:text-sm">Personalize before downloading</p>
              </div>

              <div className="space-y-3 sm:space-y-4">
                <div>
                  <Label htmlFor="name" className="text-xs sm:text-sm font-medium text-gray-700">
                    Name on Certificate
                  </Label>
                  <div className="flex flex-col sm:flex-row gap-2 mt-1">
                    <Input
                      id="name"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      className="text-base sm:text-lg font-medium flex-1"
                      placeholder="Enter your name"
                    />
                    <Button
                      onClick={() => generateCertificate()}
                      disabled={isGenerating}
                      className="bg-[#a0303f] hover:bg-[#8a2a37] text-white px-4 w-full sm:w-auto"
                    >
                      {isGenerating ? 'Updating...' : 'Update'}
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Click Update to regenerate</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                    <span className="text-sm sm:text-base font-medium">Certificate Details</span>
                  </div>
                  <div className="mt-2 text-xs sm:text-sm text-green-700 space-y-1">
                    <p className="break-words"><strong>Course:</strong> {certificate.courseTitle || certificate.course?.title}</p>
                    <p className="break-all"><strong>ID:</strong> {certificate.certificateId}</p>
                    <p><strong>Date:</strong> {(() => {
                      const d = new Date(certificate.issuedAt)
                      const day = String(d.getDate()).padStart(2, '0')
                      const month = String(d.getMonth() + 1).padStart(2, '0')
                      const year = d.getFullYear()
                      return `${day}/${month}/${year}`
                    })()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 sm:space-y-3">
                <Button
                  onClick={handleDownload}
                  disabled={isGenerating || !generatedImageUrl || downloadState !== 'idle' || !revealComplete}
                  className="w-full bg-[#ff6b6b] hover:bg-[#e55a5a] text-white py-2.5 sm:py-3 text-base sm:text-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  size="lg"
                >
                  {downloadState === 'downloading' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                      Downloading...
                    </>
                  ) : downloadState === 'downloaded' ? (
                    <>
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Downloaded!
                    </>
                  ) : (
                    <>
                      <Download className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                      Download PDF
                    </>
                  )}
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    High-quality PDF • Ready to print
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}