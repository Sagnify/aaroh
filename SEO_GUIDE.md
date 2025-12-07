# SEO Guide for Aaroh Music Academy

## 🎯 Overview
Your website is **fully SEO-optimized** with dynamic content from the database. Every course you add automatically gets proper SEO.

---

## ✅ What's Already SEO-Optimized

### 1. **All Static Pages**
- Home (`/`)
- Courses List (`/courses`)
- About (`/about`)
- Contact (`/contact`)
- Login & Signup

Each has:
- Custom title tags
- Meta descriptions
- Open Graph tags (for social media)
- Twitter Card tags
- Keywords

### 2. **Dynamic Course Pages**
Every course detail page (`/courses/[id]`) automatically gets:
- **Title**: From `course.title` or `course.seoTitle`
- **Description**: From `course.subtitle` or `course.seoDescription`
- **Image**: From `course.thumbnail`
- **Keywords**: From `course.seoKeywords` (if provided)
- **Structured Data**: JSON-LD for rich search results

### 3. **Structured Data (Rich Snippets)**
- **Organization Schema**: On homepage
- **Course Schema**: On each course page
- **Breadcrumb Schema**: Navigation hierarchy

### 4. **SEO Files**
- **robots.txt**: Tells search engines what to crawl
- **sitemap.js**: Auto-generates sitemap with all courses

---

## 📝 How to Add SEO When Creating a Course

### Step 1: Fill Basic Course Info (Required)
These fields are used for SEO automatically:
1. **Title** → Becomes page title
2. **Subtitle** → Becomes meta description
3. **Description** → Used in structured data
4. **Thumbnail** → Becomes social media image

### Step 2: Fill SEO Settings (Optional)
New section in admin panel with 3 fields:

#### **SEO Title** (Optional)
- Custom title for search engines
- If blank: Uses course title
- Example: "Complete Vocal Training Course - Learn Singing Online"

#### **SEO Description** (Optional)
- Custom description for search results
- If blank: Uses subtitle
- Keep it 150-160 characters
- Example: "Master vocal techniques with our comprehensive singing course. Learn pitch control, breathing, and performance skills. Enroll today!"

#### **SEO Keywords** (Optional)
- Comma-separated keywords
- Example: "vocal training, singing lessons, music course, online singing, voice training"

### Step 3: Publish Course
Once published, the course automatically:
- ✅ Appears in sitemap
- ✅ Gets indexed by Google
- ✅ Shows rich snippets in search
- ✅ Has proper social media previews

---

## 🔄 How Dynamic SEO Works

### When You Create a Course:
```
Database (Course Table)
    ↓
API fetches course data
    ↓
Page renders with SEO meta tags
    ↓
Search engines index the page
```

### SEO Priority (Fallback System):
1. **Title**: `seoTitle` → `title`
2. **Description**: `seoDescription` → `subtitle` → `description`
3. **Image**: `thumbnail` → default logo
4. **Keywords**: `seoKeywords` → none

---

## 🗺️ Sitemap
**Location**: `https://aaroh.com/sitemap.xml`

Automatically includes:
- All static pages
- All published courses
- Last modified dates
- Priority levels

**Updates**: Automatically when you add/edit courses

---

## 🤖 Robots.txt
**Location**: `https://aaroh.com/robots.txt`

Settings:
- ✅ Allows all search engines
- ❌ Blocks `/admin/` pages
- ❌ Blocks `/api/` endpoints
- 📍 Points to sitemap

---

## 📊 What Search Engines See

### For Course Pages:
```html
<title>Complete Vocal Training - Aaroh Music Academy</title>
<meta name="description" content="Master vocal techniques...">
<meta name="keywords" content="vocal training, singing lessons...">
<meta property="og:title" content="Complete Vocal Training">
<meta property="og:image" content="[course thumbnail]">

<script type="application/ld+json">
{
  "@type": "Course",
  "name": "Complete Vocal Training",
  "price": "2999",
  "provider": "Aaroh Music Academy"
}
</script>
```

---

## 🎨 Best Practices for SEO

### When Creating Courses:

1. **Title** (50-60 characters)
   - ✅ "Complete Vocal Training for Beginners"
   - ❌ "Course 1"

2. **Subtitle** (150-160 characters)
   - ✅ "Learn professional singing techniques with step-by-step guidance. Master pitch, tone, and breathing exercises."
   - ❌ "A course about singing"

3. **Thumbnail**
   - Use high-quality images (1200x630px recommended)
   - Shows in social media shares

4. **SEO Keywords** (5-10 keywords)
   - ✅ "vocal training, singing course, music lessons, online singing"
   - ❌ "course, music, learn"

5. **Description**
   - Be detailed and informative
   - Include what students will learn
   - Mention skill level

---

## 🚀 After Publishing a Course

### Automatic Actions:
1. ✅ Added to sitemap
2. ✅ Indexed by Google (within 24-48 hours)
3. ✅ Appears in search results
4. ✅ Shows rich snippets with rating/price

### Manual Actions (Optional):
1. **Submit to Google Search Console**
   - Request indexing for faster results
   
2. **Share on Social Media**
   - OG tags ensure proper previews

3. **Monitor Performance**
   - Check Google Analytics
   - Track search rankings

---

## 📱 Social Media Previews

When shared on Facebook/Twitter/LinkedIn:
- **Image**: Course thumbnail
- **Title**: Course title
- **Description**: Course subtitle
- **Price**: Displayed in structured data

---

## 🔍 Testing Your SEO

### Tools to Use:
1. **Google Rich Results Test**
   - https://search.google.com/test/rich-results
   - Test course URLs

2. **Facebook Sharing Debugger**
   - https://developers.facebook.com/tools/debug/
   - Test social previews

3. **Twitter Card Validator**
   - https://cards-dev.twitter.com/validator
   - Test Twitter previews

---

## 📈 SEO Checklist for Each Course

- [ ] Title is descriptive (50-60 chars)
- [ ] Subtitle explains value (150-160 chars)
- [ ] High-quality thumbnail uploaded
- [ ] Description is detailed
- [ ] Price is set correctly
- [ ] Course is marked as "Published"
- [ ] (Optional) Custom SEO fields filled
- [ ] (Optional) Keywords added

---

## 🎓 Example: Perfect SEO Course

```
Title: "Complete Hindustani Classical Vocal Training"

Subtitle: "Master ragas, alankars, and classical singing techniques with expert guidance. Perfect for beginners to intermediate learners."

Description: "Comprehensive course covering Hindustani classical music fundamentals, including swar practice, raga identification, and performance techniques. Learn from experienced instructor Kashmira Chakraborty."

SEO Title: "Hindustani Classical Singing Course - Learn Ragas Online"

SEO Description: "Learn Hindustani classical music online with our comprehensive vocal training course. Master ragas, alankars, and classical techniques. Enroll today!"

SEO Keywords: "hindustani classical music, raga training, classical singing, indian classical music, vocal training, music course online"

Thumbnail: [High-quality image of classical music instruments/singer]
```

---

## 🔧 Database Schema

### Course Table Fields Used for SEO:
```
title          → Page title
subtitle       → Meta description
description    → Structured data
thumbnail      → OG image
price          → Structured data
rating         → Rich snippets
students       → Social proof
seoTitle       → Custom title (optional)
seoDescription → Custom description (optional)
seoKeywords    → Meta keywords (optional)
```

---

## ❓ FAQ

### Q: Do I need to fill SEO fields for every course?
**A:** No! If you leave them blank, the system uses title/subtitle automatically.

### Q: How long until my course appears in Google?
**A:** Usually 24-48 hours after publishing. Submit to Google Search Console for faster indexing.

### Q: Can I change SEO after publishing?
**A:** Yes! Edit the course and update SEO fields. Changes reflect immediately.

### Q: What if I don't add a thumbnail?
**A:** The default Aaroh logo will be used for social media previews.

### Q: Do I need to update the sitemap manually?
**A:** No! It updates automatically when you add/edit courses.

---

## 🎉 Summary

**You don't need to do anything special!** Just create courses normally:
1. Fill title, subtitle, description
2. Add thumbnail
3. Publish

SEO happens automatically! 🚀

For advanced control, use the optional SEO fields in the admin panel.
