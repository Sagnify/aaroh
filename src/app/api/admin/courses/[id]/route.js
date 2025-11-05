import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const { id } = await params
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        curriculum: {
          include: {
            videos: {
              orderBy: { order: 'asc' }
            }
          },
          orderBy: { order: 'asc' }
        }
      }
    })

    if (!course) {
      return NextResponse.json({ error: 'Course not found' }, { status: 404 })
    }

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch course' }, { status: 500 })
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

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    // Auto-fetch durations for all videos
    let curriculumWithDurations = []
    let totalLessons = 0
    let totalSeconds = 0
    
    if (data.curriculum && Array.isArray(data.curriculum)) {
      curriculumWithDurations = await Promise.all(
        data.curriculum.map(async (section, sectionIndex) => {
          const videosWithDurations = await Promise.all(
            (section.videos || []).map(async (video, videoIndex) => {
              const { duration, seconds } = await fetchYouTubeDuration(video.youtubeUrl)
              totalSeconds += seconds
              totalLessons++
              return {
                ...video,
                duration,
                order: videoIndex
              }
            })
          )
          
          const sectionTotalSeconds = videosWithDurations.reduce((sum, v) => {
            const parts = v.duration.split(':')
            if (parts.length === 2) {
              return sum + (parseInt(parts[0]) * 60) + parseInt(parts[1])
            }
            return sum
          }, 0)
          
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
    }
    
    const courseHours = Math.floor(totalSeconds / 3600)
    const courseMinutes = Math.floor((totalSeconds % 3600) / 60)
    const courseDuration = courseHours > 0 ? `${courseHours}h ${courseMinutes}m` : `${courseMinutes}m`
    
    // Update course basic info with calculated stats
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        duration: courseDuration,
        lessons: totalLessons,
        level: data.level,
        language: data.language,
        trailerUrl: data.trailerUrl,
        thumbnail: data.thumbnail,
        whatYouLearn: data.whatYouLearn,
        requirements: data.requirements
      }
    })

    // Update curriculum if provided
    if (curriculumWithDurations.length > 0) {
      // Get existing sections to find videos
      const existingSections = await prisma.section.findMany({
        where: { courseId: id },
        include: { videos: true }
      })

      // Note: Progress records will remain for existing videos

      // Delete existing curriculum (videos will be deleted due to cascade)
      await prisma.section.deleteMany({
        where: { courseId: id }
      })

      // Create new curriculum with auto-fetched durations
      for (const section of curriculumWithDurations) {
        const createdSection = await prisma.section.create({
          data: {
            title: section.title,
            lessons: section.lessons,
            duration: section.duration,
            order: section.order,
            courseId: id
          }
        })

        // Create videos for this section
        if (section.videos && Array.isArray(section.videos)) {
          for (const video of section.videos) {
            await prisma.video.create({
              data: {
                title: video.title,
                description: video.description || '',
                youtubeUrl: video.youtubeUrl,
                duration: video.duration,
                order: video.order,
                isPreview: video.isPreview || false,
                sectionId: createdSection.id
              }
            })
          }
        }
      }
    }

    return NextResponse.json(course)
  } catch (error) {
    console.error('Error updating course:', error)
    return NextResponse.json({ error: 'Failed to update course', details: error.message }, { status: 500 })
  }
}