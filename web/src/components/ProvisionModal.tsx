import { useState } from 'react'
import { X } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProvisionModalProps {
  onClose: () => void
  onProvision: (activationCode: string) => Promise<void>
}

export function ProvisionModal({ onClose, onProvision }: ProvisionModalProps) {
  const [activationCode, setActivationCode] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activationCode.trim()) {
      toast.error('Please enter an activation code')
      return
    }

    setLoading(true)
    try {
      await onProvision(activationCode.trim())
      toast.success('Profile provisioned successfully')
    } catch (error) {
      toast.error('Provisioning failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Add eSIM Profile</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Activation Code
            </label>
            <textarea
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="LPA:1$sm-dp.example.com$activation-code"
              className="input-field h-24 resize-none"
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter the LPA activation code provided by your carrier
            </p>
          </div>

          <div className="flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !activationCode.trim()}
              className="btn-primary flex-1"
            >
              {loading ? 'Adding...' : 'Add Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}