const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 12)
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@aaroh.com' },
    update: {},
    create: {
      email: 'admin@aaroh.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'ADMIN'
    }
  })

  // Create demo user
  const demoUserPassword = await bcrypt.hash('demo123', 12)
  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@aaroh.com' },
    update: {},
    create: {
      email: 'demo@aaroh.com',
      password: demoUserPassword,
      name: 'Demo User',
      role: 'USER'
    }
  })

  // Create courses with curriculum
  const course1 = await prisma.course.create({
    data: {
      title: 'Beginner Vocal Training',
      subtitle: 'Master the fundamentals of singing',
      description: 'Learn proper breathing techniques, vocal warm-ups, and basic singing skills. Perfect for complete beginners who want to start their musical journey.',
      price: 2999,
      originalPrice: 4999,
      duration: '0m',
      lessons: 0,
      level: 'Beginner',
      language: 'Hindi/English',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rating: 4.8,
      students: 156,
      featured: true,
      whatYouLearn: [
        'Proper breathing techniques for singing',
        'Vocal warm-up exercises',
        'Basic pitch and rhythm training',
        'Simple song performance skills'
      ],
      requirements: [
        'No prior singing experience required',
        'Willingness to practice regularly',
        'Basic understanding of music (helpful but not required)'
      ],
      curriculum: {
        create: [
          {
            title: 'Introduction to Singing',
            lessons: 0,
            duration: '0m',
            order: 0,
            videos: {
              create: [
                {
                  title: 'Welcome to Vocal Training',
                  description: 'Introduction to the course and what you will learn',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: '15:30',
                  order: 0
                },
                {
                  title: 'Understanding Your Voice',
                  description: 'Learn about vocal anatomy and how your voice works',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: '22:45',
                  order: 1
                }
              ]
            }
          },
          {
            title: 'Breathing Techniques',
            lessons: 0,
            duration: '0m',
            order: 1,
            videos: {
              create: [
                {
                  title: 'Diaphragmatic Breathing',
                  description: 'Master the foundation of good singing',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: '25:15',
                  order: 0
                }
              ]
            }
          }
        ]
      }
    }
  })

  const course2 = await prisma.course.create({
    data: {
      title: 'Piano Fundamentals',
      subtitle: 'Learn to play piano from scratch',
      description: 'Complete piano course covering basic techniques, music theory, and popular songs. Suitable for absolute beginners.',
      price: 3999,
      originalPrice: 5999,
      duration: '0m',
      lessons: 0,
      level: 'Beginner',
      language: 'Hindi/English',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rating: 4.9,
      students: 203,
      featured: true,
      whatYouLearn: [
        'Basic piano techniques and posture',
        'Reading sheet music and notation',
        'Playing popular songs and melodies',
        'Understanding music theory basics'
      ],
      requirements: [
        'Access to a piano or keyboard',
        'No prior musical experience needed',
        'Dedication to practice regularly'
      ],
      curriculum: {
        create: [
          {
            title: 'Getting Started',
            lessons: 0,
            duration: '0m',
            order: 0,
            videos: {
              create: [
                {
                  title: 'Piano Basics and Setup',
                  description: 'Learn about the piano and proper sitting posture',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: '18:30',
                  order: 0
                }
              ]
            }
          }
        ]
      }
    }
  })

  const course3 = await prisma.course.create({
    data: {
      title: 'Advanced Vocal Techniques',
      subtitle: 'Take your singing to the next level',
      description: 'Advanced course for experienced singers focusing on complex techniques, performance skills, and professional development.',
      price: 4999,
      originalPrice: 7999,
      duration: '0m',
      lessons: 0,
      level: 'Advanced',
      language: 'Hindi/English',
      trailerUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      rating: 4.7,
      students: 89,
      featured: false,
      whatYouLearn: [
        'Advanced vocal techniques and runs',
        'Performance and stage presence',
        'Recording and studio techniques',
        'Professional singing career guidance'
      ],
      requirements: [
        'Previous singing experience required',
        'Completion of basic vocal training',
        'Ability to read basic music notation'
      ],
      curriculum: {
        create: [
          {
            title: 'Advanced Techniques',
            lessons: 0,
            duration: '0m',
            order: 0,
            videos: {
              create: [
                {
                  title: 'Vocal Runs and Riffs',
                  description: 'Master complex vocal embellishments',
                  youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
                  duration: '28:45',
                  order: 0
                }
              ]
            }
          }
        ]
      }
    }
  })

  // Create a purchase for demo user
  await prisma.purchase.create({
    data: {
      userId: demoUser.id,
      courseId: course1.id,
      amount: 2999,
      status: 'completed'
    }
  })

  // Seed site content
  const siteContentData = [
    { key: 'heroTitle', value: 'Discover the Joy of Music' },
    { key: 'heroSubtitle', value: 'Learn, Play, and Grow with Aaroh' },
    { key: 'heroDescription', value: 'Structured courses and live sessions guided by Kashmira — designed for singers, learners, and dreamers of all ages.' },
    { key: 'aboutTitle', value: 'Meet Kashmira Chakraborty' },
    { key: 'aboutDescription', value: 'Kashmira Chakraborty is a passionate music educator and performer with over a decade of experience helping students connect with music in simple, heartfelt ways.' },
    { key: 'aboutSubDescription', value: 'Her classes blend practical technique with the joy of musical expression — whether you\'re starting fresh or rediscovering your voice.' },
    { key: 'aboutExperience', value: '10+ Years' },
    { key: 'aboutStudents', value: '500+ Students' },
    { key: 'aboutCourses', value: '15+ Courses' },
    { key: 'privateSessionPrice', value: '999' },
    { key: 'groupSessionPrice', value: '399' },
    { key: 'contactEmail', value: 'info@aarohmusic.com' },
    { key: 'contactPhone', value: '+91 98765 43210' },
    { key: 'contactAddress', value: 'Mumbai, Maharashtra, India' },
    { key: 'contactHours', value: 'Mon - Sat: 9:00 AM - 8:00 PM' },
    { key: 'categoryTitle1', value: 'Vocal Courses' },
    { key: 'categoryTagline1', value: 'Learn pitch, tone, and expression' },
    { key: 'categoryTitle2', value: 'Keyboard & Instrumentals' },
    { key: 'categoryTagline2', value: 'Play melodies with rhythm and flow' },
    { key: 'categoryTitle3', value: 'Theory & Practice' },
    { key: 'categoryTagline3', value: 'Build understanding and confidence' },
    { key: 'featureTitle1', value: 'Personalized Learning' },
    { key: 'featureDesc1', value: 'Tailored to your pace and style' },
    { key: 'featureTitle2', value: 'Friendly Mentorship' },
    { key: 'featureDesc2', value: 'Supportive guidance every step' },
    { key: 'featureTitle3', value: 'Live & Recorded Sessions' },
    { key: 'featureDesc3', value: 'Learn when it works for you' },
    { key: 'featureTitle4', value: 'Progress Tracking' },
    { key: 'featureDesc4', value: 'See your musical growth' },
    { key: 'scheduleText', value: 'Next sessions available this weekend' },
    { key: 'scheduleSlot1', value: 'Sat 3 PM IST' },
    { key: 'scheduleSlot2', value: 'Sun 11 AM IST' },
    { key: 'footerDescription', value: 'Discover the joy of music with personalized courses and expert guidance from Kashmira Chakraborty.' },
    { key: 'socialFacebook', value: '#' },
    { key: 'socialInstagram', value: '#' },
    { key: 'socialYoutube', value: '#' },
    { key: 'footerCopyright', value: '2025 Aaroh Music Academy by Kashmira Chakraborty. All rights reserved.' },
    { key: 'contactEmailLabel', value: 'General inquiries' },
    { key: 'contactPhoneLabel', value: 'Course support' },
    { key: 'contactAddressLabel', value: 'Worldwide access' }
  ]

  for (const content of siteContentData) {
    await prisma.siteContent.upsert({
      where: { key: content.key },
      update: { value: content.value },
      create: content
    })
  }

  console.log('Database seeded successfully!')
  console.log('Admin user: admin@aaroh.com / admin123')
  console.log('Demo user: demo@aaroh.com / demo123')
  console.log(`Created ${3} courses with curriculum`)
  console.log('Site content populated with default values')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })