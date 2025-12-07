"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Music, Mic, Piano, BookOpen, Users, Heart, Star, Play, Calendar } from "lucide-react"
import { useEffect, useState } from "react"
import { OrganizationSchema } from "@/components/StructuredData"

export default function Home() {
  const { data: session } = useSession()
  const router = useRouter()
  const [isClient, setIsClient] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [courses, setCourses] = useState([])
  const [content, setContent] = useState({
    heroTitle: "Discover the Joy of Music",
    heroSubtitle: "Learn, Play, and Grow with Aaroh",
    heroDescription: "Structured courses and live sessions guided by Kashmira — designed for singers, learners, and dreamers of all ages.",
    aboutTitle: "Meet Kashmira Chakraborty",
    aboutDescription: "Kashmira Chakraborty is a passionate music educator and performer with over a decade of experience helping students connect with music in simple, heartfelt ways.",
    aboutSubDescription: "Her classes blend practical technique with the joy of musical expression — whether you're starting fresh or rediscovering your voice.",
    aboutImage: "",
    privateSessionPrice: 999,
    groupSessionPrice: 399
  })
  const [contentLoaded, setContentLoaded] = useState(false)

  useEffect(() => {
    document.title = 'Aaroh Music Academy - Learn Music Online'
    
    // Update meta description
    let metaDesc = document.querySelector('meta[name="description"]')
    if (!metaDesc) {
      metaDesc = document.createElement('meta')
      metaDesc.name = 'description'
      document.head.appendChild(metaDesc)
    }
    metaDesc.content = 'Learn music online with Aaroh Music Academy. Expert-led courses in vocals, keyboard, and music theory. Join live classes or learn at your own pace with Kashmira Chakraborty. Enroll today!'
    
    // Update OG tags
    let ogTitle = document.querySelector('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.content = 'Aaroh Music Academy - Learn Music Online'
    
    let ogDesc = document.querySelector('meta[property="og:description"]')
    if (!ogDesc) {
      ogDesc = document.createElement('meta')
      ogDesc.setAttribute('property', 'og:description')
      document.head.appendChild(ogDesc)
    }
    ogDesc.content = 'Discover the joy of music with structured courses and live sessions guided by Kashmira Chakraborty. Designed for singers, learners, and dreamers of all ages.'
    
    let ogImage = document.querySelector('meta[property="og:image"]')
    if (!ogImage) {
      ogImage = document.createElement('meta')
      ogImage.setAttribute('property', 'og:image')
      document.head.appendChild(ogImage)
    }
    ogImage.content = '/logos/logo_dark.png'
    
    setIsClient(true)
    fetchCourses()
    fetchContent()
    
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/courses?popular=true')
      const data = await response.json()
      if (Array.isArray(data)) {
        setCourses(data.slice(0, 3)) // Show only first 3 popular courses
      } else {
        setCourses([])
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    }
  }

  const fetchContent = async () => {
    try {
      const response = await fetch('/api/site-content')
      if (!response.ok) {
        console.warn('Site content API returned error, using defaults')
        setContentLoaded(true)
        return
      }
      const data = await response.json()
      setContent(prev => ({
        ...prev,
        heroTitle: data.heroTitle || prev.heroTitle,
        heroSubtitle: data.heroSubtitle || prev.heroSubtitle,
        heroDescription: data.heroDescription || prev.heroDescription,
        aboutTitle: data.aboutTitle || prev.aboutTitle,
        aboutDescription: data.aboutDescription || prev.aboutDescription,
        aboutSubDescription: data.aboutSubDescription || prev.aboutSubDescription,
        aboutImage: data.aboutImage || prev.aboutImage,
        privateSessionPrice: parseInt(data.privateSessionPrice) || prev.privateSessionPrice,
        groupSessionPrice: parseInt(data.groupSessionPrice) || prev.groupSessionPrice
      }))
      setContentLoaded(true)
    } catch (error) {
      console.warn('Failed to fetch content, using defaults:', error.message)
      setContentLoaded(true)
    }
  }

  const getIconForCourse = (index) => {
    const icons = [
      <Mic className="w-12 h-12 text-[#ff6b6b]" />,
      <Music className="w-12 h-12 text-gray-600" />,
      <Piano className="w-12 h-12 text-[#87a96b]" />
    ]
    return icons[index % icons.length]
  }

  const getThumbnailForCourse = (index) => {
    const thumbnails = [
      "bg-gradient-to-br from-[#ff6b6b]/20 to-[#ffb088]/20",
      "bg-gradient-to-br from-gray-100 to-gray-200",
      "bg-gradient-to-br from-[#87a96b]/20 to-[#a0303f]/20"
    ]
    return thumbnails[index % thumbnails.length]
  }

  const categories = [
    {
      icon: <Mic className="w-8 h-8 text-[#ff6b6b]" />,
      title: "Vocal Courses",
      tagline: "Learn pitch, tone, and expression",
      color: "coral"
    },
    {
      icon: <Piano className="w-8 h-8 text-gray-600" />,
      title: "Keyboard & Instrumentals",
      tagline: "Play melodies with rhythm and flow",
      color: "gold"
    },
    {
      icon: <BookOpen className="w-8 h-8 text-[#87a96b]" />,
      title: "Theory & Practice",
      tagline: "Build understanding and confidence",
      color: "sage"
    }
  ]

  const whyChoose = [
    {
      icon: <Users className="w-6 h-6 text-[#ff6b6b]" />,
      title: "Personalized Learning",
      description: "Tailored to your pace and style"
    },
    {
      icon: <Heart className="w-6 h-6 text-[#ffb088]" />,
      title: "Friendly Mentorship",
      description: "Supportive guidance every step"
    },
    {
      icon: <Play className="w-6 h-6 text-gray-600" />,
      title: "Live & Recorded Sessions",
      description: "Learn when it works for you"
    },
    {
      icon: <Star className="w-6 h-6 text-[#87a96b]" />,
      title: "Progress Tracking",
      description: "See your musical growth"
    }
  ]

  const handleClassBooking = (classType) => {
    if (!session) {
      router.push('/login')
      return
    }
    router.push(`/book-class?type=${classType}`)
  }

  return (
    <>
    <OrganizationSchema />
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden bg-gradient-to-br from-[#a0303f] via-[#8b2635] to-[#ff6b6b]">
        {/* Musical notation elements radiating from semi-circle in all directions */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {isClient && Array.from({ length: 30 }, (_, i) => {
            // Musical notation symbols
            const symbols = ['♪', '♫', '♬', '♭', '♮', '♯', '𝄞', '𝄟', '𝄠', '𝄡'];
            const symbol = symbols[i % symbols.length];
            
            // Full 360-degree distribution from sun center
            const angle = (i / 30) * 2 * Math.PI + (i % 3 - 1) * 0.1;
            
            // Start from sun edge (semi-circle is 600px wide, 300px tall)
            const sunRadius = 300; // Half of 600px width
            const startX = Math.cos(angle) * sunRadius;
            const startY = Math.abs(Math.sin(angle)) * 150 + 150; // Only upper half for semi-circle
            
            // End positions radiating outward in all directions
            const endRadius = 600 + (i % 5) * 80;
            const endX = Math.cos(angle) * endRadius;
            const endY = Math.sin(angle) * endRadius + 150;
            
            return (
              <motion.div
                key={i}
                className="absolute bottom-0 left-1/2 text-2xl font-bold z-5"
                initial={{ 
                  x: startX, 
                  y: startY,
                  opacity: 0,
                  scale: 0.4,
                  color: '#9ca3af' // Start with gray color
                }}
                animate={{
                  x: endX,
                  y: endY,
                  opacity: [0, 1, 0.7, 0.3, 0], // Gradual fade
                  rotate: [0, 180],
                  scale: [0.4, 1.3, 1, 0.6, 0.2],
                  color: ['#9ca3af', '#d1d5db', '#f3f4f6', '#f9fafb'] // Gray to light gray
                }}
                transition={{
                  duration: 8 + (i % 4) * 1.5, // Faster animation
                  repeat: Infinity,
                  delay: i * 0.1, // Minimal delay for immediate start
                  ease: "easeOut"
                }}
              >
                {symbol}
              </motion.div>
            );
          })}
        </div>
        
        {/* Semi-circular sun at bottom */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10">
          <div className="w-[600px] h-[300px] bg-gradient-to-t from-[#ff6b6b] via-[#ffb088] to-[#ffd700] rounded-t-full"></div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-30 text-center max-w-5xl mx-auto text-white"
        >
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="mx-auto mb-8 flex items-center justify-center"
          >
            <img 
              src="/logos/logo_light.png"
              alt="Aaroh"
              className="h-24 w-auto drop-shadow-2xl"
            />
          </motion.div>
          
          <div>
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              {content.heroTitle}
            </h1>
            <p className="text-xl md:text-2xl text-white mb-6 font-medium drop-shadow">
              {content.heroSubtitle}
            </p>
            <p className="text-lg text-white/90 mb-8 max-w-3xl mx-auto leading-relaxed drop-shadow">
              {content.heroDescription}
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center relative z-40">
              <button
                onClick={() => document.getElementById('popular-courses')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-4 bg-white text-[#a0303f] hover:bg-gray-100 rounded-md font-semibold transition-colors cursor-pointer"
              >
                Explore Courses
              </button>
              <button
                onClick={() => document.getElementById('live-classes')?.scrollIntoView({ behavior: 'smooth' })}
                className="text-lg px-8 py-4 border-2 border-white text-white hover:bg-white/20 rounded-md font-semibold transition-colors cursor-pointer"
              >
                Join a Live Class
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Rest of the page with different background */}
      <div className="bg-gradient-to-br from-[#fdf6e3] via-[#f7f0e8] to-[#ffb088]/10">
        {/* About Kashmira */}
        <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="flex flex-col md:flex-row items-center gap-8 bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg"
          >
            <div className="relative w-32 h-32 flex-shrink-0">
              <div className="absolute inset-0 bg-gradient-to-br from-[#ff6b6b] via-[#ffb088] to-[#ffd700] rounded-full animate-pulse"></div>
              <div className="absolute inset-1 bg-white rounded-full shadow-lg">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-[#ffb088]/40 to-[#ff6b6b]/40 flex items-center justify-center overflow-hidden">
                  {content.aboutImage ? (
                    <img 
                      src={content.aboutImage} 
                      alt="Kashmira Chakraborty" 
                      className="w-full h-full object-cover rounded-full hover:scale-110 transition-transform duration-300"
                      onError={(e) => console.log('Image load error:', e.target.src)}
                    />
                  ) : (
                    <Users className="w-16 h-16 text-[#a0303f]" />
                  )}
                </div>
              </div>
            </div>
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold text-[#a0303f] mb-4">{content.aboutTitle}</h3>
              <p className="text-lg text-gray-700 mb-4 leading-relaxed">
                {content.aboutDescription}
              </p>
              <p className="text-gray-600">
                {content.aboutSubDescription}
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Popular Courses Carousel */}
      <section id="popular-courses" className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#a0303f] mb-4">Popular Courses</h2>
            <p className="text-xl text-gray-600">Start your musical journey with our most loved programs</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {courses.map((course, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
              >
                <Card className="h-full bg-white border-0 shadow-lg hover:shadow-xl transition-all overflow-hidden">
                  <div className={`h-48 ${course.thumbnail ? '' : getThumbnailForCourse(index)} flex items-center justify-center relative overflow-hidden`}>
                    {course.thumbnail ? (
                      <img 
                        src={course.thumbnail} 
                        alt={course.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      getIconForCourse(index)
                    )}
                  </div>
                  <CardHeader className="text-center">
                    <CardTitle className="text-xl text-[#a0303f]">{course.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-center">
                    <p className="text-gray-600 mb-4">{course.subtitle || `${course.duration} · ${course.lessons} lessons · ${course.level}`}</p>
                    <p className="text-2xl font-bold text-gray-700 mb-6">₹{course.price.toLocaleString()}</p>
                    <Link href={`/courses/${course.id}`}>
                      <Button className="w-full bg-[#ff6b6b] hover:bg-[#ff6b6b]/90 text-white">
                        Buy Course
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
          
          <div className="text-center mt-12 relative z-50">
            <Link href="/courses">
              <button className="inline-flex items-center justify-center h-11 px-8 py-3 bg-[#ff6b6b] hover:bg-[#e55a5a] text-white font-semibold rounded-md cursor-pointer pointer-events-auto relative z-50 transition-none">
                Explore All Courses
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Course Categories */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#a0303f] mb-4">Course Categories</h2>
            <p className="text-xl text-gray-600">Find exactly what you're looking for</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="text-center p-8 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                  <CardContent className="pt-6">
                    <div className="flex justify-center mb-4">
                      {category.icon}
                    </div>
                    <h3 className="text-xl font-semibold text-[#a0303f] mb-3">
                      {category.title}
                    </h3>
                    <p className="text-gray-600">
                      {category.tagline}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>


        </div>
      </section>

      {/* Live Classes Section */}
      <section id="live-classes" className="py-16 px-4 bg-white relative z-20">
        <div className="max-w-6xl mx-auto relative z-30">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#a0303f] mb-4">Live Classes</h2>
            <p className="text-xl text-gray-600">Choose your preferred learning format</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* One-on-One Classes */}
            <Card className="bg-white border shadow-lg hover:shadow-2xl transition-shadow relative z-40">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-[#a0303f]">1-on-1 Private Sessions</CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-50">
                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-700 mb-2">₹{content.privateSessionPrice}/session</p>
                  <p className="text-gray-600">60 minutes of personalized attention</p>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Customized curriculum</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Flexible scheduling</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Instant feedback</span>
                  </li>
                </ul>
                <Button 
                  className="w-full !bg-gray-700 hover:!bg-gray-800 text-white relative z-50 pointer-events-auto !opacity-100"
                  onClick={() => handleClassBooking('PRIVATE')}
                >
                  Book Private Session
                </Button>
              </CardContent>
            </Card>

            {/* Group Classes */}
            <Card className="bg-white border shadow-lg hover:shadow-2xl transition-shadow relative z-40">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <CardTitle className="text-2xl text-[#a0303f]">Group Classes</CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-50">
                <div className="mb-6">
                  <p className="text-3xl font-bold text-gray-700 mb-2">₹{content.groupSessionPrice}/session</p>
                  <p className="text-gray-600">90 minutes with 4-6 students</p>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Interactive learning</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Peer motivation</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Cost-effective</span>
                  </li>
                </ul>
                <Button 
                  className="w-full !bg-gray-700 hover:!bg-gray-800 text-white relative z-50 pointer-events-auto !opacity-100"
                  onClick={() => handleClassBooking('GROUP')}
                >
                  Join Group Class
                </Button>
              </CardContent>
            </Card>

            {/* Offline Classes */}
            <Card className="bg-white border shadow-lg hover:shadow-2xl transition-shadow relative z-40">
              <CardHeader className="text-center">
                <Users className="w-12 h-12 text-[#87a96b] mx-auto mb-4" />
                <CardTitle className="text-2xl text-[#a0303f]">Offline Classes</CardTitle>
              </CardHeader>
              <CardContent className="text-center relative z-50">
                <div className="mb-6">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Available in Kolkata</p>
                  <p className="text-gray-600">In-person sessions with Kashmira</p>
                </div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Face-to-face guidance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Focused Attention</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-gray-500" />
                    <span>Hands-on learning</span>
                  </li>
                </ul>
                <Button 
                  className="w-full !bg-[#87a96b] hover:!bg-[#7a9560] text-white relative z-50 pointer-events-auto !opacity-100"
                  onClick={() => handleClassBooking('OFFLINE')}
                >
                  Book Offline Session
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-8">
            <p className="text-gray-600 mb-4">Next sessions available this weekend</p>
            <div className="flex justify-center gap-4 text-sm">
              <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">Sat 3 PM IST</span>
              <span className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">Sun 11 AM IST</span>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose Aaroh */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-[#a0303f] mb-4">Why Choose Aaroh?</h2>
            <p className="text-xl text-gray-600">Experience music education that feels personal and inspiring</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {whyChoose.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.15,
                  type: "spring",
                  stiffness: 100
                }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.02 }}
              >
                <Card className="h-full text-center p-6 bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="pt-6 h-full flex flex-col">
                    <div className="flex justify-center mb-4">
                      {feature.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-[#a0303f] mb-3">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600 text-sm flex-grow">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      </div>
    </div>
    </>
  )
}