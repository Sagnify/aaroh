"use client"

import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Mail, Phone, MapPin, Clock } from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  })
  const [content, setContent] = useState({})

  useEffect(() => {
    document.title = 'Contact Us - Aaroh Music Academy'
    fetchContent()
  }, [])

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/site-content')
      const data = await response.json()
      setContent({
        contactEmail: data.contactEmail || "info@aarohmusic.com",
        contactPhone: data.contactPhone || "+1 (555) 123-4567",
        contactAddress: data.contactAddress || "Online Classes Worldwide",
        contactHours: data.contactHours || "Mon-Sat: 9AM-8PM"
      })
    } catch (error) {
      console.error('Failed to fetch content:', error)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log("Form submitted:", formData)
    // Handle form submission here
    alert("Thank you for your message! We'll get back to you soon.")
    setFormData({ name: "", email: "", message: "" })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const contactInfo = [
    {
      icon: <Mail className="w-6 h-6 text-[#ff6b6b]" />,
      title: "Email",
      details: content.contactEmail || "info@aarohmusic.com"
    },
    {
      icon: <Phone className="w-6 h-6 text-[#e6b800]" />,
      title: "Phone",
      details: content.contactPhone || "+1 (555) 123-4567"
    },
    {
      icon: <MapPin className="w-6 h-6 text-[#87a96b]" />,
      title: "Location",
      details: content.contactAddress || "Online Classes Worldwide"
    },
    {
      icon: <Clock className="w-6 h-6 text-[#ffb088]" />,
      title: "Hours",
      details: content.contactHours || "Mon-Sat: 9AM-8PM"
    }
  ]

  return (
    <div className="min-h-screen py-20 px-4 bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ 
            duration: 0.8,
            type: "spring",
            stiffness: 100
          }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-[#a0303f] mb-6">Get In Touch</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Ready to start your musical journey? Have questions about our courses? 
            We'd love to hear from you and help you find the perfect program.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Card className="bg-white/80 backdrop-blur-sm border-gold/20">
              <CardHeader>
                <CardTitle className="text-2xl text-[#a0303f]">Send us a Message</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      value={formData.message}
                      onChange={handleChange}
                      placeholder="Tell us about your musical interests and goals..."
                      rows={6}
                    />
                  </div>
                  
                  <Button type="submit" className="w-full bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white">
                    Send Message
                  </Button>
                </form>
              </CardContent>
            </Card>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="space-y-8"
          >
            <div>
              <h3 className="text-2xl font-bold text-[#a0303f] mb-6">Contact Information</h3>
              <div className="space-y-6">
                {contactInfo.map((info, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -30, scale: 0.9 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    transition={{ 
                      duration: 0.8, 
                      delay: 0.3 + index * 0.15,
                      type: "spring",
                      stiffness: 100
                    }}
                    className="flex items-center space-x-4"
                  >
                    <div className="flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h4 className="font-semibold text-[#a0303f]">{info.title}</h4>
                      <p className="text-gray-600">{info.details}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <Card className="bg-gradient-to-br from-[#a0303f] to-[#8b2635] text-white">
              <CardContent className="p-8">
                <h4 className="text-xl font-bold mb-4">Why Choose Aaroh?</h4>
                <ul className="space-y-3">
                  <li className="flex items-start space-x-2">
                    <span className="text-[#e6b800]">•</span>
                    <span>Personalized one-on-one instruction</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#e6b800]">•</span>
                    <span>Flexible scheduling to fit your lifestyle</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#e6b800]">•</span>
                    <span>Comprehensive curriculum for all skill levels</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <span className="text-[#e6b800]">•</span>
                    <span>Expert guidance from experienced instructors</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}