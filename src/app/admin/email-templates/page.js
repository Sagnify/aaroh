"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Mail, Edit, Eye, Save, Plus, ArrowLeft } from 'lucide-react'

export default function EmailTemplates() {
  const [templates, setTemplates] = useState([])
  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [templateLoading, setTemplateLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [seeding, setSeeding] = useState(false)
  const [dbStatus, setDbStatus] = useState(null)

  useEffect(() => {
    checkDatabaseStatus()
    fetchTemplates()
  }, [])

  const checkDatabaseStatus = async () => {
    try {
      const response = await fetch('/api/test')
      const data = await response.json()
      setDbStatus(data)
      console.log('Database status:', data)
    } catch (error) {
      console.error('Failed to check database status:', error)
      setDbStatus({ success: false, error: error.message })
    }
  }

  const fetchTemplates = async () => {
    try {
      const response = await fetch('/api/admin/email-templates')
      if (response.ok) {
        const data = await response.json()
        setTemplates(data)
        
        // If no templates exist, automatically seed them
        if (data.length === 0) {
          console.log('No templates found, attempting to seed...')
          await seedTemplates(false) // Silent seeding
        }
      } else {
        const errorData = await response.json()
        console.error('API Error:', errorData)
        alert(`Failed to fetch templates: ${errorData.details || errorData.error}`)
      }
    } catch (error) {
      console.error('Failed to fetch templates:', error)
      alert(`Network error: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  const saveTemplate = async () => {
    if (!selectedTemplate) return
    
    setSaving(true)
    try {
      const response = await fetch(`/api/admin/email-templates/${selectedTemplate.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedTemplate)
      })
      
      if (response.ok) {
        await fetchTemplates()
        alert('Template saved successfully!')
      }
    } catch (error) {
      console.error('Failed to save template:', error)
      alert('Failed to save template')
    } finally {
      setSaving(false)
    }
  }

  const seedTemplates = async (showAlert = true) => {
    setSeeding(true)
    try {
      const response = await fetch('/api/admin/email-templates/seed', {
        method: 'POST'
      })
      if (response.ok) {
        const result = await response.json()
        // Fetch templates again to update the UI
        const templatesResponse = await fetch('/api/admin/email-templates')
        if (templatesResponse.ok) {
          const data = await templatesResponse.json()
          setTemplates(data)
        }
        if (showAlert) {
          alert(result.message || 'Templates seeded successfully!')
        }
      }
    } catch (error) {
      console.error('Failed to seed templates:', error)
      if (showAlert) {
        alert('Failed to seed templates')
      }
    } finally {
      setSeeding(false)
    }
  }

  const renderPreview = () => {
    if (!selectedTemplate) return null
    
    let html = selectedTemplate.htmlContent
    selectedTemplate.variables.forEach(variable => {
      const placeholder = `{{${variable.name}}}`
      html = html.replaceAll(placeholder, variable.example || variable.name)
    })
    
    return (
      <div className="w-full h-full">
        <iframe
          srcDoc={html}
          className="w-full h-full border-0 rounded-lg"
          style={{ minHeight: '500px' }}
        />
      </div>
    )
  }

  if (selectedTemplate) {
    if (templateLoading) {
      return (
        <div className="min-h-screen bg-white dark:bg-black pt-16">
          <div className="mx-0 border-0 md:mx-6 md:border md:border-gray-200 dark:md:border-gray-800 rounded-none md:rounded-2xl bg-white dark:bg-black overflow-hidden">
            <div className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  <div className="w-8 h-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  <div>
                    <div className="w-48 h-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse mb-2"></div>
                    <div className="w-32 h-4 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="w-24 h-8 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
              </div>
              <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
                <div className="w-full lg:w-1/2">
                  <Card className="h-full bg-white dark:bg-zinc-950">
                    <CardHeader>
                      <div className="w-32 h-6 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="w-full h-10 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                      <div className="w-full flex-1 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" style={{minHeight: '300px'}}></div>
                    </CardContent>
                  </Card>
                </div>
                <div className="w-full lg:w-1/2">
                  <Card className="h-full bg-white dark:bg-zinc-950">
                    <CardHeader>
                      <div className="w-24 h-6 bg-gray-200 dark:bg-zinc-700 rounded animate-pulse"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="w-full h-full bg-gray-200 dark:bg-zinc-700 rounded animate-pulse" style={{minHeight: '400px'}}></div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="min-h-screen bg-white dark:bg-black pt-16 pb-20">
        <div className="mx-0 border-0 md:mx-6 md:border md:border-gray-200 dark:md:border-gray-800 rounded-none md:rounded-2xl bg-white dark:bg-black overflow-hidden">
          <div className="p-4 md:p-6">
            <div className="flex items-center justify-between mb-6">
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
                <Mail className="w-8 h-8 text-[#a0303f] dark:text-[#ff6b6b]" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedTemplate.name}</h1>
                  <p className="text-gray-600 dark:text-gray-400">Edit email template</p>
                </div>
              </div>
              <Button
                onClick={saveTemplate}
                disabled={saving}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <Save className="w-4 h-4 mr-2" />
                {saving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 h-[calc(100vh-200px)]">
              {/* Editor Panel */}
              <div className="w-full lg:w-1/2">
                <Card className="h-full bg-white dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Edit className="w-5 h-5" />
                      Template Editor
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full space-y-4">
                    <div>
                      <Label className="text-gray-700 dark:text-gray-300">Subject Line</Label>
                      <Input
                        value={selectedTemplate.subject}
                        onChange={(e) => setSelectedTemplate({
                          ...selectedTemplate,
                          subject: e.target.value
                        })}
                        className="dark:bg-zinc-900 dark:border-zinc-700"
                        placeholder="Email subject..."
                      />
                    </div>
                    
                    <div className="flex flex-col">
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-700 dark:text-gray-300">HTML Content</Label>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-zinc-800 rounded">HTML</span>
                          <span>Lines: {(selectedTemplate.htmlContent || '').split('\n').length}</span>
                        </div>
                      </div>
                      <div className="rounded-lg overflow-hidden" style={{ backgroundColor: '#18181b', border: '1px solid #3f3f46', height: '400px' }}>
                        <div className="flex h-full">
                          {/* Line Numbers */}
                          <div 
                            className="px-2 py-4 text-xs font-mono select-none min-w-[3rem] text-right overflow-y-auto"
                            style={{
                              backgroundColor: '#27272a',
                              color: '#71717a',
                              borderRight: '1px solid #3f3f46',
                              height: '400px'
                            }}
                          >
                            {(selectedTemplate.htmlContent || '').split('\n').map((_, index) => (
                              <div key={index} className="leading-6">
                                {index + 1}
                              </div>
                            ))}
                          </div>
                          {/* Code Editor */}
                          <textarea
                            value={selectedTemplate.htmlContent}
                            onChange={(e) => setSelectedTemplate({
                              ...selectedTemplate,
                              htmlContent: e.target.value
                            })}
                            className="flex-1 p-4 font-mono text-sm resize-none border-0"
                            style={{
                              background: '#18181b',
                              color: '#ffffff',
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

                    <div className="bg-gray-50 dark:bg-zinc-800 p-3 rounded-lg">
                      <Label className="text-gray-700 dark:text-gray-300 text-sm font-medium">Available Variables</Label>
                      <div className="text-xs text-gray-600 dark:text-gray-400 mt-1 flex flex-wrap gap-1">
                        {selectedTemplate.variables.map(v => (
                          <span key={v.name} className="bg-gray-200 dark:bg-zinc-700 px-2 py-1 rounded">
                            {`{{${v.name}}}`}
                          </span>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Preview Panel */}
              <div className="w-full lg:w-1/2">
                <Card className="h-full bg-white dark:bg-zinc-950">
                  <CardHeader>
                    <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
                      <Eye className="w-5 h-5" />
                      Live Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="h-full p-0">
                    <div className="w-full h-full border border-gray-200 dark:border-zinc-700 rounded-lg overflow-hidden">
                      {renderPreview()}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black pt-16 pb-20">
      <div className="mx-0 border-0 md:mx-6 md:border md:border-gray-200 dark:md:border-gray-800 rounded-none md:rounded-2xl bg-white dark:bg-black overflow-hidden">
        <div className="p-4 md:p-6 space-y-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Mail className="w-8 h-8 text-[#a0303f] dark:text-[#ff6b6b]" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Templates</h1>
                <p className="text-gray-600 dark:text-gray-400">Manage and customize email templates</p>
                {dbStatus && (
                  <div className={`text-xs mt-1 px-2 py-1 rounded ${
                    dbStatus.success 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {dbStatus.success 
                      ? `DB Connected • ${dbStatus.emailTemplateCount} templates in DB`
                      : `DB Error: ${dbStatus.error}`
                    }
                  </div>
                )}
              </div>
            </div>
            <Button
              onClick={seedTemplates}
              disabled={seeding}
              className="bg-[#a0303f] hover:bg-[#8a2a37]"
            >
              <Plus className="w-4 h-4 mr-2" />
              {seeding ? 'Seeding...' : 'Seed Templates'}
            </Button>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-white dark:bg-zinc-950 animate-pulse">
                  <CardContent className="p-6">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : templates.length === 0 ? (
            <div className="text-center py-12">
              <Mail className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Email Templates Found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">Get started by creating your first email template</p>
              <Button
                onClick={() => seedTemplates(true)}
                disabled={seeding}
                className="bg-[#a0303f] hover:bg-[#8a2a37]"
              >
                <Plus className="w-4 h-4 mr-2" />
                {seeding ? 'Creating Templates...' : 'Create Default Templates'}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {templates.map((template) => (
                <Card 
                  key={template.id} 
                  className="bg-white dark:bg-zinc-950 border-gray-200 dark:border-gray-800 hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => {
                    setTemplateLoading(true)
                    setSelectedTemplate(template)
                    setTimeout(() => setTemplateLoading(false), 500)
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{template.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        template.isActive 
                          ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' 
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
                      }`}>
                        {template.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{template.subject}</p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>{template.variables.length} variables</span>
                      <span>Updated {new Date(template.updatedAt).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}