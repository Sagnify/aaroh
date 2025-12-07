import { useQuery } from '@tanstack/react-query'

export const useCourses = () => {
  return useQuery({
    queryKey: ['courses'],
    queryFn: async () => {
      const response = await fetch('/api/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      return response.json()
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useCourse = (id) => {
  return useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await fetch(`/api/courses/${id}`)
      if (!response.ok) throw new Error('Failed to fetch course')
      return response.json()
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  })
}

export const useUserProgress = (courseId) => {
  return useQuery({
    queryKey: ['progress', courseId],
    queryFn: async () => {
      const response = await fetch(`/api/progress/${courseId}`)
      if (!response.ok) throw new Error('Failed to fetch progress')
      return response.json()
    },
    enabled: !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

export const useCertificateSettings = () => {
  return useQuery({
    queryKey: ['certificateSettings'],
    queryFn: async () => {
      const response = await fetch('/api/certificate-settings')
      if (!response.ok) throw new Error('Failed to fetch settings')
      return response.json()
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

export const useAdminUsers = () => {
  return useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const response = await fetch('/api/admin/users')
      if (!response.ok) throw new Error('Failed to fetch users')
      return response.json()
    },
    staleTime: 3 * 60 * 1000,
  })
}

export const useAdminPurchases = () => {
  return useQuery({
    queryKey: ['adminPurchases'],
    queryFn: async () => {
      const response = await fetch('/api/admin/purchases')
      if (!response.ok) throw new Error('Failed to fetch purchases')
      return response.json()
    },
    staleTime: 3 * 60 * 1000,
  })
}

export const useAdminStats = () => {
  return useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats')
      if (!response.ok) throw new Error('Failed to fetch stats')
      return response.json()
    },
    staleTime: 1 * 60 * 1000,
  })
}

export const useAdminCourses = () => {
  return useQuery({
    queryKey: ['adminCourses'],
    queryFn: async () => {
      const response = await fetch('/api/admin/courses')
      if (!response.ok) throw new Error('Failed to fetch courses')
      return response.json()
    },
    staleTime: 3 * 60 * 1000,
  })
}

export const useAdminCourse = (id) => {
  return useQuery({
    queryKey: ['adminCourse', id],
    queryFn: async () => {
      const response = await fetch(`/api/admin/courses/${id}`)
      if (!response.ok) throw new Error('Failed to fetch course')
      return response.json()
    },
    enabled: !!id,
    staleTime: 3 * 60 * 1000,
  })
}

export const useAdmin2FAStatus = () => {
  return useQuery({
    queryKey: ['admin2FAStatus'],
    queryFn: async () => {
      const response = await fetch('/api/admin/2fa/status')
      if (!response.ok) throw new Error('Failed to fetch 2FA status')
      return response.json()
    },
    staleTime: 5 * 60 * 1000,
  })
}
