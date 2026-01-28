import { useState, useEffect } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { 
  Smartphone, 
  MonitorSmartphone, 
  Wifi, 
  QrCode, 
  Activity,
  ArrowUpRight,
  Clock,
  AlertTriangle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { profileService, ProfileStats } from '../services/profile-service'
import { deviceService, DeviceStats } from '../services/device-service'
import { auditService, AuditLog } from '../services/audit-service'
import { format } from 'date-fns'

export default function Dashboard() {
  const { user } = useAuth()
  const [profileStats, setProfileStats] = useState<ProfileStats>({ total: 0, active: 0, inactive: 0, pending: 0 })
  const [deviceStats, setDeviceStats] = useState<DeviceStats>({ total: 0, online: 0, offline: 0 })
  const [recentActivity, setRecentActivity] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      const [profiles, devices, activity] = await Promise.all([
        profileService.getStats(),
        deviceService.getStats(),
        auditService.getRecentActivity(5)
      ])
      setProfileStats(profiles)
      setDeviceStats(devices)
      setRecentActivity(activity)
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getActivityIcon = (action: string) => {
    if (action.includes('profile')) return Smartphone
    if (action.includes('device')) return MonitorSmartphone
    if (action.includes('user') || action.includes('login')) return Activity
    return Activity
  }

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      'user.login': 'User logged in',
      'user.logout': 'User logged out',
      'user.register': 'New user registered',
      'user.failed_login': 'Failed login attempt',
      'profile.create': 'Profile created',
      'profile.activate': 'Profile activated',
      'profile.deactivate': 'Profile deactivated',
      'profile.delete': 'Profile deleted',
      'device.add': 'Device added',
      'device.remove': 'Device removed',
      'device.connect': 'Device connected',
      'device.disconnect': 'Device disconnected',
    }
    return labels[action] || action.replace('.', ' ').replace('_', ' ')
  }

  return (
    <>
      <Head>
        <title>Dashboard | NexoraSIM</title>
      </Head>

      <div className="space-y-8 animate-fade-in" data-testid="dashboard-page">
        {/* Welcome section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground mt-1">
              Here is what is happening with your eSIM profiles
            </p>
          </div>
          <Link href="/profiles" className="btn-primary inline-flex items-center gap-2" data-testid="add-profile-button">
            <QrCode className="w-4 h-4" />
            Add Profile
          </Link>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="stat-card" data-testid="stat-total-profiles">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Total Profiles</p>
                <p className="stat-value">{loading ? '-' : profileStats.total}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Smartphone className="w-6 h-6 text-primary" />
              </div>
            </div>
            <Link href="/profiles" className="flex items-center gap-1 text-sm text-primary mt-4 hover:underline">
              View all <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="stat-card" data-testid="stat-active-profiles">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Active Profiles</p>
                <p className="stat-value text-success">{loading ? '-' : profileStats.active}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-success/10 flex items-center justify-center">
                <Wifi className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              {profileStats.total > 0 
                ? `${Math.round((profileStats.active / profileStats.total) * 100)}% of total`
                : 'No profiles yet'
              }
            </div>
          </div>

          <div className="stat-card" data-testid="stat-devices">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Connected Devices</p>
                <p className="stat-value">{loading ? '-' : deviceStats.online}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-info/10 flex items-center justify-center">
                <MonitorSmartphone className="w-6 h-6 text-info" />
              </div>
            </div>
            <Link href="/devices" className="flex items-center gap-1 text-sm text-primary mt-4 hover:underline">
              Manage devices <ArrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="stat-card" data-testid="stat-pending">
            <div className="flex items-center justify-between">
              <div>
                <p className="stat-label">Pending</p>
                <p className="stat-value text-warning">{loading ? '-' : profileStats.pending}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-warning" />
              </div>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              {profileStats.pending > 0 
                ? 'Awaiting activation'
                : 'All profiles processed'
              }
            </div>
          </div>
        </div>

        {/* Two column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <div className="card" data-testid="recent-activity-card">
            <div className="card-header">
              <h2 className="card-title">Recent Activity</h2>
              {user?.role === 'admin' && (
                <Link href="/audit" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              )}
            </div>
            
            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 animate-pulse">
                    <div className="w-10 h-10 rounded-lg bg-muted" />
                    <div className="flex-1">
                      <div className="h-4 bg-muted rounded w-3/4" />
                      <div className="h-3 bg-muted rounded w-1/2 mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Activity className="w-10 h-10 mx-auto mb-3 opacity-50" />
                <p>No recent activity</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentActivity.map((log, index) => {
                  const Icon = getActivityIcon(log.action)
                  return (
                    <div key={log._id || index} className="flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        log.severity === 'warning' || log.severity === 'error' 
                          ? 'bg-warning/10' 
                          : 'bg-muted/50'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          log.severity === 'warning' || log.severity === 'error' 
                            ? 'text-warning' 
                            : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground truncate">
                          {getActionLabel(log.action)}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {log.userEmail && `${log.userEmail} - `}
                          {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card" data-testid="quick-actions-card">
            <h2 className="card-title mb-4">Quick Actions</h2>
            <div className="grid grid-cols-2 gap-4">
              <Link 
                href="/profiles" 
                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                data-testid="quick-action-profiles"
              >
                <Smartphone className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground">Manage Profiles</h3>
                <p className="text-sm text-muted-foreground mt-1">View and manage eSIM profiles</p>
              </Link>

              <Link 
                href="/devices" 
                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                data-testid="quick-action-devices"
              >
                <MonitorSmartphone className="w-8 h-8 text-info mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground">Manage Devices</h3>
                <p className="text-sm text-muted-foreground mt-1">Connect and manage devices</p>
              </Link>

              <Link 
                href="/templates" 
                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                data-testid="quick-action-templates"
              >
                <QrCode className="w-8 h-8 text-success mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground">Profile Templates</h3>
                <p className="text-sm text-muted-foreground mt-1">Create reusable templates</p>
              </Link>

              <Link 
                href="/settings" 
                className="p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-colors group"
                data-testid="quick-action-settings"
              >
                <Activity className="w-8 h-8 text-warning mb-3 group-hover:scale-110 transition-transform" />
                <h3 className="font-medium text-foreground">Settings</h3>
                <p className="text-sm text-muted-foreground mt-1">Configure your account</p>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
