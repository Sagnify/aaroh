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
  const [settings, setSettings] = useState(null)

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
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    }
  }

  const handleDownload = async () => {
    try {
      const element = document.getElementById('certificate-preview')
      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      })
      
      const imgData = canvas.toDataURL('image/png', 1.0)
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4'
      })
      
      pdf.addImage(imgData, 'PNG', 0, 0, 297, 210)
      pdf.save(`Certificate-${certificate.certificateId}.pdf`)
      
    } catch (error) {
      console.error('Error generating certificate:', error)
      alert('Error generating certificate. Please try again.')
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
          colors={['#ff6b6b', '#ffb088', '#a0303f', '#e55a5a', '#ff69b4', '#4ecdc4']}
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
<div className="lg:w-[60%] mx-auto p-6 bg-gray-50">
  <div id="certificate-preview" className="relative bg-white rounded-xl shadow-xl border-2 border-gray-200 aspect-[4/3] overflow-hidden">
    {settings?.templateUrl && settings.templateUrl !== '/certificates/template.png' ? (
      <div className="relative w-full h-full">
        <img
          src={settings.templateUrl}
          alt="Certificate Template"
          className="w-full h-full object-contain"
        />
        
        {/* Text Overlays */}
        {settings && (
          <>
            {/* Student Name */}
            <div
              className="absolute font-bold flex items-center text-left overflow-hidden whitespace-nowrap"
              style={{
                left: `calc(${(settings.studentNameX / 1123) * 100}% - ${((settings.studentNameWidth || 200) / 1123) * 50}%)`,
                top: `calc(${(settings.studentNameY / 794) * 100}% - ${((settings.studentNameHeight || 40) / 794) * 50}%)`,
                width: `${((settings.studentNameWidth || 200) / 1123) * 100}%`,
                height: `${((settings.studentNameHeight || 40) / 794) * 100}%`,
                fontSize: `${Math.max(8, Math.min(((settings.studentNameHeight || 40) * 0.6), ((settings.studentNameWidth || 200) / (customName.length * 1.0))))}px`,
                fontFamily: 'Great Vibes, cursive',
                color: '#4A5568'
              }}
            >
              {customName}
            </div>
            
            {/* Course Title */}
            <div
              className="absolute font-semibold flex items-center text-left overflow-hidden whitespace-nowrap"
              style={{
                left: `calc(${(settings.courseTitleX / 1123) * 100}% - ${((settings.courseTitleWidth || 250) / 1123) * 50}%)`,
                top: `calc(${(settings.courseTitleY / 794) * 100}% - ${((settings.courseTitleHeight || 40) / 794) * 50}%)`,
                width: `${((settings.courseTitleWidth || 250) / 1123) * 100}%`,
                height: `${((settings.courseTitleHeight || 40) / 794) * 100}%`,
                fontSize: `${Math.max(8, Math.min(((settings.courseTitleHeight || 40) * 0.6), ((settings.courseTitleWidth || 250) / ((certificate.courseTitle || certificate.course?.title || 'Course Title').length * 1.0))))}px`,
                color: '#800020'
              }}
            >
              {certificate.courseTitle || certificate.course?.title || 'Course Title'}
            </div>
            
            {/* Date */}
            <div
              className="absolute text-black flex items-center justify-center overflow-hidden whitespace-nowrap"
              style={{
                left: `calc(${(settings.dateX / 1123) * 100}% - ${((settings.dateWidth || 150) / 1123) * 50}%)`,
                top: `calc(${(settings.dateY / 794) * 100}% - ${((settings.dateHeight || 30) / 794) * 50}%)`,
                width: `${((settings.dateWidth || 150) / 1123) * 100}%`,
                height: `${((settings.dateHeight || 30) / 794) * 100}%`,
                fontSize: '12px'
              }}
            >
              {new Date(certificate.issuedAt).toLocaleDateString()}
            </div>
            
            {/* Certificate ID */}
            <div
              className="absolute text-black flex items-center justify-center overflow-hidden whitespace-nowrap"
              style={{
                left: `calc(${(settings.certificateIdX / 1123) * 100}% - ${((settings.certificateIdWidth || 120) / 1123) * 50}%)`,
                top: `calc(${(settings.certificateIdY / 794) * 100}% - ${((settings.certificateIdHeight || 30) / 794) * 50}%)`,
                width: `${((settings.certificateIdWidth || 120) / 1123) * 100}%`,
                height: `${((settings.certificateIdHeight || 30) / 794) * 100}%`,
                fontSize: '7px'
              }}
            >
              {certificate.certificateId}
            </div>
            

          </>
        )}
      </div>
    ) : (
      <div className="flex items-center justify-center h-full text-gray-500">
        <div className="text-center">
          <div className="text-4xl mb-2">📄</div>
          <p>No certificate template configured</p>
          <p className="text-sm">Please contact administrator</p>
        </div>
      </div>
    )}
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