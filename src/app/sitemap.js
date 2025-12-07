import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default async function sitemap() {
  const baseUrl = 'https://aaroh.com'
  
  // Static pages
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/courses`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/signup`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/refund-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Fetch dynamic course pages
  let coursePages = []
  try {
    const courses = await prisma.course.findMany({
      where: { published: true },
      select: { id: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    })
    
    coursePages = courses.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: course.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.9,
    }))
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error)
  } finally {
    await prisma.$disconnect()
  }

  return [...staticPages, ...coursePages]
}
