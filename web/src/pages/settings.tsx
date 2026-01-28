import { useState } from 'react'
import Head from 'next/head'
import { Save, User, Lock, Bell, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import api from '../services/api'
import toast from 'react-hot-toast'

export default function Settings() {
  const { user, refreshUser } = useAuth()
  const [loading, setLoading] = useState(false)
  
  const [profile, setProfile] = useState({
    name: user?.name || ''
  })
  
  const [password, setPassword] = useState({
    current: '',
    new: '',
    confirm: ''
  })

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile.name) {
      toast.error('Name is required')
      return
    }
    
    setLoading(true)
    try {
      await api.put('/api/auth/me', { name: profile.name })
      await refreshUser()
      toast.success('Profile updated')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Update failed')
    } finally {
      setLoading(false)
    }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!password.current || !password.new || !password.confirm) {
      toast.error('Please fill in all password fields')
      return
    }
    
    if (password.new !== password.confirm) {
      toast.error('New passwords do not match')
      return
    }
    
    if (password.new.length < 6) {
      toast.error('Password must be at least 6 characters')
      return
    }
    
    setLoading(true)
    try {
      await api.put('/api/auth/me', {
        currentPassword: password.current,
        newPassword: password.new
      })
      setPassword({ current: '', new: '', confirm: '' })
      toast.success('Password changed successfully')
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Password change failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Head>
        <title>Settings | NexoraSIM</title>
      </Head>

      <div className="space-y-8 animate-fade-in max-w-2xl" data-testid="settings-page">
        <div>
          <h1 className="font-heading text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your account preferences</p>
        </div>

        {/* Profile Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Profile</h2>
              <p className="text-sm text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input
                type="text"
                value={profile.name}
                onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                className="input-field"
                data-testid="settings-name-input"
              />
            </div>
            <div>
              <label className="label">Email Address</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="input-field bg-muted/50 cursor-not-allowed"
              />
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="label">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="input-field bg-muted/50 cursor-not-allowed capitalize"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-primary flex items-center gap-2"
              data-testid="save-profile-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
          </form>
        </div>

        {/* Password Settings */}
        <div className="card">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
              <Lock className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-heading text-lg font-semibold text-foreground">Security</h2>
              <p className="text-sm text-muted-foreground">Change your password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div>
              <label className="label">Current Password</label>
              <input
                type="password"
                value={password.current}
                onChange={(e) => setPassword({ ...password, current: e.target.value })}
                className="input-field"
                data-testid="current-password-input"
              />
            </div>
            <div>
              <label className="label">New Password</label>
              <input
                type="password"
                value={password.new}
                onChange={(e) => setPassword({ ...password, new: e.target.value })}
                className="input-field"
                placeholder="Min 6 characters"
                data-testid="new-password-input"
              />
            </div>
            <div>
              <label className="label">Confirm New Password</label>
              <input
                type="password"
                value={password.confirm}
                onChange={(e) => setPassword({ ...password, confirm: e.target.value })}
                className="input-field"
                data-testid="confirm-password-input"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="btn-secondary flex items-center gap-2"
              data-testid="change-password-btn"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
              Change Password
            </button>
          </form>
        </div>
      </div>
    </>
  )
}
