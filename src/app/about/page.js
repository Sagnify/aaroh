"use client"

import { useEffect, useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Users, Music, Award, Heart } from 'lucide-react'

export default function About() {
  const [content, setContent] = useState({})

  useEffect(() => {
    document.title = 'About Us - Aaroh Music Academy'
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/site-content')
      const data = await response.json()
      setContent({
        aboutTitle: data.aboutTitle || "Meet Kashmira Chakraborty",
        aboutDescription: data.aboutDescription || "Kashmira Chakraborty is a passionate music educator and performer with over a decade of experience helping students connect with music in simple, heartfelt ways.",
        aboutSubDescription: data.aboutSubDescription || "Her classes blend practical technique with the joy of musical expression — whether you're starting fresh or rediscovering your voice.",
        aboutImage: data.aboutImage || "",
        aboutExperience: data.aboutExperience || "10+ Years",
        aboutStudents: data.aboutStudents || "500+ Students",
        aboutCourses: data.aboutCourses || "15+ Courses"
      })
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-[#a0303f] mb-6">About Aaroh</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the story behind our passion for music education and meet the instructor who will guide your musical journey.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <div className="relative w-64 h-64 mx-auto mb-8">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] via-[#ffb088] to-[#ffd700] rounded-full animate-pulse shadow-2xl"></div>
              <div className="absolute inset-2 bg-white rounded-full shadow-xl">
                <div className="absolute inset-2 bg-gradient-to-br from-[#ff6b6b]/10 via-[#ffb088]/10 to-[#ffd700]/10 rounded-full">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#ffb088]/20 to-[#ff6b6b]/20 flex items-center justify-center overflow-hidden border-4 border-white/50">
                    {content.aboutImage ? (
                      <img 
                        src={content.aboutImage} 
                        alt="Kashmira Chakraborty" 
                        className="w-full h-full object-cover rounded-full hover:scale-105 transition-all duration-500 filter hover:brightness-110"
                      />
                    ) : (
                      <Users className="w-32 h-32 text-[#a0303f]" />
                    )}
                  </div>
                </div>
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#ffd700] rounded-full shadow-lg flex items-center justify-center">
                <div className="w-3 h-3 bg-white rounded-full"></div>
              </div>
            </div>
          </div>
          
          <div>
            <h2 className="text-3xl font-bold text-[#a0303f] mb-6">{content.aboutTitle}</h2>
            <p className="text-lg text-gray-700 mb-6 leading-relaxed">
              {content.aboutDescription}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {content.aboutSubDescription}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-8 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Award className="w-12 h-12 text-[#ff6b6b] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#a0303f] mb-2">{content.aboutExperience}</h3>
              <p className="text-gray-600">Teaching Experience</p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Users className="w-12 h-12 text-[#ffb088] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#a0303f] mb-2">{content.aboutStudents}</h3>
              <p className="text-gray-600">Happy Students</p>
            </CardContent>
          </Card>

          <Card className="text-center p-8 bg-white/80 backdrop-blur-sm">
            <CardContent className="pt-6">
              <Music className="w-12 h-12 text-[#87a96b] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[#a0303f] mb-2">{content.aboutCourses}</h3>
              <p className="text-gray-600">Courses Created</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-white/80 backdrop-blur-sm p-8">
          <CardContent className="text-center">
            <Heart className="w-16 h-16 text-[#ff6b6b] mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-[#a0303f] mb-4">Our Mission</h3>
            <p className="text-lg text-gray-700 max-w-3xl mx-auto">
              At Aaroh, we believe music is a universal language that brings joy, healing, and connection. 
              Our mission is to make quality music education accessible to everyone, regardless of their 
              background or experience level.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}