import { sql } from '@vercel/postgres'

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
  ]

  // Fetch dynamic course pages
  let coursePages = []
  try {
    const { rows } = await sql`
      SELECT id, "updatedAt" 
      FROM "Course" 
      WHERE published = true
      ORDER BY "createdAt" DESC
    `
    
    coursePages = rows.map((course) => ({
      url: `${baseUrl}/courses/${course.id}`,
      lastModified: new Date(course.updatedAt),
      changeFrequency: 'weekly',
      priority: 0.9,
    }))
  } catch (error) {
    console.error('Error fetching courses for sitemap:', error)
  }

  return [...staticPages, ...coursePages]
}
