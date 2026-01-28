import { useState, useEffect } from 'react'
import Head from 'next/head'
import { 
  MonitorSmartphone, 
  Plus, 
  Search, 
  Wifi, 
  WifiOff,
  Trash2,
  Edit,
  MoreVertical
} from 'lucide-react'
import { deviceService, Device } from '../services/device-service'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

export default function Devices() {
  const [devices, setDevices] = useState<Device[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  
  // Form state
  const [newDevice, setNewDevice] = useState({
    name: '',
    connectionType: 'wlan' as 'wlan' | 'bluetooth' | 'usb',
    ipAddress: '',
    macAddress: ''
  })

  useEffect(() => {
    loadDevices()
  }, [])

  const loadDevices = async () => {
    try {
      const data = await deviceService.getDevices()
      setDevices(data)
    } catch (error) {
      toast.error('Failed to load devices')
    } finally {
      setLoading(false)
    }
  }

  const handleAddDevice = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDevice.name) {
      toast.error('Device name is required')
      return
    }
    
    try {
      await deviceService.addDevice(newDevice)
      toast.success('Device added successfully')
      await loadDevices()
      setShowAddModal(false)
      setNewDevice({ name: '', connectionType: 'wlan', ipAddress: '', macAddress: '' })
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to add device')
    }
  }

  const handleToggleStatus = async (device: Device) => {
    setActionLoading(device.eid)
    const newStatus = device.status === 'online' ? 'offline' : 'online'
    try {
      await deviceService.updateStatus(device.eid, newStatus)
      toast.success(`Device ${newStatus === 'online' ? 'connected' : 'disconnected'}`)
      await loadDevices()
    } catch (error) {
      toast.error('Failed to update device status')
    } finally {
      setActionLoading(null)
    }
  }

  const handleRemove = async (device: Device) => {
    if (!confirm(`Are you sure you want to remove "${device.name}"?`)) return
    
    setActionLoading(device.eid)
    try {
      await deviceService.removeDevice(device.eid)
      toast.success('Device removed')
      await loadDevices()
    } catch (error) {
      toast.error('Failed to remove device')
    } finally {
      setActionLoading(null)
    }
  }

  const filteredDevices = devices.filter(device =>
    device.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    device.eid.includes(searchQuery)
  )

  const getConnectionIcon = (type: string) => {
    switch (type) {
      case 'wlan': return Wifi
      case 'bluetooth': return MonitorSmartphone
      default: return MonitorSmartphone
    }
  }

  return (
    <>
      <Head>
        <title>Devices | NexoraSIM</title>
      </Head>

      <div className="space-y-6 animate-fade-in" data-testid="devices-page">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-heading text-3xl font-bold text-foreground">Devices</h1>
            <p className="text-muted-foreground mt-1">Manage connected eSIM-capable devices</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary inline-flex items-center gap-2"
            data-testid="add-device-btn"
          >
            <Plus className="w-4 h-4" />
            Add Device
          </button>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search devices..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-10"
            data-testid="device-search-input"
          />
        </div>

        {/* Devices grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="card animate-pulse">
                <div className="h-4 bg-muted rounded w-3/4 mb-4" />
                <div className="h-3 bg-muted rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredDevices.length === 0 ? (
          <div className="card text-center py-12" data-testid="no-devices-message">
            <MonitorSmartphone className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
              {searchQuery ? 'No matching devices' : 'No devices yet'}
            </h3>
            <p className="text-muted-foreground mb-6">
              {searchQuery ? 'Try adjusting your search' : 'Add your first device to get started'}
            </p>
            {!searchQuery && (
              <button onClick={() => setShowAddModal(true)} className="btn-primary">
                Add Your First Device
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDevices.map((device) => {
              const ConnectionIcon = getConnectionIcon(device.connectionType)
              return (
                <div 
                  key={device.eid} 
                  className="card"
                  data-testid={`device-card-${device.eid}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        device.status === 'online' ? 'bg-success/10' : 'bg-muted/50'
                      }`}>
                        <ConnectionIcon className={`w-5 h-5 ${
                          device.status === 'online' ? 'text-success' : 'text-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{device.name}</h3>
                        <p className="text-xs text-muted-foreground capitalize">{device.connectionType}</p>
                      </div>
                    </div>
                    <div className={`w-3 h-3 rounded-full ${
                      device.status === 'online' ? 'bg-success animate-pulse' : 'bg-muted-foreground'
                    }`} title={device.status} />
                  </div>

                  <div className="space-y-2 mb-4">
                    <p className="text-xs text-muted-foreground font-mono">
                      EID: {device.eid.substring(0, 16)}...
                    </p>
                    {device.ipAddress && (
                      <p className="text-xs text-muted-foreground">
                        IP: {device.ipAddress}
                      </p>
                    )}
                    {device.lastSeen && (
                      <p className="text-xs text-muted-foreground">
                        Last seen: {format(new Date(device.lastSeen), 'MMM d, HH:mm')}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-4 border-t border-border">
                    <button
                      onClick={() => handleToggleStatus(device)}
                      disabled={actionLoading === device.eid}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md transition-colors ${
                        device.status === 'online' 
                          ? 'bg-muted/50 text-foreground hover:bg-muted' 
                          : 'bg-success/10 text-success hover:bg-success/20'
                      }`}
                      data-testid={`toggle-status-btn-${device.eid}`}
                    >
                      {device.status === 'online' ? (
                        <>
                          <WifiOff className="w-4 h-4" />
                          Disconnect
                        </>
                      ) : (
                        <>
                          <Wifi className="w-4 h-4" />
                          Connect
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => handleRemove(device)}
                      disabled={actionLoading === device.eid}
                      className="btn-secondary p-2 text-destructive hover:bg-destructive/10"
                      title="Remove"
                      data-testid={`remove-device-btn-${device.eid}`}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Add Device Modal */}
      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-heading text-lg font-semibold text-foreground mb-4">
              Add New Device
            </h3>
            <form onSubmit={handleAddDevice} className="space-y-4">
              <div>
                <label className="label">Device Name</label>
                <input
                  type="text"
                  value={newDevice.name}
                  onChange={(e) => setNewDevice({ ...newDevice, name: e.target.value })}
                  className="input-field"
                  placeholder="My iPhone 15 Pro"
                  data-testid="device-name-input"
                />
              </div>
              <div>
                <label className="label">Connection Type</label>
                <select
                  value={newDevice.connectionType}
                  onChange={(e) => setNewDevice({ ...newDevice, connectionType: e.target.value as any })}
                  className="input-field"
                  data-testid="device-connection-select"
                >
                  <option value="wlan">WLAN</option>
                  <option value="bluetooth">Bluetooth</option>
                  <option value="usb">USB</option>
                </select>
              </div>
              <div>
                <label className="label">IP Address (Optional)</label>
                <input
                  type="text"
                  value={newDevice.ipAddress}
                  onChange={(e) => setNewDevice({ ...newDevice, ipAddress: e.target.value })}
                  className="input-field"
                  placeholder="192.168.1.100"
                  data-testid="device-ip-input"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary flex-1" data-testid="add-device-submit">
                  Add Device
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
