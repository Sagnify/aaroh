"use client"

import dynamic from 'next/dynamic'

const CoursesClient = dynamic(() => import('@/components/CoursesClient'), {
  ssr: false
})

export default function Courses() {
  return <CoursesClient />
}