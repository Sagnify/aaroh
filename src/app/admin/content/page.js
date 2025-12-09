"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Settings, Save } from 'lucide-react'
import ImageUpload from '@/components/ImageUpload'
import { FormSkeleton } from '@/components/AdminSkeleton'

export default function ContentManagement() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [content, setContent] = useState({})
  const [loading, setLoading] = useState(false)
  const [fetchingContent, setFetchingContent] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
    fetchContent()
  }, [session, status, router])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/site-content')
      const data = await response.json()
      setContent({
        heroTitle: data.heroTitle || "Discover the Joy of Music",
        heroSubtitle: data.heroSubtitle || "Learn, Play, and Grow with Aaroh",
        heroDescription: data.heroDescription || "Structured courses and live sessions guided by Kashmira — designed for singers, learners, and dreamers of all ages.",
        aboutTitle: data.aboutTitle || "Meet Kashmira Chakraborty",
        aboutDescription: data.aboutDescription || "Kashmira Chakraborty is a passionate music educator and performer with over a decade of experience helping students connect with music in simple, heartfelt ways.",
        aboutSubDescription: data.aboutSubDescription || "Her classes blend practical technique with the joy of musical expression — whether you're starting fresh or rediscovering your voice.",
        aboutExperience: data.aboutExperience || "10+ Years",
        aboutStudents: data.aboutStudents || "500+ Students",
        aboutCourses: data.aboutCourses || "15+ Courses",
        aboutImage: data.aboutImage || "",
        privateSessionPrice: data.privateSessionPrice || "999",
        groupSessionPrice: data.groupSessionPrice || "399",
        contactEmail: data.contactEmail || "info@aarohmusic.com",
        contactPhone: data.contactPhone || "+1 (555) 123-4567",
        contactAddress: data.contactAddress || "Online Classes Worldwide",
        contactHours: data.contactHours || "Mon-Sat: 9AM-8PM",
        categoryTitle1: data.categoryTitle1 || "Vocal Courses",
        categoryTagline1: data.categoryTagline1 || "Learn pitch, tone, and expression",
        categoryTitle2: data.categoryTitle2 || "Keyboard & Instrumentals",
        categoryTagline2: data.categoryTagline2 || "Play melodies with rhythm and flow",
        categoryTitle3: data.categoryTitle3 || "Theory & Practice",
        categoryTagline3: data.categoryTagline3 || "Build understanding and confidence",
        featureTitle1: data.featureTitle1 || "Personalized Learning",
        featureDesc1: data.featureDesc1 || "Tailored to your pace and style",
        featureTitle2: data.featureTitle2 || "Friendly Mentorship",
        featureDesc2: data.featureDesc2 || "Supportive guidance every step",
        featureTitle3: data.featureTitle3 || "Live & Recorded Sessions",
        featureDesc3: data.featureDesc3 || "Learn when it works for you",
        featureTitle4: data.featureTitle4 || "Progress Tracking",
        featureDesc4: data.featureDesc4 || "See your musical growth",
        scheduleText: data.scheduleText || "Next sessions available this weekend",
        scheduleSlot1: data.scheduleSlot1 || "Sat 3 PM IST",
        scheduleSlot2: data.scheduleSlot2 || "Sun 11 AM IST"
      })
    } catch (error) {
      console.error('Failed to fetch content:', error)
    } finally {
      setFetchingContent(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const promises = Object.entries(content).map(([key, value]) => 
        fetch('/api/site-content', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key, value: String(value) })
        })
      )
      
      await Promise.all(promises)
      alert('Content saved successfully!')
    } catch (error) {
      alert('Error saving content')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (field, value) => {
    setContent(prev => ({ ...prev, [field]: value }))
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="relative">
          <div className="w-16 h-16 bg-[#a0303f] rounded-full flex items-center justify-center mx-auto animate-pulse">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-[#ff6b6b] border-t-transparent rounded-full animate-spin mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!session || session.user.role !== 'ADMIN') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <div className="max-w-4xl mx-auto px-0 md:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Content Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage homepage content and settings</p>
        </div>

        <div className="space-y-6">
          {fetchingContent ? (
            <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
              <CardContent className="p-6"><FormSkeleton /></CardContent>
            </Card>
          ) : (
          <>
          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b dark:border-zinc-800">
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Hero Section
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Hero Title</label>
                <Input
                  value={content.heroTitle}
                  onChange={(e) => handleChange('heroTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Hero Subtitle</label>
                <Input
                  value={content.heroSubtitle}
                  onChange={(e) => handleChange('heroSubtitle', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Hero Description</label>
                <Textarea
                  value={content.heroDescription}
                  onChange={(e) => handleChange('heroDescription', e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b dark:border-zinc-800">
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium flex items-center gap-2">
                <Settings className="w-5 h-5" />
                About Section
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">About Title</label>
                <Input
                  value={content.aboutTitle}
                  onChange={(e) => handleChange('aboutTitle', e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">About Description</label>
                <Textarea
                  value={content.aboutDescription}
                  onChange={(e) => handleChange('aboutDescription', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">About Sub Description</label>
                <Textarea
                  value={content.aboutSubDescription}
                  onChange={(e) => handleChange('aboutSubDescription', e.target.value)}
                  rows={2}
                />
              </div>
              <div>
                <ImageUpload
                  currentImage={content.aboutImage}
                  onImageUpload={(url) => handleChange('aboutImage', url)}
                  label="Kashmira's Photo"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Experience</label>
                  <Input
                    value={content.aboutExperience}
                    onChange={(e) => handleChange('aboutExperience', e.target.value)}
                    placeholder="10+ Years"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Students</label>
                  <Input
                    value={content.aboutStudents}
                    onChange={(e) => handleChange('aboutStudents', e.target.value)}
                    placeholder="500+ Students"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Courses</label>
                  <Input
                    value={content.aboutCourses}
                    onChange={(e) => handleChange('aboutCourses', e.target.value)}
                    placeholder="15+ Courses"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b dark:border-zinc-800">
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium">Contact Information</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Contact Email</label>
                  <Input
                    value={content.contactEmail}
                    onChange={(e) => handleChange('contactEmail', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Contact Phone</label>
                  <Input
                    value={content.contactPhone}
                    onChange={(e) => handleChange('contactPhone', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Address</label>
                  <Input
                    value={content.contactAddress}
                    onChange={(e) => handleChange('contactAddress', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Business Hours</label>
                  <Input
                    value={content.contactHours}
                    onChange={(e) => handleChange('contactHours', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm">
            <CardHeader className="border-b dark:border-zinc-800">
              <CardTitle className="text-gray-900 dark:text-white text-lg font-medium">Live Classes Pricing</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Private Session Price (₹)</label>
                  <Input
                    type="number"
                    value={content.privateSessionPrice}
                    onChange={(e) => handleChange('privateSessionPrice', parseInt(e.target.value))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-3 dark:text-white text-gray-700">Group Session Price (₹)</label>
                  <Input
                    type="number"
                    value={content.groupSessionPrice}
                    onChange={(e) => handleChange('groupSessionPrice', parseInt(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={loading}
              className="bg-gray-900 hover:bg-gray-800 text-white"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
          </>
          )}
        </div>
      </div>
    </div>
  )
}
