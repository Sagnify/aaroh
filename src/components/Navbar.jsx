"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Menu, X, User, LogOut, BookOpen, Settings, ChevronDown } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { data: session } = useSession()
  const isHomepage = pathname === '/'
  const isAdminPage = pathname.startsWith('/admin')

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/purchases", label: "Purchases" },
    { href: "/admin/content", label: "Content" },
  ]

  return (
    <nav className="fixed top-0 w-full z-50 transition-all duration-500 ease-in-out">
      <div className={`transition-all duration-500 ease-in-out ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-lg' 
          : 'bg-transparent'
      }`}>
        <div className={`border-b border-[#ff6b6b]/20 transition-opacity duration-500 ease-in-out ${
          isScrolled ? 'opacity-100' : 'opacity-0'
        }`}></div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className={`text-2xl font-bold transition-colors duration-300 ${
            isScrolled ? 'text-[#a0303f]' : (isHomepage ? 'text-white' : 'text-[#a0303f]')
          }`}>
            Aaroh{isAdminPage && <span className="text-lg font-medium ml-1 text-black">Admin</span>}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {(isAdminPage ? adminNavItems : navItems).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? (isAdminPage ? "text-gray-900" : (isScrolled ? "text-[#ff6b6b]" : (isHomepage ? "text-[#e6b800]" : "text-[#ff6b6b]")))
                    : (isAdminPage ? "text-gray-600 hover:text-gray-900" : (isScrolled ? "text-gray-700 hover:text-[#ff6b6b]" : (isHomepage ? "text-white/80 hover:text-white" : "text-[#a0303f] hover:text-[#ff6b6b]")))
                }`}
              >
                {item.label}
                {pathname === item.href && (
                  <motion.div
                    className={`absolute bottom-0 left-0 right-0 h-0.5 ${
                      isAdminPage ? 'bg-gray-900' : (isScrolled ? 'bg-[#ff6b6b]' : (isHomepage ? 'bg-[#e6b800]' : 'bg-[#ff6b6b]'))
                    }`}
                    layoutId="underline"
                  />
                )}
              </Link>
            ))}
            
            {!isAdminPage && (
              <div className="flex items-center space-x-4">
                {session && session.user.role === 'USER' ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center space-x-2 ${
                        isScrolled ? 'text-gray-700 hover:text-[#ff6b6b] hover:bg-gray-100' : (isHomepage ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-[#a0303f] hover:text-[#ff6b6b] hover:bg-gray-100')
                      }`}
                      onClick={() => setProfileOpen(!profileOpen)}
                    >
                      <User size={16} />
                      <span>{session.user.name || 'Profile'}</span>
                      <ChevronDown size={14} />
                    </Button>
                    
                    {profileOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <Link 
                          href="/profile" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Settings className="w-4 h-4 mr-3 text-gray-600" />
                          My Profile
                        </Link>
                        <Link 
                          href="/my-courses" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          <BookOpen className="w-4 h-4 mr-3 text-gray-600" />
                          My Courses
                        </Link>
                        <button
                          onClick={() => {
                            signOut()
                            setProfileOpen(false)
                          }}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 text-left"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-gray-600" />
                          Logout
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    <Link href="/login">
                      <Button variant="ghost" size="sm" className={`${
                        isScrolled ? 'text-gray-700 hover:text-[#ff6b6b]' : (isHomepage ? 'text-white/80 hover:text-white border-white/20' : 'text-[#a0303f] hover:text-[#ff6b6b]')
                      }`}>
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className={`${
                        isScrolled ? 'bg-[#ff6b6b] hover:bg-[#e55a5a] text-white' : (isHomepage ? 'bg-[#e6b800] hover:bg-[#d4a600] text-black' : 'bg-[#ff6b6b] hover:bg-[#e55a5a] text-white')
                      }`}>
                        Sign Up
                      </Button>
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <Button
            variant="ghost"
            size="icon"
            className={`md:hidden ${
              isScrolled ? 'text-gray-700' : (isHomepage ? 'text-white' : 'text-[#a0303f]')
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4"
          >
            {(isAdminPage ? adminNavItems : navItems).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-3 py-2 text-base font-medium ${
                  pathname === item.href
                    ? (isAdminPage ? "text-gray-900" : (isScrolled ? "text-[#ff6b6b]" : (isHomepage ? "text-[#e6b800]" : "text-[#ff6b6b]")))
                    : (isAdminPage ? "text-gray-600 hover:text-gray-900" : (isScrolled ? "text-gray-700 hover:text-[#ff6b6b]" : (isHomepage ? "text-white/80 hover:text-white" : "text-[#a0303f] hover:text-[#ff6b6b]")))
                }`}
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            
            {!isAdminPage && (
              <div className="border-t border-gray-200 mt-4 pt-4">
                {session && session.user.role === 'USER' ? (
                  <>
                    <Link
                      href="/dashboard"
                      className={`flex items-center space-x-2 px-3 py-2 text-base font-medium ${
                        isScrolled ? 'text-gray-700 hover:text-[#ff6b6b]' : (isHomepage ? 'text-white/80 hover:text-white' : 'text-[#a0303f] hover:text-[#ff6b6b]')
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      <User size={16} />
                      <span>Dashboard</span>
                    </Link>
                    <button
                      onClick={() => {
                        signOut()
                        setIsOpen(false)
                      }}
                      className={`flex items-center space-x-2 px-3 py-2 text-base font-medium w-full text-left ${
                        isScrolled ? 'text-gray-700 hover:text-[#ff6b6b]' : (isHomepage ? 'text-white/80 hover:text-white' : 'text-[#a0303f] hover:text-[#ff6b6b]')
                      }`}
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className={`block px-3 py-2 text-base font-medium ${
                        isScrolled ? 'text-gray-700 hover:text-[#ff6b6b]' : (isHomepage ? 'text-white/80 hover:text-white' : 'text-[#a0303f] hover:text-[#ff6b6b]')
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      href="/signup"
                      className={`block px-3 py-2 text-base font-medium ${
                        isScrolled ? 'text-gray-700 hover:text-[#ff6b6b]' : (isHomepage ? 'text-white/80 hover:text-white' : 'text-[#a0303f] hover:text-[#ff6b6b]')
                      }`}
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            )}
          </motion.div>
        )}
      </div>
      </div>
    </nav>
  )
}