"use client"

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Mail, Calendar } from 'lucide-react'
import { useAdminUsers } from '@/hooks/useCachedData'
import { TableSkeleton } from '@/components/AdminSkeleton'
import Pagination from '@/components/Pagination'

export default function ManageUsers() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { data: usersData, isLoading } = useAdminUsers()
  const [bookings, setBookings] = useState([])
  const [activeTab, setActiveTab] = useState('users')
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const users = usersData || []

  useEffect(() => {
    document.title = 'Manage Users - Admin - Aaroh'
  }, [])

  useEffect(() => {
    if (status === 'loading') return
    if (!session || session.user.role !== 'ADMIN') {
      router.push('/admin/login')
      return
    }
    fetchBookings()
  }, [session, status, router])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/class-booking')
      const data = await response.json()
      setBookings(data)
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoadingBookings(false)
    }
  }

  if (status === 'loading' || !session || session.user.role !== 'ADMIN') {
    return null
  }

  const totalPages = activeTab === 'users' 
    ? Math.ceil(users.length / itemsPerPage)
    : Math.ceil(bookings.length / itemsPerPage)
  
  const paginatedData = activeTab === 'users'
    ? users.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : bookings.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black pt-16">
      <div className="max-w-7xl mx-auto px-0 md:px-6 py-8">
        <div className="mb-8 px-4 md:px-0">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Users</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage user accounts and class bookings</p>
          
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveTab('users')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'users'
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              All Users ({users.length})
            </button>
            <button
              onClick={() => setActiveTab('bookings')}
              className={`px-4 py-2 rounded-md font-medium ${
                activeTab === 'bookings'
                  ? 'bg-gray-900 text-white dark:bg-gray-100 dark:text-gray-900'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700'
              }`}
            >
              Class Bookings ({bookings.length})
            </button>
          </div>
        </div>

        {activeTab === 'users' && (
          <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg relative">
            <div className="px-6 py-4 border-b dark:border-zinc-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">All Users</h2>
            </div>
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 flex items-center justify-center z-10 rounded-lg">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                    <Users className="w-8 h-8 text-white dark:text-gray-900" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">User</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Email</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Phone</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Role</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((user) => (
                      <tr key={user.id} className="border-b dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-900">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{user.name || 'No Name'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{user.email}</td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{user.phone || 'Not provided'}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            user.role === 'ADMIN' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg relative">
            <div className="px-6 py-4 border-b dark:border-zinc-800">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Class Booking Requests</h2>
            </div>
            {loadingBookings && (
              <div className="absolute inset-0 bg-white/80 dark:bg-zinc-950/80 flex items-center justify-center z-10 rounded-lg">
                <div className="relative">
                  <div className="w-16 h-16 bg-gray-900 dark:bg-gray-100 rounded-full flex items-center justify-center animate-pulse">
                    <Calendar className="w-8 h-8 text-white dark:text-gray-900" />
                  </div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-gray-600 dark:border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            )}
            <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
                    <tr>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Student</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Email</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Class Type</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Phone</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Status</th>
                      <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-gray-200">Requested</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedData.map((booking) => (
                      <tr key={booking.id} className="border-b dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-gray-50 dark:hover:bg-zinc-900">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                              <Users className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                            </div>
                            <span className="font-medium text-gray-900 dark:text-white">{booking.user.name || 'No Name'}</span>
                          </div>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{booking.user.email}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            booking.classType === 'PRIVATE' 
                              ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                              : booking.classType === 'GROUP'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
                          }`}>
                            {booking.classType === 'PRIVATE' ? '1-on-1 Private' : 
                             booking.classType === 'GROUP' ? 'Group Class' : 'Offline (Kolkata)'}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">{booking.phone || booking.user.phone || 'Not provided'}</td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            booking.status === 'NEW' 
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                              : booking.status === 'CONTACTED'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-gray-600 dark:text-gray-400">
                          {new Date(booking.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </div>
        )}

        {activeTab === 'users' && users.length === 0 && (
          <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg">
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No users found</p>
            </div>
          </div>
        )}

        {activeTab === 'bookings' && bookings.length === 0 && (
          <div className="bg-white dark:bg-zinc-950 border dark:border-zinc-800 shadow-sm rounded-lg">
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">No class booking requests yet</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
