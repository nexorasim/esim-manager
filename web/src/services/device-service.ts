import api from './api'

export interface Device {
  _id: string
  name: string
  eid: string
  connectionType: 'wlan' | 'bluetooth' | 'usb'
  status: 'online' | 'offline' | 'error'
  ipAddress?: string
  macAddress?: string
  lastSeen?: string
  createdAt: string
  updatedAt: string
}

export interface DeviceStats {
  total: number
  online: number
  offline: number
}

export const deviceService = {
  async getDevices(): Promise<Device[]> {
    const response = await api.get('/api/devices')
    return response.data
  },

  async getDevice(eid: string): Promise<Device> {
    const response = await api.get(`/api/devices/${eid}`)
    return response.data
  },

  async getStats(): Promise<DeviceStats> {
    const response = await api.get('/api/devices/stats')
    return response.data
  },

  async addDevice(data: {
    name: string
    eid?: string
    connectionType: 'wlan' | 'bluetooth' | 'usb'
    ipAddress?: string
    macAddress?: string
  }): Promise<Device> {
    const response = await api.post('/api/devices', data)
    return response.data
  },

  async updateDevice(eid: string, data: Partial<Device>): Promise<Device> {
    const response = await api.put(`/api/devices/${eid}`, data)
    return response.data
  },

  async updateStatus(eid: string, status: 'online' | 'offline' | 'error'): Promise<boolean> {
    const response = await api.post(`/api/devices/${eid}/status`, { status })
    return response.data.success
  },

  async removeDevice(eid: string): Promise<boolean> {
    const response = await api.delete(`/api/devices/${eid}`)
    return response.data.success
  }
}

export default deviceService
