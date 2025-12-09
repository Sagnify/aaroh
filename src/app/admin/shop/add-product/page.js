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
    variants: [{ name: 'Standard', price: null, images: [], isDefault: true }]
  })
  const [activeImageTab, setActiveImageTab] = useState('variant-0')


  const handleImageUpload = (url) => {
    const variantIndex = parseInt(activeImageTab.split('-')[1])
    const newVariants = [...formData.variants]
    if (!newVariants[variantIndex]) return
    if (!newVariants[variantIndex].images) newVariants[variantIndex].images = []
    newVariants[variantIndex].images = [...newVariants[variantIndex].images, url]
    setFormData({ ...formData, variants: newVariants })
  }

  const removeImage = (index) => {
    const variantIndex = parseInt(activeImageTab.split('-')[1])
    const newVariants = [...formData.variants]
    if (newVariants[variantIndex] && newVariants[variantIndex].images) {
      newVariants[variantIndex].images = newVariants[variantIndex].images.filter((_, i) => i !== index)
      setFormData({ ...formData, variants: newVariants })
    }
  }

  const addVariant = () => {
    setFormData({ ...formData, variants: [...formData.variants, { name: '', price: null, images: [] }] })
  }

  const removeVariant = (index) => {
    if (index > 0) { // Can't remove the first (main) variant
      setFormData({ ...formData, variants: formData.variants.filter((_, i) => i !== index) })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    console.log('Submitting form data:', formData)
    console.log('Variants being submitted:', formData.variants.map(v => ({ name: v.name, images: v.images })))
    
    const response = await fetch('/api/shop/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    })
    
    const data = await response.json()
    console.log('API response:', data)
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
                <CardContent className="space-y-6">
                  {/* Default Variant - Always Present */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <Label className="text-sm font-semibold text-blue-700 dark:text-blue-300">Default Variant (Always Present)</Label>
                    </div>
                    <div className="flex gap-3">
                      <Input
                        placeholder="Default variant name (e.g., Standard, Regular, Original)"
                        value={formData.variants[0]?.name || ''}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[0].name = e.target.value
                          setFormData({ ...formData, variants: newVariants })
                        }}
                        required
                        className="bg-white dark:bg-gray-800"
                      />
                      <Input
                        type="number"
                        placeholder="Price override (optional)"
                        value={formData.variants[0]?.price || ''}
                        onChange={(e) => {
                          const newVariants = [...formData.variants]
                          newVariants[0].price = e.target.value ? parseFloat(e.target.value) : null
                          setFormData({ ...formData, variants: newVariants })
                        }}
                        className="bg-white dark:bg-gray-800"
                      />
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">This is the main product variant. If no price is set, it uses the main product price.</p>
                  </div>

                  {/* Additional Variants */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <Label className="text-sm font-semibold text-gray-700 dark:text-gray-300">Additional Variants</Label>
                      <Button type="button" onClick={addVariant} variant="outline" size="sm">
                        <Plus className="w-4 h-4 mr-1" />
                        Add Variant
                      </Button>
                    </div>
                    
                    {formData.variants.length > 1 ? (
                      <div className="space-y-3">
                        {formData.variants.slice(1).map((variant, index) => (
                          <div key={index + 1} className="flex gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <Input
                              placeholder="Variant name (e.g., Small, Medium, Large)"
                              value={variant.name}
                              onChange={(e) => {
                                const newVariants = [...formData.variants]
                                newVariants[index + 1].name = e.target.value
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
                                newVariants[index + 1].price = e.target.value ? parseFloat(e.target.value) : null
                                setFormData({ ...formData, variants: newVariants })
                              }}
                            />
                            <Button type="button" variant="outline" size="icon" onClick={() => removeVariant(index + 1)}>
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600">
                        <p className="text-sm">No additional variants added</p>
                        <p className="text-xs mt-1">Click "Add Variant" to create size, color, or other options</p>
                      </div>
                    )}
                  </div>
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
                  {/* Image Tabs */}
                  <div className="flex gap-1 mt-4 overflow-x-auto">
                    {formData.variants.map((variant, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setActiveImageTab(`variant-${index}`)}
                        className={`px-3 py-1 text-sm rounded transition-colors whitespace-nowrap ${
                          activeImageTab === `variant-${index}`
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {variant.name || `Variant ${index + 1}`} ({variant.images?.length || 0})
                      </button>
                    ))}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {(() => {
                    const currentImages = formData.variants[parseInt(activeImageTab.split('-')[1])]?.images || []
                    
                    return currentImages.length === 0 ? (
                      <ImageUpload onImageUpload={handleImageUpload} />
                    ) : (
                      <>
                        {/* Main Image */}
                        <div className="relative aspect-square bg-gradient-to-br from-blue-100 to-teal-100 dark:from-gray-800 dark:to-gray-700 rounded-lg overflow-hidden group">
                          <img src={currentImages[0]} alt="Main" className="w-full h-full object-cover" />
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
                          {currentImages.slice(1).map((img, index) => (
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
                    )
                  })()} 
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
