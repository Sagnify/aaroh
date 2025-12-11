"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Mail, Send, Users, BookOpen, Gift, UserCheck, List, Edit, Eye, Save, ArrowLeft } from 'lucide-react'

export default function EmailNotifications() {
  const [courses, setCourses] = useState([])
  const [selectedCourse, setSelectedCourse] = useState('')
  const [sendToAllCourses, setSendToAllCourses] = useState(false)
  const [sendToAllProducts, setSendToAllProducts] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState([])
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('campaigns')
  const [users, setUsers] = useState([])
  const [customers, setCustomers] = useState([])
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [isEditingTemplate, setIsEditingTemplate] = useState(false)
  const [isPreviewTemplate, setIsPreviewTemplate] = useState(false)
  const [savingTemplate, setSavingTemplate] = useState(false)
  const [loadingUsers, setLoadingUsers] = useState(false)
  const [loadingCustomers, setLoadingCustomers] = useState(false)
  const [loadingCourses, setLoadingCourses] = useState(true)
  const [loadingProducts, setLoadingProducts] = useState(true)

  useEffect(() => {
    fetchCourses()
    fetchProducts()
    if (activeTab === 'recipients') {
      fetchUsers()
      fetchCustomers()
    }
    if (activeTab === 'templates') {
      fetchTemplates()
    }
  }, [activeTab])

  const fetchCourses = async () => {
    try {
      const response = await fetch('/api/admin/courses')
      if (response.ok) {
        const data = await response.json()
        setCourses(data)
      }
    } catch (error) {
      console.error('Failed to fetch courses:', error)
    } finally {
      setLoadingCourses(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/shop/products')
      if (response.ok) {
        const data = await response.json()
        console.log('Products fetched:', data)
        setProducts(data.products || data || [])
      } else {
        console.error('Products API failed:', response.status)
        setProducts([])
      }
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoadingProducts(false)
    }
  }

  const fetchUsers = async () => {
    setLoadingUsers(true)
    try {
      const response = await fetch('/api/admin/users')
      if (response.ok) {
        const data = await response.json()
        setUsers(data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoadingUsers(false)
    }
  }

  const fetchCustomers = async () => {
    setLoadingCustomers(true)
    try {
      const response = await fetch('/api/admin/customers')
      if (response.ok) {
        const data = await response.json()
        setCustomers(data)
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error)
    } finally {
      setLoadingCustomers(false)
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
    }
  }

  const saveTemplate = async () => {
    if (!selectedTemplate) return
    setSavingTemplate(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate)
      })
      if (response.ok) {
        await fetchTemplates()
        setIsEditingTemplate(false)
        alert('Template saved!')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
    } finally {
      setSavingTemplate(false)
    }
  }

  const renderTemplatePreview = () => {
    if (!selectedTemplate) return null
    let html = selectedTemplate.htmlContent
    selectedTemplate.variables.forEach(variable => {
      const value = variable.example || variable.name
      html = html.replaceAll(`{{${variable.name}}}`, value)
    })
    
    // Add fallback for broken images
    html = html.replace(/<img([^>]*?)src="([^"]*?)"([^>]*?)>/g, (match, before, src, after) => {
      const fallbackUrl = src.includes('course') || src.includes('Course') 
        ? 'https://placehold.co/400x200/8B5CF6/FFFFFF/png?text=Course+Image'
        : 'https://placehold.co/120x120/EC4899/FFFFFF/png?text=Product+Image'
      return `<img${before}src="${src}" onerror="this.src='${fallbackUrl}'"${after}>`
    })
    
    return <iframe srcDoc={html} className="w-full h-full border-0 rounded-lg" style={{ minHeight: '400px' }} />
  }

  const handleCourseAnnouncement = async () => {
    if (!selectedCourse) {
      alert('Please select a course')
      return
    }

    const selectedCourseData = courses.find(c => c.id === selectedCourse)
    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/course-announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courseId: selectedCourse,
          sendToAll: sendToAllCourses,
          courseTitle: selectedCourseData?.title,
          courseThumbnail: selectedCourseData?.thumbnail,
          coursePrice: selectedCourseData?.price
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
      } else {
        alert('Failed to send announcements')
      }
    } catch (error) {
      console.error('Course announcement error:', error)
      alert('Failed to send announcements')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductAnnouncement = async () => {
    if (selectedProducts.length === 0) {
      alert('Please select at least one product')
      return
    }

    const selectedProductsData = products.filter(p => selectedProducts.includes(p.id)).map(p => ({
      id: p.id,
      name: p.name,
      price: p.price,
      image: p.variants?.[0]?.images?.[0] || p.images?.[0]
    }))

    setIsLoading(true)
    try {
      const response = await fetch('/api/admin/product-announcements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          productIds: selectedProducts,
          sendToAll: sendToAllProducts,
          productsData: selectedProductsData
        })
      })

      if (response.ok) {
        const result = await response.json()
        alert(result.message)
      } else {
        alert('Failed to send announcements')
      }
    } catch (error) {
      console.error('Product announcement error:', error)
      alert('Failed to send announcements')
    } finally {
      setIsLoading(false)
    }
  }

  const handleProductSelect = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId)
      } else if (prev.length < 3) {
        return [...prev, productId]
      }
      return prev
    })
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-16 pb-20">
      <div className="mx-0 border-0 md:mx-6 md:border md:border-gray-200 dark:md:border-gray-800 rounded-none md:rounded-2xl bg-white dark:bg-black overflow-hidden">
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center gap-3 mb-6">
            <Mail className="w-8 h-8 text-[#a0303f] dark:text-[#ff6b6b]" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Notifications</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage automated email campaigns and notifications</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'campaigns'
                    ? 'border-[#a0303f] dark:border-[#ff6b6b] text-[#a0303f] dark:text-[#ff6b6b]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Send className="w-4 h-4 inline mr-2" />
                Email Campaigns
              </button>
              <button
                onClick={() => setActiveTab('recipients')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'recipients'
                    ? 'border-[#a0303f] dark:border-[#ff6b6b] text-[#a0303f] dark:text-[#ff6b6b]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <List className="w-4 h-4 inline mr-2" />
                Email Recipients
              </button>
              <button
                onClick={() => setActiveTab('templates')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'templates'
                    ? 'border-[#a0303f] dark:border-[#ff6b6b] text-[#a0303f] dark:text-[#ff6b6b]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <Edit className="w-4 h-4 inline mr-2" />
                Email Templates
              </button>
            </nav>
          </div>

          {activeTab === 'campaigns' && (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Announcements */}
            <Card className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <BookOpen className="w-5 h-5 text-[#a0303f] dark:text-[#ff6b6b]" />
                  Course Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="course-select" className="text-gray-700 dark:text-gray-300">Select Course</Label>
                  {loadingCourses ? (
                    <div className="space-y-2">
                      {Array.from({ length: 2 }).map((_, index) => (
                        <div key={index} className="p-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-16 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-32 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-24"></div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {courses.map(course => (
                        <div 
                          key={course.id} 
                          onClick={() => setSelectedCourse(course.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedCourse === course.id
                              ? 'border-[#a0303f] dark:border-[#ff6b6b] bg-[#a0303f]/5 dark:bg-[#ff6b6b]/5'
                              : 'border-gray-300 dark:border-gray-600 hover:border-[#a0303f] dark:hover:border-[#ff6b6b]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {course.thumbnail ? (
                              <img 
                                src={course.thumbnail} 
                                alt={course.title}
                                className="w-16 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-16 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <BookOpen className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{course.title}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">₹{course.price}</p>
                            </div>
                            {selectedCourse === course.id && (
                              <div className="w-5 h-5 bg-[#a0303f] dark:bg-[#ff6b6b] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="send-to-all" 
                    checked={sendToAllCourses}
                    onChange={(e) => setSendToAllCourses(e.target.checked)}
                    className="w-4 h-4 text-[#a0303f] dark:text-[#ff6b6b] border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 rounded focus:ring-[#a0303f] dark:focus:ring-[#ff6b6b]"
                  />
                  <Label htmlFor="send-to-all" className="text-gray-700 dark:text-gray-300">
                    Send to all users (otherwise only existing customers)
                  </Label>
                </div>

                <Button 
                  onClick={handleCourseAnnouncement}
                  disabled={isLoading || !selectedCourse}
                  className="w-full bg-[#a0303f] hover:bg-[#8a2a37] dark:bg-[#ff6b6b] dark:hover:bg-[#e55a5a] text-white"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sending...' : 'Send Course Announcement'}
                </Button>
              </CardContent>
            </Card>

            {/* Product Announcements */}
            <Card className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                  <Gift className="w-5 h-5 text-[#ff6b6b]" />
                  Product Announcements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-gray-700 dark:text-gray-300">Select Products (Max 3)</Label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {loadingProducts ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <div key={index} className="p-3 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-gray-300 dark:bg-gray-600 rounded"></div>
                            <div className="flex-1">
                              <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : Array.isArray(products) && products.length > 0 ? (
                      products.map(product => (
                        <div 
                          key={product.id} 
                          onClick={() => handleProductSelect(product.id)}
                          className={`p-3 border rounded-lg cursor-pointer transition-all ${
                            selectedProducts.includes(product.id)
                              ? 'border-[#ff6b6b] bg-[#ff6b6b]/5'
                              : selectedProducts.length >= 3 && !selectedProducts.includes(product.id)
                              ? 'border-gray-200 dark:border-gray-700 opacity-50 cursor-not-allowed'
                              : 'border-gray-300 dark:border-gray-600 hover:border-[#ff6b6b]'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            {(product.variants?.[0]?.images?.[0] || product.images?.[0]) ? (
                              <img 
                                src={product.variants?.[0]?.images?.[0] || product.images[0]} 
                                alt={product.name}
                                className="w-12 h-12 object-cover rounded"
                              />
                            ) : (
                              <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                                <Gift className="w-6 h-6 text-gray-400 dark:text-gray-500" />
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="font-medium text-gray-900 dark:text-white text-sm">{product.name}</h4>
                              <p className="text-xs text-gray-500 dark:text-gray-400">₹{product.price}</p>
                            </div>
                            {selectedProducts.includes(product.id) && (
                              <div className="w-5 h-5 bg-[#ff6b6b] rounded-full flex items-center justify-center">
                                <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                </svg>
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No products found</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Selected: {selectedProducts.length}/3
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="send-to-all-products"
                    checked={sendToAllProducts}
                    onChange={(e) => setSendToAllProducts(e.target.checked)}
                    className="w-4 h-4 text-[#ff6b6b] border-gray-300 dark:border-gray-600 bg-white dark:bg-zinc-900 rounded focus:ring-[#ff6b6b]"
                  />
                  <Label htmlFor="send-to-all-products" className="text-gray-700 dark:text-gray-300">
                    Send to all users (otherwise only existing customers)
                  </Label>
                </div>

                <Button 
                  onClick={handleProductAnnouncement}
                  disabled={isLoading || selectedProducts.length === 0}
                  className="w-full bg-[#ff6b6b] hover:bg-[#e55a5a] text-white"
                >
                  <Gift className="w-4 h-4 mr-2" />
                  {isLoading ? 'Sending...' : 'Send Product Announcement'}
                </Button>
              </CardContent>
            </Card>
            </div>

            {/* Email Templates Status */}
            <Card className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800">
              <CardHeader>
                <CardTitle className="text-gray-900 dark:text-white">Email Templates Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {[
                    { name: 'Welcome Email', status: 'Active', trigger: 'User Registration' },
                    { name: 'Purchase Confirmation', status: 'Active', trigger: 'Course Purchase' },
                    { name: 'Certificate Generated', status: 'Active', trigger: 'Certificate Download' },
                    { name: 'Course Completion', status: 'Active', trigger: 'All Videos Completed' },
                    { name: 'Password Reset', status: 'Active', trigger: 'Reset Request' },
                    { name: 'Class Booking Confirmation', status: 'Active', trigger: 'Class Booking' },
                    { name: 'Admin Purchase Notification', status: 'Active', trigger: 'Course Purchase' },
                    { name: 'Admin Class Booking', status: 'Active', trigger: 'Class Booking' },
                    { name: 'Progress Milestone', status: 'Active', trigger: '25%, 50%, 75% Progress' },
                    { name: 'Course Completion Reminder', status: 'Active', trigger: 'Manual/Scheduled' },
                    { name: 'Payment Failed', status: 'Active', trigger: 'Failed Payment' },
                    { name: 'New Course Announcement', status: 'Active', trigger: 'Manual' },
                    { name: 'Contact Form Submission', status: 'Active', trigger: 'Contact Form' },
                    { name: 'Custom Song Emails', status: 'Active', trigger: 'Custom Song Orders' },
                    { name: 'Order Status Updates', status: 'Active', trigger: 'Shop Orders' },
                    { name: 'New Product Announcement', status: 'Active', trigger: 'Manual' }
                  ].map((template, index) => (
                    <div 
                      key={index} 
                      className="p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                      onClick={() => setActiveTab('templates')}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="font-medium text-sm text-gray-900 dark:text-white">{template.name}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-xs bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-2 py-1 rounded">
                            {template.status}
                          </span>
                          <Edit className="w-3 h-3 text-gray-400" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{template.trigger}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            </>
          )}

          {activeTab === 'recipients' && (
            <div className="space-y-6">
              {/* All Users */}
              <Card className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    <Users className="w-5 h-5 text-[#a0303f] dark:text-[#ff6b6b]" />
                    All Users ({loadingUsers ? '...' : users.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {loadingUsers ? (
                        Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 rounded-lg animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                              <div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        users.map((user, index) => (
                          <div key={user.id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#a0303f] dark:bg-[#ff6b6b] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {user.name?.charAt(0) || user.email?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{user.name || 'No Name'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{user.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Joined: {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Unknown'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {!loadingUsers && users.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No users found</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Customers Only */}
              <Card className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900 dark:text-white">
                    Customers Only ({loadingCustomers ? '...' : customers.length})
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {loadingCustomers ? (
                        Array.from({ length: 3 }).map((_, index) => (
                          <div key={index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 rounded-lg animate-pulse">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                              <div>
                                <div className="h-4 bg-gray-300 dark:bg-gray-600 rounded w-24 mb-1"></div>
                                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-16 mb-1"></div>
                              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                            </div>
                          </div>
                        ))
                      ) : (
                        customers.map((customer, index) => (
                          <div key={customer.id || index} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-zinc-900 rounded-lg">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-[#ff6b6b] rounded-full flex items-center justify-center text-white text-sm font-medium">
                                {customer.name?.charAt(0) || customer.email?.charAt(0) || 'C'}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">{customer.name || 'No Name'}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">{customer.email}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Purchases: {customer.purchaseCount || 0}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Last Purchase: {customer.lastPurchase ? new Date(customer.lastPurchase).toLocaleDateString() : 'Never'}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {!loadingCustomers && customers.length === 0 && (
                        <p className="text-center text-gray-500 dark:text-gray-400 py-8">No customers found</p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'templates' && (
            <div className="flex flex-col">
              {templates.length === 0 && !selectedTemplate ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Card key={i} className="bg-white dark:bg-zinc-950 animate-pulse">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-3">
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-32"></div>
                          <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                        </div>
                        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                        <div className="flex items-center justify-between">
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : selectedTemplate ? (
              <div className="h-full flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-6 flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedTemplate(null)}
                      className="text-gray-600 dark:text-gray-400"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </Button>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedTemplate?.name || 'Template'}</h2>
                  </div>
                  <Button
                    onClick={saveTemplate}
                    disabled={savingTemplate}
                    className="bg-green-600 hover:bg-green-700"
                    size="sm"
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {savingTemplate ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>

                {/* Editor Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[600px]">
                  {/* Editor Panel */}
                  <div className="flex flex-col min-h-0">
                    <Card className="flex-1 bg-white dark:bg-zinc-950 flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                          <Edit className="w-5 h-5" />
                          Template Editor
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 flex flex-col space-y-4 min-h-0">
                        {/* Subject Input */}
                        <div className="flex-shrink-0">
                          <Label className="text-gray-700 dark:text-gray-300">Subject Line</Label>
                          <Input
                            value={selectedTemplate?.subject || ''}
                            onChange={(e) => setSelectedTemplate({
                              ...selectedTemplate,
                              subject: e.target.value
                            })}
                            className="dark:bg-zinc-900 dark:border-zinc-700 mt-1"
                            placeholder="Email subject..."
                          />
                        </div>
                        
                        {/* HTML Editor */}
                        <div className="flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-gray-700 dark:text-gray-300">HTML Content</Label>
                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                              <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded">HTML</span>
                              <span>Lines: {(selectedTemplate?.htmlContent || '').split('\n').length}</span>
                            </div>
                          </div>
                          <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', height: '400px' }}>
                            <div className="flex h-full">
                              {/* Line Numbers */}
                              <div 
                                ref={(el) => {
                                  if (el) {
                                    const textarea = el.nextElementSibling;
                                    if (textarea) {
                                      const syncScroll = () => {
                                        el.scrollTop = textarea.scrollTop;
                                      };
                                      textarea.addEventListener('scroll', syncScroll);
                                      return () => textarea.removeEventListener('scroll', syncScroll);
                                    }
                                  }
                                }}
                                className="px-2 py-4 text-xs font-mono select-none min-w-[3rem] text-right overflow-hidden"
                                style={{
                                  backgroundColor: '#27272a',
                                  color: '#71717a',
                                  borderRight: '1px solid #3f3f46',
                                  height: '400px'
                                }}
                              >
                                {(selectedTemplate?.htmlContent || '').split('\n').map((_, index) => (
                                  <div key={index} className="leading-6">
                                    {index + 1}
                                  </div>
                                ))}
                              </div>
                              {/* Code Editor */}
                              <textarea
                                value={selectedTemplate?.htmlContent || ''}
                                onChange={(e) => setSelectedTemplate({
                                  ...selectedTemplate,
                                  htmlContent: e.target.value
                                })}
                                className="flex-1 p-4 font-mono text-sm resize-none border-0 [&]:!bg-zinc-900 [&]:!text-white"
                                style={{
                                  backgroundColor: '#18181b !important',
                                  color: '#ffffff !important',
                                  lineHeight: '1.5',
                                  tabSize: '2',
                                  fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace',
                                  outline: 'none',
                                  colorScheme: 'dark',
                                  height: '100%',
                                  overflowY: 'auto'
                                }}
                                placeholder="<!DOCTYPE html>\n<html>\n<head>\n  <title>Email Template</title>\n</head>\n<body>\n  <h1>Hello {{name}}!</h1>\n</body>\n</html>"
                                spellCheck={false}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Variables */}
                        <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg flex-shrink-0">
                          <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Available Variables</Label>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-1">
                            {selectedTemplate?.variables ? selectedTemplate.variables.map(v => (
                              <span key={v.name} className="bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded">
                                {`{{${v.name}}}`}
                              </span>
                            )) : null}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Preview Panel */}
                  <div className="flex flex-col min-h-0">
                    <Card className="flex-1 bg-white dark:bg-zinc-950 flex flex-col">
                      <CardHeader className="flex-shrink-0">
                        <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                          <Eye className="w-5 h-5" />
                          Live Preview
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="flex-1 p-0 min-h-0">
                        <div className="w-full h-full border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden m-4 mr-6 mb-6">
                          {renderTemplatePreview()}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              ) : (
                <div className="space-y-6">
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-gray-600 dark:text-gray-400">Click on any template to edit its content and variables</p>
                    <Button
                      onClick={() => {
                        if (confirm('Update all templates with new variables? This will overwrite existing templates.')) {
                          fetch('/api/admin/email-templates/seed', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ forceUpdate: true })
                          }).then(res => res.json()).then(result => {
                            alert(result.message)
                            fetchTemplates()
                          })
                        }
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      size="sm"
                    >
                      Update Templates
                    </Button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {templates.map((template) => (
                      <Card 
                        key={template.id} 
                        className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => setSelectedTemplate(template)}
                      >
                        <CardContent className="p-6">
                          <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                            <Edit className="w-4 h-4 text-gray-400" />
                          </div>
                          <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.subject}</p>
                          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                            <span>{template.variables.length} variables</span>
                            <span className={`px-2 py-1 rounded-full ${template.isActive ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-gray-100 dark:bg-gray-800'}`}>
                              {template.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}