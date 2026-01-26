import { useState } from 'react'
import { Play, Pause, Trash2, QrCode, ExternalLink } from 'lucide-react'
import { ESimService } from '../services/esim-service'
import { QRCodeGenerator } from './QRCodeGenerator'
import toast from 'react-hot-toast'

interface ESimProfile {
  iccid: string
  name: string
  provider: string
  status: 'active' | 'inactive' | 'pending'
  activatedDate?: Date
}

interface ProfileCardProps {
  profile: ESimProfile
  onRefresh: () => void
}

export function ProfileCard({ profile, onRefresh }: ProfileCardProps) {
  const [showQR, setShowQR] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleActivate = async () => {
    setLoading(true)
    try {
      const success = await ESimService.activateProfile(profile.iccid)
      if (success) {
        toast.success('Profile activated successfully')
        onRefresh()
      } else {
        toast.error('Failed to activate profile')
      }
    } catch (error) {
      toast.error('Activation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleDeactivate = async () => {
    setLoading(true)
    try {
      const success = await ESimService.deactivateProfile(profile.iccid)
      if (success) {
        toast.success('Profile deactivated successfully')
        onRefresh()
      } else {
        toast.error('Failed to deactivate profile')
      }
    } catch (error) {
      toast.error('Deactivation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = async () => {
    if (!confirm('Are you sure you want to remove this profile?')) return
    
    setLoading(true)
    try {
      const success = await ESimService.removeProfile(profile.iccid)
      if (success) {
        toast.success('Profile removed successfully')
        onRefresh()
      } else {
        toast.error('Failed to remove profile')
      }
    } catch (error) {
      toast.error('Removal failed')
    } finally {
      setLoading(false)
    }
  }

  const handleShowQR = async () => {
    try {
      const link = await ESimService.generateUniversalLink(profile.iccid)
      setShowQR(true)
    } catch (error) {
      toast.error('Failed to generate QR code')
    }
  }

  const statusColor = {
    active: 'bg-green-100 text-green-800',
    inactive: 'bg-gray-100 text-gray-800',
    pending: 'bg-yellow-100 text-yellow-800'
  }[profile.status]

  return (
    <>
      <div className="card">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{profile.name}</h3>
            <p className="text-sm text-gray-600">{profile.provider}</p>
            <p className="text-xs text-gray-500 mt-1">ICCID: {profile.iccid}</p>
          </div>
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusColor}`}>
            {profile.status}
          </span>
        </div>

        {profile.activatedDate && (
          <p className="text-sm text-gray-600 mb-4">
            Activated: {profile.activatedDate.toLocaleDateString()}
          </p>
        )}

        <div className="flex space-x-2">
          {profile.status === 'inactive' ? (
            <button
              onClick={handleActivate}
              disabled={loading}
              className="btn-primary flex items-center flex-1"
            >
              <Play className="h-4 w-4 mr-2" />
              Activate
            </button>
          ) : (
            <button
              onClick={handleDeactivate}
              disabled={loading}
              className="btn-secondary flex items-center flex-1"
            >
              <Pause className="h-4 w-4 mr-2" />
              Deactivate
            </button>
          )}

          <button
            onClick={handleShowQR}
            className="btn-secondary flex items-center"
          >
            <QrCode className="h-4 w-4" />
          </button>

          <button
            onClick={handleRemove}
            disabled={loading}
            className="btn-secondary text-red-600 hover:bg-red-50 flex items-center"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {showQR && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-medium mb-4">eSIM Activation QR Code</h3>
            <QRCodeGenerator 
              value={`LPA:1$sm-dp.nexorasim.com$${profile.iccid}`}
              size={250}
              className="mb-4"
            />
            <p className="text-sm text-gray-600 mb-4 text-center">
              Scan this QR code with your device to activate the eSIM profile
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() => setShowQR(false)}
                className="btn-secondary flex-1"
              >
                Close
              </button>
              <button
                onClick={() => {
                  const link = ESimService.generateAppleUniversalLink(`LPA:1$sm-dp.nexorasim.com$${profile.iccid}`)
                  window.open(link, '_blank')
                }}
                className="btn-primary flex items-center flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}