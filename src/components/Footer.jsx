"use client"

import Link from "next/link"
import { Facebook, Instagram, Youtube, Mail, Phone, MapPin, Music } from "lucide-react"
import { useEffect, useState } from 'react'

export default function Footer() {
  const [content, setContent] = useState({})
  const [courses, setCourses] = useState([])

  useEffect(() => {
    fetchContent()
    fetchPopularCourses()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/site-content')
      if (response.ok) {
        const data = await response.json()
        setContent(data) // API returns contentMap object directly
      }
    } catch (error) {
      console.error('Failed to fetch footer content:', error)
    }
  }

  const fetchPopularCourses = async () => {
    try {
      const response = await fetch('/api/courses?popular=true')
      if (response.ok) {
        const data = await response.json()
        setCourses(data.slice(0, 4)) // Get top 4 popular courses
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  return (
    <footer className="bg-gradient-to-br from-[#a0303f] to-[#8b2635] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="md:col-span-1">
            <div className="flex items-center mb-4">
              <Music className="w-8 h-8 text-[#e6b800] mr-2" />
              <h3 className="text-3xl font-bold">Aaroh</h3>
            </div>
            <p className="text-[#fdf6e3]/80 mb-6 leading-relaxed">
              {content.footerDescription || content.aboutDescription || 'Discover the joy of music with personalized courses and expert guidance from Kashmira Chakraborty.'}
            </p>
            <div className="flex space-x-4">
              <a href="#" aria-label="Follow us on Facebook" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#fdf6e3] hover:bg-[#ff6b6b] hover:text-white transition-all duration-300">
                <Facebook size={20} />
              </a>
              <a href="#" aria-label="Follow us on Instagram" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#fdf6e3] hover:bg-[#ff6b6b] hover:text-white transition-all duration-300">
                <Instagram size={20} />
              </a>
              <a href="#" aria-label="Subscribe to our YouTube channel" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#fdf6e3] hover:bg-[#ff6b6b] hover:text-white transition-all duration-300">
                <Youtube size={20} />
              </a>
              <a href={`mailto:${content.contactEmail || 'info@aaroh.com'}`} aria-label="Email us" className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-[#fdf6e3] hover:bg-[#ff6b6b] hover:text-white transition-all duration-300">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-[#e6b800]">Quick Links</h4>
            <div className="space-y-3">
              <Link href="/" className="block text-[#fdf6e3]/80 hover:text-[#ff6b6b] transition-colors duration-300">
                Home
              </Link>
              <Link href="/courses" className="block text-[#fdf6e3]/80 hover:text-[#ff6b6b] transition-colors duration-300">
                All Courses
              </Link>
              <Link href="/about" className="block text-[#fdf6e3]/80 hover:text-[#ff6b6b] transition-colors duration-300">
                About Kashmira
              </Link>
              <Link href="/contact" className="block text-[#fdf6e3]/80 hover:text-[#ff6b6b] transition-colors duration-300">
                Contact Us
              </Link>
            </div>
          </div>

          {/* Popular Courses */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-[#e6b800]">Popular Courses</h4>
            <div className="space-y-3">
              {courses.length > 0 ? (
                courses.map((course) => (
                  <Link 
                    key={course.id} 
                    href={`/courses/${course.id}`} 
                    className="block text-[#fdf6e3]/80 hover:text-[#ff6b6b] transition-colors duration-300 truncate"
                  >
                    {course.title}
                  </Link>
                ))
              ) : (
                <div className="space-y-3">
                  <div className="block text-[#fdf6e3]/60">Loading courses...</div>
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-xl font-semibold mb-6 text-[#e6b800]">Get In Touch</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-[#ff6b6b] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#fdf6e3]/80">{content.contactEmail || 'info@aarohmusic.com'}</p>
                  <p className="text-[#fdf6e3]/60 text-sm">General inquiries</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-[#ff6b6b] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#fdf6e3]/80">{content.contactPhone || '+91 98765 43210'}</p>
                  <p className="text-[#fdf6e3]/60 text-sm">Course support</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-[#ff6b6b] mt-1 flex-shrink-0" />
                <div>
                  <p className="text-[#fdf6e3]/80">{content.contactAddress || 'Mumbai, Maharashtra, India'}</p>
                  <p className="text-[#fdf6e3]/60 text-sm">{content.contactHours || 'Mon - Sat: 9:00 AM - 8:00 PM'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-white/20 mt-12 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-[#fdf6e3]/60 text-sm">
              &copy; {content.footerCopyright || '2025 Aaroh Music Academy by Kashmira Chakraborty. All rights reserved.'}
            </p>
            <div className="flex space-x-6 text-sm">
              <Link href="/privacy-policy" className="text-[#fdf6e3]/60 hover:text-[#ff6b6b] transition-colors">
                Privacy Policy
              </Link>
              <Link href="/terms" className="text-[#fdf6e3]/60 hover:text-[#ff6b6b] transition-colors">
                Terms of Service
              </Link>
              <Link href="/refund-policy" className="text-[#fdf6e3]/60 hover:text-[#ff6b6b] transition-colors">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}