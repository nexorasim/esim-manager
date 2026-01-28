import api from './api'

export interface ESimProfile {
  _id: string
  iccid: string
  name: string
  provider: string
  status: 'active' | 'inactive' | 'pending' | 'deleted'
  profileClass: 'operational' | 'test' | 'provisioning'
  deviceId?: string
  activatedDate?: string
  deactivatedDate?: string
  customNotes?: string
  createdAt: string
  updatedAt: string
}

export interface ProfileStats {
  total: number
  active: number
  inactive: number
  pending: number
}

export interface UniversalLink {
  url: string
  qrCode: string
  appleLink: string
  androidLink: string
}

export const profileService = {
  async getProfiles(): Promise<ESimProfile[]> {
    const response = await api.get('/api/profiles')
    return response.data
  },

  async getProfile(iccid: string): Promise<ESimProfile> {
    const response = await api.get(`/api/profiles/${iccid}`)
    return response.data
  },

  async getStats(): Promise<ProfileStats> {
    const response = await api.get('/api/profiles/stats')
    return response.data
  },

  async provisionProfile(activationCode: string, name?: string): Promise<ESimProfile> {
    const response = await api.post('/api/profiles/provision', { activationCode, name })
    return response.data
  },

  async activateProfile(iccid: string): Promise<boolean> {
    const response = await api.post(`/api/profiles/${iccid}/activate`)
    return response.data.success
  },

  async deactivateProfile(iccid: string): Promise<boolean> {
    const response = await api.post(`/api/profiles/${iccid}/deactivate`)
    return response.data.success
  },

  async removeProfile(iccid: string): Promise<boolean> {
    const response = await api.delete(`/api/profiles/${iccid}`)
    return response.data.success
  },

  async assignToDevice(iccid: string, deviceId: string): Promise<boolean> {
    const response = await api.post(`/api/profiles/${iccid}/assign`, { deviceId })
    return response.data.success
  },

  async getUniversalLink(iccid: string): Promise<UniversalLink> {
    const response = await api.get(`/api/profiles/${iccid}/universal-link`)
    return response.data
  }
}

export default profileService
