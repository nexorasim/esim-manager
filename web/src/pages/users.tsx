import { useState, useEffect } from 'react'
import Head from 'next/head'
import { Users, Plus, Search, Edit, Trash2, ShieldCheck, Loader2 } from 'lucide-react'
import api from '../services/api'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'operator' | 'viewer'
  isActive: boolean
  lastLogin?: string
  createdAt: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'viewer' as 'admin' | 'operator' | 'viewer',
    isActive: true
  })

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      const response = await api.get('/api/users')
      setUsers(response.data)
    } catch (error) {
      toast.error('Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!editingUser && (!form.name || !form.email || !form.password)) {
      toast.error('Please fill in all required fields')
      return
    }
    
    setFormLoading(true)
    try {
      if (editingUser) {
        await api.put(`/api/users/${editingUser.id}`, {
          name: form.name,
          role: form.role,
          isActive: form.isActive
        })
        toast.success('User updated')
      } else {
        await api.post('/api/users', form)
        toast.success('User created')
      }
      await loadUsers()
      handleCloseModal()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Operation failed')
    } finally {
      setFormLoading(false)
    }
  }

  const handleEdit = (user: User) => {
    setEditingUser(user)
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      isActive: user.isActive
    })
    setShowModal(true)
  }

  const handleDelete = async (user: User) => {
    if (!confirm(`Are you sure you want to delete "${user.name}"?`)) return
    
    try {
      await api.delete(`/api/users/${user.id}`)
      toast.success('User deleted')
      await loadUsers()
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to delete user')
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingUser(null)
    setForm({ name: '', email: '', password: '', role: 'viewer', isActive: true })
  }

  const filteredUsers = users.filter(u =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleBadge = (role: string) => {
    const styles: Record<string, string> = {
      admin: 'badge-error',
      operator: 'badge-warning',
      viewer: 'badge-info'
    }
    return styles[role] || 'badge-info'
  }

  return (
    <>
      <Head>
        <title>User Management | NexoraSIM</title>
      </Head>

      <div className="space-y-6 animate-fade-in" data-testid="users-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">User Management</h1>
            <p className="text-muted-foreground mt-1">Manage user accounts and permissions</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary inline-flex items-center gap-2"
            data-testid="create-user-btn"
          >
            <Plus className="w-4 h-4" />
            Add User
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
            data-testid="user-search-input"
          />
        </div>

        {/* Users table */}
        {loading ? (
          <div className="card">
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 animate-pulse">
                  <div className="w-10 h-10 bg-muted rounded-full" />
                  <div className="flex-1">
                    <div className="h-4 bg-muted rounded w-1/4 mb-2" />
                    <div className="h-3 bg-muted rounded w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="card text-center py-12" data-testid="no-users-message">
            <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No matching users' : 'No users yet'}
            </h3>
            <p className="text-muted-foreground">
              {searchQuery ? 'Try adjusting your search' : 'Add your first user to get started'}
            </p>
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Login</th>
                  <th>Created</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} data-testid={`user-row-${user.id}`}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.name}</p>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getRoleBadge(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>
                      {user.isActive ? (
                        <span className="badge badge-success">Active</span>
                      ) : (
                        <span className="badge badge-error">Inactive</span>
                      )}
                    </td>
                    <td>
                      <span className="text-muted-foreground">
                        {user.lastLogin ? format(new Date(user.lastLogin), 'MMM d, HH:mm') : 'Never'}
                      </span>
                    </td>
                    <td>
                      <span className="text-muted-foreground">
                        {format(new Date(user.createdAt), 'MMM d, yyyy')}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-md transition-colors"
                          title="Edit"
                          data-testid={`edit-user-btn-${user.id}`}
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-md transition-colors"
                          title="Delete"
                          data-testid={`delete-user-btn-${user.id}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
              {editingUser ? 'Edit User' : 'Add New User'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="label">Full Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="input-field"
                  placeholder="John Doe"
                  data-testid="user-name-input"
                />
              </div>
              {!editingUser && (
                <>
                  <div>
                    <label className="label">Email Address</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="input-field"
                      placeholder="john@company.com"
                      data-testid="user-email-input"
                    />
                  </div>
                  <div>
                    <label className="label">Password</label>
                    <input
                      type="password"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input-field"
                      placeholder="Min 6 characters"
                      data-testid="user-password-input"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="label">Role</label>
                <select
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value as any })}
                  className="input-field"
                  data-testid="user-role-select"
                >
                  <option value="viewer">Viewer (Read-only)</option>
                  <option value="operator">Operator (Manage profiles)</option>
                  <option value="admin">Administrator (Full access)</option>
                </select>
              </div>
              {editingUser && (
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
                  />
                  <label htmlFor="isActive" className="text-sm text-foreground">Account is active</label>
                </div>
              )}
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={handleCloseModal} className="btn-secondary flex-1">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={formLoading}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                  data-testid="user-submit-btn"
                >
                  {formLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editingUser ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
