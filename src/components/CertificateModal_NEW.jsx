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
  const defaultName = userName || certificate.userName || certificate.user?.name || 'Student'
  const [customName, setCustomName] = useState(defaultName)
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const updateWindowDimensions = () => {
      setWindowDimensions({ width: window.innerWidth, height: window.innerHeight })
    }
    updateWindowDimensions()
    window.addEventListener('resize', updateWindowDimensions)
    
    const timer = setTimeout(() => setShowConfetti(false), 4000)
    return () => {
      clearTimeout(timer)
      window.removeEventListener('resize', updateWindowDimensions)
    }
  }, [])

  const handleDownload = async () => {
    const certificateElement = document.getElementById('certificate-preview')
    
    try {
      const canvas = await html2canvas(certificateElement, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      const imgWidth = 297
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
      pdf.save(`Certificate-${certificate.certificateId}.pdf`)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
      {/* Professional Confetti Animation */}
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          colors={['#ff6b6b', '#ffb088', '#a0303f', '#ffd700', '#ff69b4', '#4ecdc4']}
          gravity={0.3}
          initialVelocityY={-20}
        />
      )}

      <div className="w-full max-w-6xl bg-white rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-[#a0303f] to-[#ff6b6b] p-6 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            className="absolute top-4 right-4 text-white hover:bg-white/20"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
          <div className="flex items-center gap-3">
            <Award className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">🎉 Congratulations!</h1>
              <p className="text-white/90">Your certificate is ready to download</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Certificate Preview - Left Side */}
<div className="lg:w-[60%] mx-auto p-6 bg-gradient-to-b from-[#fffefb] to-[#fdf6e3]">
  <div id="certificate-preview" className="relative bg-white rounded-xl shadow-xl border-2 border-[#d1b56f] aspect-[4/3] overflow-hidden">

    {/* Soft gradient glow */}
    <div className="absolute inset-0 bg-gradient-to-br from-[#fffaf2]/40 to-transparent pointer-events-none"></div>

    {/* Elegant Corners */}
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute top-2 left-2 w-6 h-6 border-t-[3px] border-l-[3px] border-[#a0303f] rounded-tl-lg"></div>
      <div className="absolute top-2 right-2 w-6 h-6 border-t-[3px] border-r-[3px] border-[#a0303f] rounded-tr-lg"></div>
      <div className="absolute bottom-2 left-2 w-6 h-6 border-b-[3px] border-l-[3px] border-[#a0303f] rounded-bl-lg"></div>
      <div className="absolute bottom-2 right-2 w-6 h-6 border-b-[3px] border-r-[3px] border-[#a0303f] rounded-br-lg"></div>
    </div>

    {/* Inner border */}
    <div className="absolute inset-6 border border-[#e0c66f]/60 rounded-lg"></div>

    <div className="h-full flex flex-col justify-center items-center px-6 py-8 text-center relative z-10">

      {/* Header */}
      <div className="mb-4 mt-4">
        {/* Medal Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-[#ffd700] via-[#f8e58b] to-[#f5c400] rounded-full shadow-lg ring-4 ring-[#a0303f]/20 mb-6">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-[#a0303f]" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2L15.09 8.26L22 9L17 14L18.18 21L12 17.77L5.82 21L7 14L2 9L8.91 8.26L12 2Z" />
            <circle cx="12" cy="12" r="3" fill="currentColor" />
          </svg>
        </div>

        <h2 className="text-2xl font-extrabold tracking-widest text-[#a0303f] mb-2 mt-2">
          CERTIFICATE OF COMPLETION
        </h2>

        <div className="w-24 h-[2px] bg-gradient-to-r from-[#a0303f] to-[#ffd700] mx-auto mb-4 rounded-full"></div>
        <p className="text-gray-600 text-sm mb-2">This is to certify that</p>
      </div>

      {/* Recipient Name */}
      <div className="mb-4">
        <h3
          className="text-3xl font-bold text-[#a0303f]"
          style={{ fontFamily: 'Playfair Display, serif', fontStyle: 'italic' }}
        >
          {customName}
        </h3>
        <div className="w-36 h-[2px] bg-gradient-to-r from-[#ffd700] to-[#a0303f] mx-auto rounded-full mt-1"></div>
      </div>

      <p className="text-gray-700 text-base mb-3 italic">
        has successfully completed the course
      </p>

      {/* Course Title */}
      <h4 className="text-2xl font-semibold text-[#a0303f] mb-6 tracking-wide uppercase">
        {certificate.courseTitle || certificate.course?.title || 'Course Title'}
      </h4>

      {/* Footer — moved slightly up */}
      <div className="mt-auto mb-3 w-full flex items-end justify-between px-8">
        <div className="text-[11px] text-gray-500 text-left">
          <p>Issued on</p>
          <p className="font-medium text-gray-700">
            {new Date(certificate.issuedAt).toLocaleDateString()}
          </p>
        </div>

        <div className="text-right">
          <p
            className="text-base font-semibold text-gray-800 mb-1"
            style={{ fontFamily: 'Great Vibes, cursive' }}
          >
            Kashmira Chakraborty
          </p>
          <div className="w-28 h-[1px] bg-gray-400 mx-auto mb-1"></div>
          <p className="text-[11px] text-gray-600">Instructor, Aaroh Music Academy</p>
        </div>
      </div>
    </div>
  </div>
</div>


          {/* Controls - Right Side */}
          <div className="lg:w-1/3 p-8 bg-white">
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Customize Your Certificate</h3>
                <p className="text-gray-600 text-sm">Personalize your certificate before downloading</p>
              </div>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-sm font-medium text-gray-700">
                    Name on Certificate
                  </Label>
                  <Input
                    id="name"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="mt-1 text-lg font-medium"
                    placeholder="Enter your name"
                  />
                  <p className="text-xs text-gray-500 mt-1">This name will appear on your certificate</p>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-800">
                    <Award className="w-5 h-5" />
                    <span className="font-medium">Certificate Details</span>
                  </div>
                  <div className="mt-2 text-sm text-green-700 space-y-1">
                    <p><strong>Course:</strong> {certificate.courseTitle || certificate.course?.title}</p>
                    <p><strong>ID:</strong> {certificate.certificateId}</p>
                    <p><strong>Date:</strong> {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleDownload}
                  className="w-full bg-[#ff6b6b] hover:bg-[#e55a5a] text-white py-3 text-lg font-medium"
                  size="lg"
                >
                  <Download className="w-5 h-5 mr-2" />
                  Download Certificate PDF
                </Button>
                
                <div className="text-center">
                  <p className="text-xs text-gray-500">
                    High-quality PDF • Ready to print • Share on LinkedIn
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