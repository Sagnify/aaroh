import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { enrichCourseWithStats } from '@/lib/course-utils'
import { handleApiError } from '@/lib/api-utils'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const popular = searchParams.get('popular')
    
    const whereClause = { published: true }
    if (popular === 'true') {
      whereClause.popular = true
    }
    
    const courses = await prisma.course.findMany({
      where: whereClause,
      select: {
        id: true,
        title: true,
        subtitle: true,
        description: true,
        price: true,
        originalPrice: true,
        duration: true,
        lessons: true,
        level: true,
        thumbnail: true,
        _count: {
          select: {
            purchases: true,
            reviews: true
          }
        },
        reviews: {
          select: {
            rating: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const coursesWithStats = courses.map(course => {
      const avgRating = course.reviews.length > 0
        ? (course.reviews.reduce((sum, r) => sum + r.rating, 0) / course.reviews.length).toFixed(1)
        : 0
      const { reviews, _count, ...courseData } = course
      return {
        ...courseData,
        rating: parseFloat(avgRating),
        ratingCount: _count.reviews,
        students: _count.purchases
      }
    })

    return NextResponse.json(coursesWithStats, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Courses API Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch courses', details: error.message, stack: error.stack },
      { status: 500 }
    )
  }
}

const fetchYouTubeDuration = async (url) => {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/youtube/duration`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    })
    if (response.ok) {
      const data = await response.json()
      return { duration: data.duration, seconds: data.seconds }
    }
  } catch (error) {
    console.error('Error fetching duration:', error)
  }
  return { duration: '0:00', seconds: 0 }
}

const calculateCourseDuration = (curriculum) => {
  let totalSeconds = 0
  let totalLessons = 0
  
  curriculum.forEach(section => {
    if (section.videos) {
      section.videos.forEach(video => {
        totalSeconds += video.durationSeconds || 0
        totalLessons++
      })
    }
  })
  
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  
  return {
    duration: hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`,
    lessons: totalLessons
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    // Auto-fetch durations for all videos
    const curriculumWithDurations = await Promise.all(
      (data.curriculum || []).map(async (section, sectionIndex) => {
        const videosWithDurations = await Promise.all(
          (section.videos || []).map(async (video, videoIndex) => {
            const { duration, seconds } = await fetchYouTubeDuration(video.youtubeUrl)
            return {
              ...video,
              duration,
              durationSeconds: seconds,
              order: videoIndex
            }
          })
        )
        
        const sectionTotalSeconds = videosWithDurations.reduce((sum, v) => sum + (v.durationSeconds || 0), 0)
        const sectionHours = Math.floor(sectionTotalSeconds / 3600)
        const sectionMinutes = Math.floor((sectionTotalSeconds % 3600) / 60)
        
        return {
          ...section,
          videos: videosWithDurations,
          lessons: videosWithDurations.length,
          duration: sectionHours > 0 ? `${sectionHours}h ${sectionMinutes}m` : `${sectionMinutes}m`,
          order: sectionIndex
        }
      })
    )
    
    const courseStats = calculateCourseDuration(curriculumWithDurations)
    
    const course = await prisma.course.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        price: parseInt(data.price),
        originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
        duration: courseStats.duration,
        lessons: courseStats.lessons,
        level: data.level,
        language: data.language || 'Hindi/English',
        thumbnail: data.thumbnail,
        whatYouLearn: data.whatYouLearn?.filter(item => item.trim()) || [],
        requirements: data.requirements?.filter(item => item.trim()) || [],
        curriculum: {
          create: curriculumWithDurations.map(section => ({
            title: section.title,
            lessons: section.lessons,
            duration: section.duration,
            order: section.order,
            videos: {
              create: section.videos.map(video => ({
                title: video.title,
                youtubeUrl: video.youtubeUrl,
                duration: video.duration,
                order: video.order
              }))
            }
          }))
        }
      },
      include: {
        curriculum: {
          include: {
            videos: true
          }
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    console.error('Course creation error:', error)
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}