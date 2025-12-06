"use client"

import { useState } from 'react'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Music, Menu, X, LogOut, Home, BookOpen, Users, ShoppingCart, FileText, Award, ChevronLeft, ChevronRight } from 'lucide-react'

export default function AdminSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const { data: session } = useSession()
  const pathname = usePathname()

  const navigation = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: Home },
    { name: 'Courses', href: '/admin/courses', icon: BookOpen },
    { name: 'Users', href: '/admin/users', icon: Users },
    { name: 'Purchases', href: '/admin/purchases', icon: ShoppingCart },
    { name: 'Content', href: '/admin/content', icon: FileText },
    { name: 'Certificates', href: '/admin/certificate-settings', icon: Award },
  ]

  const handleSignOut = () => {
    signOut({ callbackUrl: '/admin/login' })
  }

  return (
    <>
      {/* Top Header */}
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b z-40 flex items-center justify-between px-4 lg:pl-64">
        <div className="lg:hidden flex items-center space-x-2">
          <Link href="/admin/dashboard" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <Music className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-semibold text-gray-900">Aaroh Admin</span>
          </Link>
        </div>
        <div className="hidden lg:flex items-center space-x-4 ml-auto">
          <span className="text-sm text-gray-600">
            {session?.user?.name || session?.user?.email}
          </span>
          <Button
            onClick={handleSignOut}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100"
        >
          {isMobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full bg-white border-r z-50 transition-all duration-300 ${
          isCollapsed ? 'w-20' : 'w-64'
        } ${isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-4 border-b">
            {!isCollapsed && (
              <Link href="/admin/dashboard" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-gray-900">Aaroh</span>
              </Link>
            )}
            {isCollapsed && (
              <Link href="/admin/dashboard" className="mx-auto">
                <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
                  <Music className="w-6 h-6 text-white" />
                </div>
              </Link>
            )}
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto py-4">
            <div className="space-y-1 px-3">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileOpen(false)}
                    className={`flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isCollapsed && <span className="font-medium">{item.name}</span>}
                  </Link>
                )
              })}
            </div>
          </nav>

          {/* Collapse Toggle (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center h-12 border-t hover:bg-gray-100 transition-colors"
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            )}
          </button>
        </div>
      </aside>
    </>
  )
}
