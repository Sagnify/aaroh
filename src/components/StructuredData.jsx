"use client"

import { useEffect } from 'react'

export function OrganizationSchema() {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "EducationalOrganization",
      "name": "Aaroh Music Academy",
      "description": "Learn music online with expert-led courses in vocals, keyboard, and music theory",
      "url": "https://aaroh.com",
      "logo": "https://aaroh.com/logos/logo_dark.png",
      "founder": {
        "@type": "Person",
        "name": "Kashmira Chakraborty"
      },
      "address": {
        "@type": "PostalAddress",
        "addressCountry": "IN"
      },
      "contactPoint": {
        "@type": "ContactPoint",
        "contactType": "Customer Service",
        "availableLanguage": ["English", "Hindi"]
      }
    })
    document.head.appendChild(script)
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])
  
  return null
}

export function CourseSchema({ course }) {
  useEffect(() => {
    if (!course) return
    
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Course",
      "name": course.title,
      "description": course.subtitle || course.description,
      "provider": {
        "@type": "EducationalOrganization",
        "name": "Aaroh Music Academy",
        "url": "https://aaroh.com"
      },
      "instructor": {
        "@type": "Person",
        "name": "Kashmira Chakraborty"
      },
      "offers": {
        "@type": "Offer",
        "price": course.price,
        "priceCurrency": "INR",
        "availability": "https://schema.org/InStock"
      },
      "aggregateRating": course.rating ? {
        "@type": "AggregateRating",
        "ratingValue": course.rating,
        "ratingCount": course.students || 0
      } : undefined,
      "image": course.thumbnail || "https://aaroh.com/logos/logo_dark.png"
    })
    document.head.appendChild(script)
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [course])
  
  return null
}

export function BreadcrumbSchema({ items }) {
  useEffect(() => {
    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": items.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.name,
        "item": item.url
      }))
    })
    document.head.appendChild(script)
    
    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [items])
  
  return null
}
