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

export async function PUT(request, { params }) {
  try {
    const { id } = await params
    const data = await request.json()
    
    console.log('Updating course with data:', data)
    
    // Update course basic info
    const course = await prisma.course.update({
      where: { id },
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        price: data.price,
        originalPrice: data.originalPrice,
        duration: data.duration,
        lessons: data.lessons,
        level: data.level,
        language: data.language,
        trailerUrl: data.trailerUrl,
        thumbnail: data.thumbnail,
        whatYouLearn: data.whatYouLearn,
        requirements: data.requirements
      }
    })

    // Update curriculum if provided
    if (data.curriculum && Array.isArray(data.curriculum)) {
      // Get existing sections to find videos
      const existingSections = await prisma.section.findMany({
        where: { courseId: id },
        include: { videos: true }
      })

      // Delete progress records for all videos in this course
      const videoIds = existingSections.flatMap(section => section.videos.map(video => video.id))
      if (videoIds.length > 0) {
        await prisma.progress.deleteMany({
          where: { videoId: { in: videoIds } }
        })
      }

      // Delete existing curriculum (videos will be deleted due to cascade)
      await prisma.section.deleteMany({
        where: { courseId: id }
      })

      // Create new curriculum
      for (const section of data.curriculum) {
        const createdSection = await prisma.section.create({
          data: {
            title: section.title,
            lessons: section.lessons || 0,
            duration: section.duration || '0m',
            order: section.order || 0,
            courseId: id
          }
        })

        // Create videos for this section
        if (section.videos && Array.isArray(section.videos)) {
          for (let i = 0; i < section.videos.length; i++) {
            const video = section.videos[i]
            await prisma.video.create({
              data: {
                title: video.title,
                description: video.description || '',
                youtubeUrl: video.youtubeUrl,
                duration: video.duration || '0:00',
                order: i,
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