import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { 
      templateUrl, 
      studentName, 
      courseTitle, 
      date, 
      certificateId,
      settings 
    } = await request.json()

    // Create canvas element
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    // Set canvas dimensions
    canvas.width = 1123
    canvas.height = 794
    
    // Load template image
    const img = new Image()
    img.crossOrigin = 'anonymous'
    
    const imagePromise = new Promise((resolve, reject) => {
      img.onload = () => {
        // Draw template
        ctx.drawImage(img, 0, 0, 1123, 794)
        
        // Student Name - Great Vibes font, dark blue
        const studentNameFontSize = Math.max(8, Math.min(((settings.studentNameHeight || 40) * 0.6), ((settings.studentNameWidth || 200) / (studentName.length * 1.0))))
        ctx.font = `bold ${studentNameFontSize}px cursive`
        ctx.fillStyle = '#4A5568'
        ctx.textAlign = 'left'
        ctx.fillText(studentName, settings.studentNameX - (settings.studentNameWidth || 200) / 2, settings.studentNameY)
        
        // Course Title - burgundy
        const courseTitleFontSize = Math.max(8, Math.min(((settings.courseTitleHeight || 40) * 0.6), ((settings.courseTitleWidth || 250) / (courseTitle.length * 1.0))))
        ctx.font = `bold ${courseTitleFontSize}px sans-serif`
        ctx.fillStyle = '#800020'
        ctx.textAlign = 'left'
        ctx.fillText(courseTitle, settings.courseTitleX - (settings.courseTitleWidth || 250) / 2, settings.courseTitleY)
        
        // Date - center aligned
        ctx.font = '12px sans-serif'
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.fillText(date, settings.dateX, settings.dateY)
        
        // Certificate ID - center aligned
        ctx.font = '7px sans-serif'
        ctx.fillStyle = '#000000'
        ctx.textAlign = 'center'
        ctx.fillText(certificateId, settings.certificateIdX, settings.certificateIdY)
        
        resolve(canvas.toDataURL('image/png'))
      }
      img.onerror = reject
    })
    
    img.src = templateUrl
    const generatedImageUrl = await imagePromise

    return NextResponse.json({ 
      success: true, 
      imageUrl: generatedImageUrl 
    })

  } catch (error) {
    console.error('Certificate generation error:', error)
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to generate certificate' 
    }, { status: 500 })
  }
}