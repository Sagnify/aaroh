"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload, Save, Eye } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'

export default function CertificateSettings() {
  const [settings, setSettings] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [activeField, setActiveField] = useState(null)
  const [draggedElement, setDraggedElement] = useState(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [resizingElement, setResizingElement] = useState(null)

  useEffect(() => {
    document.title = 'Certificate Settings | Aaroh Admin'
    fetchSettings()
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
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // Get CSRF token from meta tag or session
      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || 
                       await fetch('/api/auth/csrf').then(r => r.json()).then(d => d.csrfToken)
      
      const response = await fetch('/api/certificate-settings', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'X-CSRF-Token': csrfToken
        },
        body: JSON.stringify(settings)
      })
      
      if (response.ok) {
        alert('Certificate settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Save error:', error)
      alert('Error saving settings')
    } finally {
      setSaving(false)
    }
  }

  const updateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: parseInt(value) || value }))
  }

  const handleMouseDown = (e, fieldType) => {
    e.preventDefault()
    setDraggedElement(fieldType)
    
    const rect = e.currentTarget.parentElement.getBoundingClientRect()
    setDragOffset({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    })
  }

  const handleMouseMove = (e) => {
    if (!draggedElement) return
    
    const container = document.querySelector('.certificate-preview-container')
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 1123)
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 794)
    
    const fieldMap = {
      'studentName': { x: 'studentNameX', y: 'studentNameY' },
      'courseTitle': { x: 'courseTitleX', y: 'courseTitleY' },
      'date': { x: 'dateX', y: 'dateY' },
      'certificateId': { x: 'certificateIdX', y: 'certificateIdY' }
    }
    
    const field = fieldMap[draggedElement]
    if (field) {
      updateSetting(field.x, Math.max(0, Math.min(1123, x)))
      updateSetting(field.y, Math.max(0, Math.min(794, y)))
    }
  }

  const handleMouseUp = () => {
    setDraggedElement(null)
  }

  const handleResizeStart = (e, fieldType) => {
    e.preventDefault()
    e.stopPropagation()
    setResizingElement(fieldType)
  }

  const handleResizeMove = (e) => {
    if (!resizingElement) return
    
    const container = document.querySelector('.certificate-preview-container')
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const mouseX = ((e.clientX - rect.left) / rect.width) * 1123
    const mouseY = ((e.clientY - rect.top) / rect.height) * 794
    
    const fieldMap = {
      'studentName': { width: 'studentNameWidth', height: 'studentNameHeight' },
      'courseTitle': { width: 'courseTitleWidth', height: 'courseTitleHeight' },
      'date': { width: 'dateWidth', height: 'dateHeight' },
      'certificateId': { width: 'certificateIdWidth', height: 'certificateIdHeight' }
    }
    
    const field = fieldMap[resizingElement]
    if (field) {
      const currentX = settings[`${resizingElement}X`] || 0
      const currentY = settings[`${resizingElement}Y`] || 0
      
      // Calculate new dimensions from center point
      const newWidth = Math.max(30, Math.abs(mouseX - currentX) * 2)
      const newHeight = Math.max(15, Math.abs(mouseY - currentY) * 2)
      
      updateSetting(field.width, Math.round(newWidth))
      updateSetting(field.height, Math.round(newHeight))
    }
  }

  const handleResizeEnd = () => {
    setResizingElement(null)
  }

  // Add event listeners
  useEffect(() => {
    if (draggedElement) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [draggedElement])

  useEffect(() => {
    if (resizingElement) {
      document.addEventListener('mousemove', handleResizeMove)
      document.addEventListener('mouseup', handleResizeEnd)
      return () => {
        document.removeEventListener('mousemove', handleResizeMove)
        document.removeEventListener('mouseup', handleResizeEnd)
      }
    }
  }, [resizingElement])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 bg-[#a0303f] rounded-full flex items-center justify-center animate-pulse">
            <Upload className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#a0303f]">Certificate Settings</h1>
        <Button onClick={() => setPreviewMode(!previewMode)} variant="outline">
          <Eye className="w-4 h-4 mr-2" />
          {previewMode ? 'Edit Mode' : 'Preview Mode'}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Settings Panel */}
        <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Template & Positioning</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="dark:text-gray-200">Certificate Template</Label>
              <ImageUpload
                currentImage={settings?.templateUrl && settings.templateUrl !== '/certificates/template.png' ? settings.templateUrl : null}
                onImageUpload={(url) => updateSetting('templateUrl', url)}
                folder="certificates"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">Student Name X</Label>
                <Input
                  type="number"
                  value={settings?.studentNameX ?? ''}
                  onChange={(e) => updateSetting('studentNameX', e.target.value)}
                />
              </div>
              <div>
                <Label className="dark:text-gray-200">Student Name Y</Label>
                <Input
                  type="number"
                  value={settings?.studentNameY ?? ''}
                  onChange={(e) => updateSetting('studentNameY', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">Course Title X</Label>
                <Input
                  type="number"
                  value={settings?.courseTitleX ?? ''}
                  onChange={(e) => updateSetting('courseTitleX', e.target.value)}
                />
              </div>
              <div>
                <Label className="dark:text-gray-200">Course Title Y</Label>
                <Input
                  type="number"
                  value={settings?.courseTitleY ?? ''}
                  onChange={(e) => updateSetting('courseTitleY', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">Date X</Label>
                <Input
                  type="number"
                  value={settings?.dateX ?? ''}
                  onChange={(e) => updateSetting('dateX', e.target.value)}
                />
              </div>
              <div>
                <Label className="dark:text-gray-200">Date Y</Label>
                <Input
                  type="number"
                  value={settings?.dateY ?? ''}
                  onChange={(e) => updateSetting('dateY', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">Certificate ID X</Label>
                <Input
                  type="number"
                  value={settings?.certificateIdX ?? ''}
                  onChange={(e) => updateSetting('certificateIdX', e.target.value)}
                />
              </div>
              <div>
                <Label className="dark:text-gray-200">Certificate ID Y</Label>
                <Input
                  type="number"
                  value={settings?.certificateIdY ?? ''}
                  onChange={(e) => updateSetting('certificateIdY', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="dark:text-gray-200">Instructor Name X</Label>
                <Input
                  type="number"
                  value={settings?.instructorNameX ?? ''}
                  onChange={(e) => updateSetting('instructorNameX', e.target.value)}
                />
              </div>
              <div>
                <Label className="dark:text-gray-200">Instructor Name Y</Label>
                <Input
                  type="number"
                  value={settings?.instructorNameY ?? ''}
                  onChange={(e) => updateSetting('instructorNameY', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">💡 Drag the colored boxes on the template to position text elements</p>
              <div className="grid grid-cols-2 gap-2 text-xs dark:text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Student Name</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Course Title</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Date</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span>Certificate ID</span>
                </div>

              </div>
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Settings'}
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800">
          <CardHeader>
            <CardTitle>Certificate Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="certificate-preview-container relative bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden aspect-[4/3]">
              {settings?.templateUrl && settings.templateUrl !== '/certificates/template.png' ? (
                <div className="relative w-full h-full">
                  <img
                    src={settings.templateUrl}
                    alt="Certificate Template"
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Draggable Text Boxes */}
                  {settings && (
                    <>
                      {/* Student Name */}
                      <div
                        className="absolute bg-red-500/20 border-2 border-red-500 rounded cursor-move select-none group"
                        style={{
                          left: `${(settings.studentNameX / 1123) * 100}%`,
                          top: `${(settings.studentNameY / 794) * 100}%`,
                          width: `${((settings.studentNameWidth || 200) / 1123) * 100}%`,
                          height: `${((settings.studentNameHeight || 40) / 794) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'studentName')}
                      >
                        <span className="text-xs font-bold text-red-700 p-1 block text-center">Student Name</span>
                        <div 
                          className="absolute bottom-0 right-0 w-3 h-3 bg-red-500 cursor-se-resize opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleResizeStart(e, 'studentName')}
                        ></div>
                      </div>
                      
                      {/* Course Title */}
                      <div
                        className="absolute bg-blue-500/20 border-2 border-blue-500 rounded cursor-move select-none group"
                        style={{
                          left: `${(settings.courseTitleX / 1123) * 100}%`,
                          top: `${(settings.courseTitleY / 794) * 100}%`,
                          width: `${((settings.courseTitleWidth || 250) / 1123) * 100}%`,
                          height: `${((settings.courseTitleHeight || 40) / 794) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'courseTitle')}
                      >
                        <span className="text-xs font-bold text-blue-700 p-1 block text-center">Course Title</span>
                        <div 
                          className="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleResizeStart(e, 'courseTitle')}
                        ></div>
                      </div>
                      
                      {/* Date */}
                      <div
                        className="absolute bg-green-500/20 border-2 border-green-500 rounded cursor-move select-none group"
                        style={{
                          left: `${(settings.dateX / 1123) * 100}%`,
                          top: `${(settings.dateY / 794) * 100}%`,
                          width: `${((settings.dateWidth || 150) / 1123) * 100}%`,
                          height: `${((settings.dateHeight || 30) / 794) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'date')}
                      >
                        <span className="text-xs font-bold text-green-700 p-1 block text-center">Date</span>
                        <div 
                          className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 cursor-se-resize opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleResizeStart(e, 'date')}
                        ></div>
                      </div>
                      
                      {/* Certificate ID */}
                      <div
                        className="absolute bg-purple-500/20 border-2 border-purple-500 rounded cursor-move select-none group"
                        style={{
                          left: `${(settings.certificateIdX / 1123) * 100}%`,
                          top: `${(settings.certificateIdY / 794) * 100}%`,
                          width: `${((settings.certificateIdWidth || 120) / 1123) * 100}%`,
                          height: `${((settings.certificateIdHeight || 30) / 794) * 100}%`,
                          transform: 'translate(-50%, -50%)'
                        }}
                        onMouseDown={(e) => handleMouseDown(e, 'certificateId')}
                      >
                        <span className="text-xs font-bold text-purple-700 p-1 block text-center">Cert ID</span>
                        <div 
                          className="absolute bottom-0 right-0 w-3 h-3 bg-purple-500 cursor-se-resize opacity-0 group-hover:opacity-100"
                          onMouseDown={(e) => handleResizeStart(e, 'certificateId')}
                        ></div>
                      </div>
                      

                    </>
                  )}
                </div>
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                  <div className="text-center">
                    <div className="text-4xl mb-2">📄</div>
                    <p>No template uploaded</p>
                    <p className="text-sm">Upload a template above to see preview</p>
                  </div>
                </div>
              )}
              
              {previewMode && settings && (
                <>
                  <div
                    className="absolute text-red-600 font-bold text-xs bg-white px-1 rounded"
                    style={{
                      left: `${(settings.studentNameX / 1123) * 100}%`,
                      top: `${(settings.studentNameY / 794) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    Student Name
                  </div>
                  <div
                    className="absolute text-blue-600 font-bold text-xs bg-white px-1 rounded"
                    style={{
                      left: `${(settings.courseTitleX / 1123) * 100}%`,
                      top: `${(settings.courseTitleY / 794) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    Course Title
                  </div>
                  <div
                    className="absolute text-green-600 font-bold text-xs bg-white px-1 rounded"
                    style={{
                      left: `${(settings.dateX / 1123) * 100}%`,
                      top: `${(settings.dateY / 794) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    Date
                  </div>
                  <div
                    className="absolute text-purple-600 font-bold text-xs bg-white px-1 rounded"
                    style={{
                      left: `${(settings.certificateIdX / 1123) * 100}%`,
                      top: `${(settings.certificateIdY / 794) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    Cert ID
                  </div>
                  <div
                    className="absolute text-orange-600 font-bold text-xs bg-white px-1 rounded"
                    style={{
                      left: `${(settings.instructorNameX / 1123) * 100}%`,
                      top: `${(settings.instructorNameY / 794) * 100}%`,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    Instructor
                  </div>
                </>
              )}
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              {previewMode ? 'Showing text positions' : 'Click Preview Mode to see text positions'}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}