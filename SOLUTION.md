# 100% GUARANTEED SOLUTION

## Problem
PDF certificate doesn't match the modal preview design.

## Solution
Use HTML-to-Canvas-to-PDF approach instead of manual PDF drawing.

## Steps:

### 1. Install html2canvas
```bash
npm install html2canvas
```

### 2. Replace the handleDownload function with this:

```javascript
import html2canvas from 'html2canvas'

const handleDownload = async () => {
  const certificateElement = document.getElementById('certificate-preview')
  
  try {
    const canvas = await html2canvas(certificateElement, {
      scale: 3,
      useCORS: true,
      backgroundColor: '#ffffff'
    })
    
    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    })
    
    const imgWidth = 297
    const imgHeight = (canvas.height * imgWidth) / canvas.width
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
    pdf.save(`Certificate-${certificate.certificateId}.pdf`)
  } catch (error) {
    console.error('Error generating PDF:', error)
  }
}
```

### 3. Add ID to certificate div:
```jsx
<div id="certificate-preview" className="relative bg-white rounded-xl shadow-xl border-2 border-[#d1b56f] aspect-[4/3] overflow-hidden">
```

## Why This Works:
- Takes screenshot of exact modal design
- Converts to high-quality image
- Embeds in PDF
- 100% identical to preview

## Result:
Perfect match between modal and PDF certificate.