import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProvisionModalProps {
  onClose: () => void
  onProvision: (activationCode: string, name?: string) => Promise<void>
}

export function ProvisionModal({ onClose, onProvision }: ProvisionModalProps) {
  const [activationCode, setActivationCode] = useState('')
  const [profileName, setProfileName] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!activationCode.trim()) {
      toast.error('Please enter an activation code')
      return
    }

    if (!activationCode.startsWith('LPA:')) {
      toast.error('Activation code must start with LPA:')
      return
    }

    setLoading(true)
    try {
      await onProvision(activationCode.trim(), profileName.trim() || undefined)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose} data-testid="provision-modal">
      <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-heading text-lg font-semibold text-foreground">Add eSIM Profile</h3>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors"
            data-testid="provision-modal-close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Profile Name (Optional)</label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => setProfileName(e.target.value)}
              placeholder="My Business Profile"
              className="input-field"
              disabled={loading}
              data-testid="provision-name-input"
            />
          </div>
          
          <div>
            <label className="label">Activation Code</label>
            <textarea
              value={activationCode}
              onChange={(e) => setActivationCode(e.target.value)}
              placeholder="LPA:1$sm-dp.example.com$activation-code"
              className="input-field h-24 resize-none font-mono text-sm"
              disabled={loading}
              data-testid="provision-code-input"
            />
            <p className="text-xs text-muted-foreground mt-2">
              Enter the LPA activation code provided by your carrier. Must start with LPA:
            </p>
          </div>

          <div className="flex gap-3 pt-4">
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
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              data-testid="provision-submit-btn"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Adding...
                </>
              ) : (
                'Add Profile'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
