"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X, User, LogOut, BookOpen, Settings, ChevronDown, ShoppingCart, Package } from "lucide-react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { useSession, signOut } from "next-auth/react"
import { useCart } from "@/hooks/useCart"

export default function Navbar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const { data: session, status } = useSession()
  const { cartCount } = useCart()
  const isHomepage = pathname === '/'
  const isAdminPage = pathname.startsWith('/admin')
  const isLoading = status === 'loading'

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const navItems = [
    { href: "/", label: "Home" },
    { href: "/courses", label: "Courses" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ]

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/courses", label: "Courses" },
    { href: "/admin/shop", label: "Shop" },
    { href: "/admin/users", label: "Users" },
    { href: "/admin/purchases", label: "Purchases" },
    { href: "/admin/content", label: "Content" },
  ]

  return (
    <>
    <nav className="fixed top-0 w-full z-40 transition-all duration-500 ease-in-out">
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
          <Link href="/" aria-label="Aaroh Music Academy Home" className="flex items-center">
            {(!isHomepage || isScrolled) && (
              <img 
                src="/logos/logo_dark.png"
                alt="Aaroh Music Academy"
                className="h-8 w-auto transition-all duration-300"
              />
            )}
            {isAdminPage && <span className="text-lg font-medium ml-2 text-black">Admin</span>}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {(isAdminPage ? adminNavItems : navItems).map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === item.href
                    ? (isAdminPage ? "!text-gray-900" : (isScrolled ? "!text-gray-900" : (isHomepage ? "!text-white" : "!text-gray-900")))
                    : (isAdminPage ? "!text-gray-600 hover:!text-gray-900" : (isScrolled ? "!text-gray-700 hover:!text-gray-900" : (isHomepage ? "!text-white/80 hover:!text-white" : "!text-gray-700 hover:!text-gray-900")))
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
                {session && session.user.role === 'USER' && (
                  <Link href="/shop/cart">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`relative ${
                        isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : (isHomepage ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
                      }`}
                    >
                      <ShoppingCart size={18} />
                      {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                          {cartCount > 9 ? '9+' : cartCount}
                        </span>
                      )}
                    </Button>
                  </Link>
                )}
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse"></div>
                  </div>
                ) : session && session.user.role === 'USER' ? (
                  <div className="relative">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`flex items-center space-x-2 ${
                        isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : (isHomepage ? 'text-white/90 hover:text-white hover:bg-white/10' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
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
                          href="/dashboard" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          <BookOpen className="w-4 h-4 mr-3 text-gray-600" />
                          My Courses
                        </Link>
                        <Link 
                          href="/orders" 
                          className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          onClick={() => setProfileOpen(false)}
                        >
                          <Package className="w-4 h-4 mr-3 text-gray-600" />
                          My Orders
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
                        isScrolled ? 'text-gray-700 hover:text-gray-900 hover:bg-gray-100' : (isHomepage ? 'text-white/80 hover:text-white hover:bg-white/10 border-white/20' : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100')
                      }`}>
                        Login
                      </Button>
                    </Link>
                    <Link href="/signup">
                      <Button size="sm" className={`${
                        isScrolled ? 'bg-gray-900 hover:bg-gray-800 text-white' : (isHomepage ? 'bg-white hover:bg-gray-100 text-gray-900' : 'bg-gray-900 hover:bg-gray-800 text-white')
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
            aria-label={isOpen ? "Close menu" : "Open menu"}
            className={`md:hidden ${
              isScrolled ? 'text-gray-700' : (isHomepage ? 'text-white' : 'text-gray-700')
            }`}
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </Button>
        </div>

        {/* Mobile Sidebar - Moved outside to cover full screen */}
      </div>
      </div>
    </nav>
    
    {/* Mobile Sidebar */}
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 z-[60] md:hidden"
            onClick={() => setIsOpen(false)}
          />
          
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 left-0 h-screen w-80 bg-gradient-to-br from-white to-gray-50 shadow-2xl z-[70] md:hidden flex flex-col"
          >
                {/* Header - Fixed */}
                <div className="bg-gradient-to-r from-[#a0303f] to-[#ff6b6b] p-4 flex-shrink-0">
                  <div className="flex items-center justify-between mb-3">
                    <Link 
                      href="/" 
                      className="flex items-center"
                      onClick={() => setIsOpen(false)}
                    >
                      <img 
                        src="/logos/logo_light.png"
                        alt="Aaroh"
                        className="h-8 w-auto"
                      />
                    </Link>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
                    >
                      <X size={24} />
                    </button>
                  </div>
                  {session && session.user.role === 'USER' && (
                    <div className="flex items-center space-x-3 mt-3 p-2.5 bg-white/10 rounded-lg backdrop-blur-sm">
                      <div className="w-9 h-9 bg-white/20 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium text-sm">{session.user.name || 'User'}</p>
                        <p className="text-white/70 text-xs truncate">{session.user.email}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Navigation - Scrollable Middle (40%) */}
                <div className="flex-1 overflow-y-auto py-4 px-4 scrollbar-hide" style={{scrollbarWidth: 'none', msOverflowStyle: 'none'}}>
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                  <div className="space-y-1">
                    {(isAdminPage ? adminNavItems : navItems).map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`block px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          pathname === item.href
                            ? "bg-gradient-to-r from-[#ff6b6b] to-[#ff8585] text-white shadow-md"
                            : "text-gray-700 hover:bg-white hover:shadow-sm"
                        }`}
                        onClick={() => setIsOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                </div>
                
                {/* User Menu - Fixed Bottom (30%) */}
                {!isAdminPage && (
                  <div className="border-t border-gray-200 p-4 flex-shrink-0" style={{minHeight: '30vh'}}>
                      {isLoading ? (
                        <div className="flex items-center justify-center py-4">
                          <div className="w-8 h-8 rounded-full border-2 border-[#ff6b6b] border-t-transparent animate-spin"></div>
                        </div>
                      ) : session && session.user.role === 'USER' ? (
                        <div className="space-y-1.5 pb-4">
                          <Link
                            href="/profile"
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Settings size={16} className="text-gray-600" />
                            </div>
                            <span>My Profile</span>
                          </Link>
                          <Link
                            href="/dashboard"
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                              <BookOpen size={16} className="text-gray-600" />
                            </div>
                            <span>My Courses</span>
                          </Link>
                          <Link
                            href="/shop/cart"
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center relative">
                              <ShoppingCart size={16} className="text-gray-600" />
                              {cartCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
                                  {cartCount > 9 ? '9+' : cartCount}
                                </span>
                              )}
                            </div>
                            <span>My Cart ({cartCount})</span>
                          </Link>
                          <Link
                            href="/orders"
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-white hover:shadow-sm transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                              <Package size={16} className="text-gray-600" />
                            </div>
                            <span>My Orders</span>
                          </Link>
                          <button
                            onClick={() => {
                              signOut()
                              setIsOpen(false)
                            }}
                            className="flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-700 hover:bg-red-50 hover:text-red-600 transition-all w-full text-left"
                          >
                            <div className="w-7 h-7 bg-gray-100 rounded-lg flex items-center justify-center">
                              <LogOut size={16} className="text-gray-600" />
                            </div>
                            <span>Logout</span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2 pb-4">
                          <Link
                            href="/login"
                            className="block w-full px-4 py-2.5 text-center rounded-xl border-2 border-[#ff6b6b] text-[#ff6b6b] text-sm font-semibold hover:bg-[#ff6b6b] hover:text-white transition-all shadow-sm"
                            onClick={() => setIsOpen(false)}
                          >
                            Login
                          </Link>
                          <Link
                            href="/signup"
                            className="block w-full px-4 py-2.5 text-center rounded-xl bg-gradient-to-r from-[#ff6b6b] to-[#ff8585] text-white text-sm font-semibold hover:shadow-lg transition-all"
                            onClick={() => setIsOpen(false)}
                          >
                            Sign Up
                          </Link>
                        </div>
                      )}
                    </div>
                  )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
    </>
  )
}