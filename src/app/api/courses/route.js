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
      include: {
        curriculum: {
          include: {
            videos: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            purchases: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    const coursesWithStats = courses.map(course => {
      const enrichedCourse = enrichCourseWithStats(course)
      return {
        ...enrichedCourse,
        students: course._count.purchases,
        thumbnail: course.thumbnail
      }
    })

    return NextResponse.json(coursesWithStats)
  } catch (error) {
    return handleApiError(error, 'Courses fetch')
  }
}

export async function POST(request) {
  try {
    const data = await request.json()
    
    const course = await prisma.course.create({
      data: {
        title: data.title,
        subtitle: data.subtitle,
        description: data.description,
        price: parseInt(data.price),
        originalPrice: data.originalPrice ? parseInt(data.originalPrice) : null,
        duration: data.duration,
        lessons: parseInt(data.lessons),
        level: data.level,
        language: data.language || 'Hindi/English',
        whatYouLearn: data.whatYouLearn?.filter(item => item.trim()) || [],
        requirements: data.requirements?.filter(item => item.trim()) || [],
        curriculum: {
          create: data.curriculum?.map((section, index) => ({
            title: section.title,
            lessons: section.lessons,
            duration: section.duration,
            order: index,
            topics: {
              create: section.topics?.map((topic, topicIndex) => ({
                title: topic.title,
                order: topicIndex
              })) || []
            }
          })) || []
        }
      },
      include: {
        curriculum: {
          include: {
            topics: true
          }
        }
      }
    })

    return NextResponse.json(course)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create course' }, { status: 500 })
  }
}