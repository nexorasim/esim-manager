import { useState, useEffect } from 'react'
import Head from 'next/head'
import { FileText, Plus, Search, Edit, Trash2, Loader2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface ProfileTemplate {
  _id: string
  name: string
  description?: string
  provider: string
  profileClass: 'operational' | 'test' | 'provisioning'
  defaultNotes?: string
  isActive: boolean
  createdAt: string
}

export default function Templates() {
  const [templates, setTemplates] = useState<ProfileTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ProfileTemplate | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    description: '',
    provider: 'NexoraSIM',
    profileClass: 'operational' as 'operational' | 'test' | 'provisioning',
    defaultNotes: ''
  })

  useEffect(() => {
    loadTemplates()
  }, [])

  const loadTemplates = async () => {
    try {
      const response = await api.get('/api/templates')
      setTemplates(response.data)
    } catch (error) {
      toast.error('Failed to load templates')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name) {
      toast.error('Template name is required')
      return
    }
    
    setFormLoading(true)
    try {
      if (editingTemplate) {
        await api.put(`/api/templates/${editingTemplate._id}`, form)
        toast.success('Template updated')
      } else {
        await api.post('/api/templates', form)
        toast.success('Template created')
      }
      await loadTemplates()
      handleCloseModal()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (template: ProfileTemplate) => {
    setEditingTemplate(template)
    setForm({
      name: template.name,
      description: template.description || '',
      provider: template.provider,
      profileClass: template.profileClass,
      defaultNotes: template.defaultNotes || ''
    })
    setShowModal(true)
  }

  const handleDelete = async (template: ProfileTemplate) => {
    if (!confirm(`Are you sure you want to delete "${template.name}"?`)) return
    
    try {
      await api.delete(`/api/templates/${template._id}`)
      toast.success('Template deleted')
      await loadTemplates()
    } catch (error) {
      toast.error('Failed to delete template')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingTemplate(null)
    setForm({ name: '', description: '', provider: 'NexoraSIM', profileClass: 'operational', defaultNotes: '' })
  }

  const filteredTemplates = templates.filter(t =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.provider.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getClassBadge = (profileClass: string) => {
    const styles: Record<string, string> = {
      operational: 'badge-success',
      test: 'badge-warning',
      provisioning: 'badge-info'
    }
    return styles[profileClass] || 'badge-info'
  }

  return (
    <>
      <Head>
        <title>Profile Templates | NexoraSIM</title>
      </Head>

      <div className="space-y-6 animate-fade-in" data-testid="templates-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Profile Templates</h1>
            <p className="text-muted-foreground mt-1">Create reusable profile configurations</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
            data-testid="create-template-btn"
          >
            <Plus className="w-4 h-4" />
            Create Template
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
            data-testid="template-search-input"
          />
        </div>

        {/* Templates list */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredTemplates.length === 0 ? (
          <div className="card text-center py-12" data-testid="no-templates-message">
            <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No matching templates' : 'No templates yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Create your first template to get started'}
            </p>
            {!searchQuery && (
              <button onClick={() => setShowModal(true)} className="btn-primary">
                Create Your First Template
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div 
                key={template._id} 
                className="card"
                data-testid={`template-card-${template._id}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{template.name}</h3>
                    <p className="text-sm text-muted-foreground">{template.provider}</p>
                  </div>
                  <span className={`badge ${getClassBadge(template.profileClass)}`}>
                    {template.profileClass}
                  </span>
                </div>

                {template.description && (
                  <p className="text-sm text-muted-foreground mb-4">{template.description}</p>
                )}

                <p className="text-xs text-muted-foreground mb-4">
                  Created: {format(new Date(template.createdAt), 'MMM d, yyyy')}
                </p>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  <button
                    onClick={() => handleEdit(template)}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2"
                    data-testid={`edit-template-btn-${template._id}`}
                  >
                    <Edit className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(template)}
                    className="btn-secondary p-2 text-destructive hover:bg-destructive/10"
                    title="Delete"
                    data-testid={`delete-template-btn-${template._id}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
              {editingTemplate ? 'Edit Template' : 'Create Template'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Template Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="Business Travel Profile"
                  data-testid="template-name-input"
                />
              </div>
              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="input-field h-20 resize-none"
                  placeholder="Optional description"
                />
              </div>
              <div>
                <label className="label">Provider</label>
                <input
                  type="text"
                  value={form.provider}
                  onChange={(e) => setForm({ ...form, provider: e.target.value })}
                  className="input-field"
                />
              </div>
              <div>
                <label className="label">Profile Class</label>
                <select
                  value={form.profileClass}
                  onChange={(e) => setForm({ ...form, profileClass: e.target.value as any })}
                  className="input-field"
                >
                  <option value="operational">Operational</option>
                  <option value="test">Test</option>
                  <option value="provisioning">Provisioning</option>
                </select>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  data-testid="template-submit-btn"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingTemplate ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
