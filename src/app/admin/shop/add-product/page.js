'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Upload, X, Plus, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import ImageUpload from '@/components/ImageUpload'

export default function AddProductPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState([])
  const [tags, setTags] = useState([])
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [showNewTag, setShowNewTag] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newTagName, setNewTagName] = useState('')
  const [newTagColor, setNewTagColor] = useState('#8B5CF6')
  const [openSections, setOpenSections] = useState({
    basic: true,
    variants: false,
    seo: false
  })

  useEffect(() => {
    document.title = 'Add New Product | Aaroh Admin'
    fetchCategories()
    fetchTags()
  }, [])

  const toggleSection = (section) => {
    setOpenSections({ ...openSections, [section]: !openSections[section] })
  }

  const fetchCategories = async () => {
    const res = await fetch('/api/shop/categories')
    const data = await res.json()
    setCategories(data.categories || [])
  }

  const fetchTags = async () => {
    const res = await fetch('/api/shop/tags')
    const data = await res.json()
    setTags(data.tags || [])
  }

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return
    const res = await fetch('/api/shop/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newCategoryName })
    })
    const data = await res.json()
    if (data.success) {
      setFormData({ ...formData, categoryId: data.category.id })
      setNewCategoryName('')
      setShowNewCategory(false)
      fetchCategories()
    }
  }

  const handleCreateTag = async () => {
    if (!newTagName.trim()) return
    const res = await fetch('/api/shop/tags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: newTagName, color: newTagColor })
    })
    const data = await res.json()
    if (data.success) {
      setFormData({ ...formData, tagIds: [...formData.tagIds, data.tag.id] })
      setNewTagName('')
      setNewTagColor('#8B5CF6')
      setShowNewTag(false)
      fetchTags()
    }
  }

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    categoryId: '',
    tagIds: [],
    images: [],
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '',
    variants: [{ name: 'Standard', price: null }]
  })

  const handleImageUpload = (url) => {
    setFormData({ ...formData, images: [...formData.images, url] })
  }

  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) })
  }

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { name: '', price: null }] })
  }

  const removeVariant = (index) => {
    if (formData.variants.length > 1) {
      setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    const response = await fetch('/api/shop/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    const data = await response.json()
    if (data.success) {
      router.push('/admin/shop')
    }
    setLoading(false)
  }

  return (
    <div className="p-8 pt-24 bg-gray-50 dark:bg-gray-950 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <Button onClick={() => router.back()} variant="ghost" className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Shop
        </Button>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Add New Product</h1>

        <form onSubmit={handleSubmit} className="grid md:grid-cols-3 gap-6">
          {/* Left: Form Sections */}
          <div className="md:col-span-2 space-y-4">
            {/* Basic Info */}
            <Card className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleSection('basic')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Basic Information</CardTitle>
                  {openSections.basic ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {openSections.basic && (
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Product Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      placeholder="e.g., QR Music Cushion"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                      placeholder="Describe your product..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="price">Price (₹) *</Label>
                    <Input
                      id="price"
                      type="number"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      placeholder="999"
                    />
                  </div>

                  <div>
                    <Label>Category *</Label>
                    {!showNewCategory ? (
                      <div className="flex gap-2">
                        <select
                          value={formData.categoryId}
                          onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                          className="flex-1 h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
                          required
                        >
                          <option value="">Select category</option>
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                        <Button type="button" variant="outline" onClick={() => setShowNewCategory(true)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="New category name"
                          value={newCategoryName}
                          onChange={(e) => setNewCategoryName(e.target.value)}
                        />
                        <Button type="button" onClick={handleCreateCategory}>Create</Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewCategory(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                  <div>
                    <Label>Tags</Label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {formData.tagIds.map((tagId) => {
                        const tag = tags.find(t => t.id === tagId)
                        return tag ? (
                          <span
                            key={tagId}
                            className="px-3 py-1 rounded-full text-white text-sm flex items-center gap-2"
                            style={{ backgroundColor: tag.color }}
                          >
                            {tag.name}
                            <button
                              type="button"
                              onClick={() => setFormData({ ...formData, tagIds: formData.tagIds.filter(id => id !== tagId) })}
                              className="hover:opacity-75"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ) : null
                      })}
                    </div>
                    {!showNewTag ? (
                      <div className="flex gap-2">
                        <select
                          onChange={(e) => {
                            if (e.target.value && !formData.tagIds.includes(e.target.value)) {
                              setFormData({ ...formData, tagIds: [...formData.tagIds, e.target.value] })
                            }
                            e.target.value = ''
                          }}
                          className="flex-1 h-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-gray-900 dark:text-white px-3 py-2"
                        >
                          <option value="">Add tag</option>
                          {tags.filter(t => !formData.tagIds.includes(t.id)).map((tag) => (
                            <option key={tag.id} value={tag.id}>{tag.name}</option>
                          ))}
                        </select>
                        <Button type="button" variant="outline" onClick={() => setShowNewTag(true)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="New tag name"
                          value={newTagName}
                          onChange={(e) => setNewTagName(e.target.value)}
                        />
                        <input
                          type="color"
                          value={newTagColor}
                          onChange={(e) => setNewTagColor(e.target.value)}
                          className="w-16 h-10 rounded border cursor-pointer"
                        />
                        <Button type="button" onClick={handleCreateTag}>Create</Button>
                        <Button type="button" variant="outline" onClick={() => setShowNewTag(false)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>

                </CardContent>
              )}
            </Card>

            {/* Variants */}
            <Card className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleSection('variants')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">Product Variants</CardTitle>
                  {openSections.variants ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {openSections.variants && (
                <CardContent className="space-y-4">
                  {formData.variants.map((variant, index) => (
                    <div key={index} className="flex gap-3">
                      <Input
                        placeholder="Variant name (e.g., Small, Medium, Large)"
                        value={variant.name}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[index].name = e.target.value
                          setFormData({ ...formData, variants: newVariants })
                        }}
                        required
                      />
                      <Input
                        type="number"
                        placeholder="Price override (optional)"
                        value={variant.price || ''}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[index].price = e.target.value ? parseFloat(e.target.value) : null
                          setFormData({ ...formData, variants: newVariants })
                        }}
                      />
                      {formData.variants.length > 1 && (
                        <Button type="button" variant="outline" size="icon" onClick={() => removeVariant(index)}>
                          <X className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button type="button" onClick={addVariant} variant="outline" className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Variant
                  </Button>
                </CardContent>
              )}
            </Card>

            {/* SEO */}
            <Card className="dark:bg-gray-900 dark:border-gray-800 overflow-hidden">
              <CardHeader
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                onClick={() => toggleSection('seo')}
              >
                <div className="flex items-center justify-between">
                  <CardTitle className="dark:text-white">SEO Settings</CardTitle>
                  {openSections.seo ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </CardHeader>
              {openSections.seo && (
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="seoTitle">SEO Title</Label>
                    <Input
                      id="seoTitle"
                      value={formData.seoTitle}
                      onChange={(e) => setFormData({ ...formData, seoTitle: e.target.value })}
                      placeholder="Leave empty to use product name"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoDescription">SEO Description</Label>
                    <Textarea
                      id="seoDescription"
                      value={formData.seoDescription}
                      onChange={(e) => setFormData({ ...formData, seoDescription: e.target.value })}
                      rows={3}
                      placeholder="Leave empty to use product description"
                    />
                  </div>

                  <div>
                    <Label htmlFor="seoKeywords">SEO Keywords</Label>
                    <Input
                      id="seoKeywords"
                      value={formData.seoKeywords}
                      onChange={(e) => setFormData({ ...formData, seoKeywords: e.target.value })}
                      placeholder="music gift, custom cushion, personalized"
                    />
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Actions */}
            <div className="flex gap-4">
              <Button type="submit" disabled={loading} className="flex-1 py-6 text-lg">
                {loading ? 'Creating...' : 'Create Product'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} className="py-6">
                Cancel
              </Button>
            </div>
          </div>

          {/* Right: Image Gallery - Fixed */}
          <div className="md:col-span-1">
            <div className="sticky top-24">
              <Card className="dark:bg-gray-900 dark:border-gray-800">
                <CardHeader>
                  <CardTitle className="dark:text-white">Product Gallery</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {formData.images.length === 0 ? (
                    <ImageUpload onImageUpload={handleImageUpload} />
                  ) : (
                    <>
                      {/* Main Image */}
                      <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden group">
                        <img src={formData.images[0]} alt="Main" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(0)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Thumbnails + Upload Box */}
                      <div className="grid grid-cols-4 gap-2">
                        {formData.images.slice(1).map((img, index) => (
                          <div key={index + 1} className="relative group aspect-square">
                            <img src={img} alt={`${index + 2}`} className="w-full h-full object-cover rounded-lg" />
                            <button
                              type="button"
                              onClick={() => removeImage(index + 1)}
                              className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                        {/* Dotted Upload Box */}
                        <div className="aspect-square border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg flex items-center justify-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer">
                          <ImageUpload compact onImageUpload={handleImageUpload} />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
