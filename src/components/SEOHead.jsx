"use client"

import Head from 'next/head'

export default function SEOHead({ 
  title = "Aaroh Music Academy - Learn Music Online",
  description = "Learn music online with Aaroh Music Academy. Expert-led courses in vocals, keyboard, and music theory. Join live classes or learn at your own pace.",
  keywords = "music academy, online music courses, vocal training, keyboard lessons, music theory, learn music online, Kashmira Chakraborty",
  ogImage = "/logos/logo_dark.png",
  url = "https://aaroh.com"
}) {
  const fullTitle = title.includes('Aaroh') ? title : `${title} - Aaroh Music Academy`
  
  return (
    <Head>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      
      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Aaroh Music Academy" />
      
      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow" />
      <meta name="author" content="Kashmira Chakraborty" />
      <link rel="canonical" href={url} />
    </Head>
  )
}
