import { NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/api-utils'

export async function POST(request) {
  try {
    const { user, error } = await getAuthenticatedUser('ADMIN')
    if (error) return error

    const formData = await request.formData()
    const image = formData.get('image')

    if (!image) {
      return NextResponse.json({ error: 'No image provided' }, { status: 400 })
    }

    // Convert image to base64
    const bytes = await image.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64Image = buffer.toString('base64')

    // Upload to ImgBB
    const imgbbFormData = new FormData()
    imgbbFormData.append('image', base64Image)

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${process.env.IMBB_API_KEY}`, {
      method: 'POST',
      body: imgbbFormData
    })

    if (!response.ok) {
      throw new Error('Failed to upload to ImgBB')
    }

    const data = await response.json()
    
    if (data.success) {
      return NextResponse.json({
        success: true,
        url: data.data.url,
        thumbnail: data.data.thumb?.url || data.data.url
      })
    } else {
      throw new Error('ImgBB upload failed')
    }

  } catch (error) {
    console.error('Image upload error:', error)
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 })
  }
}