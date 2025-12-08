import { Card, CardContent } from '@/components/ui/card'

export default function CourseSkeleton({ count = 3 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i} className="overflow-hidden animate-pulse">
          <div className="aspect-video bg-gray-200" />
          <CardContent className="p-6">
            <div className="h-6 bg-gray-200 rounded mb-3 w-3/4" />
            <div className="h-4 bg-gray-200 rounded mb-4 w-full" />
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 bg-gray-200 rounded w-20" />
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
            <div className="h-10 bg-gray-200 rounded w-full" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
