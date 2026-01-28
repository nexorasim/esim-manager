import { useState, useEffect } from 'react'
import Head from 'next/head'
import { 
  Smartphone, 
  Plus, 
  Search, 
  Play, 
  Pause, 
  Trash2, 
  QrCode,
  MoreVertical,
  Filter
} from 'lucide-react'
import { profileService, ESimProfile } from '../services/profile-service'
import { ProvisionModal } from '../components/ProvisionModal'
import { QRCodeGenerator } from '../components/QRCodeGenerator'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Profiles() {
  const [profiles, setProfiles] = useState<ESimProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showProvisionModal, setShowProvisionModal] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<ESimProfile | null>(null)
  const [showQRModal, setShowQRModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    loadProfiles()
  }, [])

  const loadProfiles = async () => {
    try {
      const data = await profileService.getProfiles()
      setProfiles(data)
    } catch (error) {
      toast.error('Failed to load profiles')
    } finally {
      setLoading(false)
    }
  }

  const handleProvision = async (activationCode: string, name?: string) => {
    try {
      await profileService.provisionProfile(activationCode, name)
      toast.success('Profile provisioned successfully')
      await loadProfiles()
      setShowProvisionModal(false)
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Provisioning failed')
    }
  }

  const handleActivate = async (profile: ESimProfile) => {
    setActionLoading(profile.iccid)
    try {
      await profileService.activateProfile(profile.iccid)
      toast.success('Profile activated')
      await loadProfiles()
    } catch (error) {
      toast.error('Failed to activate profile')
    } finally {
      setActionLoading(null)
    }
  }

  const handleDeactivate = async (profile: ESimProfile) => {
    setActionLoading(profile.iccid)
    try {
      await profileService.deactivateProfile(profile.iccid)
      toast.success('Profile deactivated')
      await loadProfiles()
    } catch (error) {
      toast.error('Failed to deactivate profile')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (profile: ESimProfile) => {
    if (!confirm(`Are you sure you want to remove "${profile.name}"?`)) return
    
    setActionLoading(profile.iccid)
    try {
      await profileService.removeProfile(profile.iccid)
      toast.success('Profile removed')
      await loadProfiles()
    } catch (error) {
      toast.error('Failed to remove profile')
    } finally {
      setActionLoading(null)
    }
  }

  const handleShowQR = (profile: ESimProfile) => {
    setSelectedProfile(profile)
    setShowQRModal(true)
  }

  const filteredProfiles = profiles.filter(profile => {
    const matchesSearch = profile.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         profile.iccid.includes(searchQuery) ||
                         profile.provider.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || profile.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      active: 'badge-success',
      inactive: 'badge-info',
      pending: 'badge-warning',
      deleted: 'badge-error'
    }
    return styles[status] || 'badge-info'
  }

  return (
    <>
      <Head>
        <title>Profiles | NexoraSIM</title>
      </Head>

      <div className="space-y-6 animate-fade-in" data-testid="profiles-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">eSIM Profiles</h1>
            <p className="text-muted-foreground mt-1">Manage your eSIM profile lifecycle</p>
          </div>
          <button
            onClick={() => setShowProvisionModal(true)}
            className="btn-primary inline-flex items-center gap-2"
            data-testid="add-profile-btn"
          >
            <Plus className="w-4 h-4" />
            Add Profile
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search profiles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10"
              data-testid="profile-search-input"
            />
          </div>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field pl-10 pr-10 appearance-none cursor-pointer min-w-[150px]"
              data-testid="profile-status-filter"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>
        </div>

        {/* Profiles list */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-3 bg-muted rounded w-1/2 mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filteredProfiles.length === 0 ? (
          <div className="card text-center py-12" data-testid="no-profiles-message">
            <Smartphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              {searchQuery || statusFilter !== 'all' ? 'No matching profiles' : 'No profiles yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter'
                : 'Add your first eSIM profile to get started'
              }
            </p>
            {!searchQuery && statusFilter === 'all' && (
              <button
                onClick={() => setShowProvisionModal(true)}
                className="btn-primary"
              >
                Add Your First Profile
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProfiles.map((profile) => (
              <div 
                key={profile.iccid} 
                className="card group"
                data-testid={`profile-card-${profile.iccid}`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-foreground">{profile.name}</h3>
                    <p className="text-sm text-muted-foreground">{profile.provider}</p>
                  </div>
                  <span className={`badge ${getStatusBadge(profile.status)}`}>
                    {profile.status}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <p className="text-xs text-muted-foreground font-mono">
                    ICCID: {profile.iccid}
                  </p>
                  {profile.activatedDate && (
                    <p className="text-xs text-muted-foreground">
                      Activated: {format(new Date(profile.activatedDate), 'MMM d, yyyy')}
                    </p>
                  )}
                  <p className="text-xs text-muted-foreground capitalize">
                    Class: {profile.profileClass}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-4 border-t border-border">
                  {profile.status === 'inactive' && (
                    <button
                      onClick={() => handleActivate(profile)}
                      disabled={actionLoading === profile.iccid}
                      className="btn-primary flex-1 flex items-center justify-center gap-2 py-2"
                      data-testid={`activate-btn-${profile.iccid}`}
                    >
                      <Play className="w-4 h-4" />
                      Activate
                    </button>
                  )}
                  {profile.status === 'active' && (
                    <button
                      onClick={() => handleDeactivate(profile)}
                      disabled={actionLoading === profile.iccid}
                      className="btn-secondary flex-1 flex items-center justify-center gap-2 py-2"
                      data-testid={`deactivate-btn-${profile.iccid}`}
                    >
                      <Pause className="w-4 h-4" />
                      Deactivate
                    </button>
                  )}
                  {profile.status === 'pending' && (
                    <span className="flex-1 text-center text-sm text-warning">
                      Provisioning...
                    </span>
                  )}
                  <button
                    onClick={() => handleShowQR(profile)}
                    className="btn-secondary p-2"
                    title="Show QR Code"
                    data-testid={`qr-btn-${profile.iccid}`}
                  >
                    <QrCode className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleRemove(profile)}
                    disabled={actionLoading === profile.iccid}
                    className="btn-secondary p-2 text-destructive hover:bg-destructive/10"
                    title="Remove"
                    data-testid={`remove-btn-${profile.iccid}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Provision Modal */}
      {showProvisionModal && (
        <ProvisionModal
          onClose={() => setShowProvisionModal(false)}
          onProvision={handleProvision}
        />
      )}

      {/* QR Code Modal */}
      {showQRModal && selectedProfile && (
        <div className="modal-overlay" onClick={() => setShowQRModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
              eSIM Activation QR Code
            </h3>
            <div className="bg-white p-4 rounded-lg mb-4">
              <QRCodeGenerator
                value={`LPA:1$sm-dp.nexorasim.com$${selectedProfile.iccid}`}
                size={250}
              />
            </div>
            <p className="text-sm text-muted-foreground text-center mb-4">
              Scan this QR code with your device to activate the eSIM profile
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowQRModal(false)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
