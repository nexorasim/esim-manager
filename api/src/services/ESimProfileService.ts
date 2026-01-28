import { v4 as uuidv4 } from 'uuid'
import { ESimProfile, IESimProfile, ProfileStatus } from '../models/ESimProfile'
import { isConnected } from '../config/database'

export interface UniversalLink {
  url: string
  qrCode: string
  appleLink: string
  androidLink: string
}

// In-memory fallback storage
const memoryProfiles: Map<string, IESimProfile> = new Map()

export class ESimProfileService {
  async getProfiles(userId: string): Promise<IESimProfile[]> {
    if (isConnected()) {
      return ESimProfile.find({ userId, status: { $ne: 'deleted' } })
        .sort({ createdAt: -1 })
        .lean() as unknown as IESimProfile[]
    }
    return Array.from(memoryProfiles.values())
      .filter(p => p.userId?.toString() === userId && p.status !== 'deleted')
  }

  async getProfile(iccid: string, userId: string): Promise<IESimProfile | null> {
    if (isConnected()) {
      return ESimProfile.findOne({ iccid, userId }).lean() as unknown as IESimProfile | null
    }
    const profile = memoryProfiles.get(iccid)
    return profile && profile.userId?.toString() === userId ? profile : null
  }

  async getAllProfiles(filters?: { status?: ProfileStatus; deviceId?: string }): Promise<IESimProfile[]> {
    if (isConnected()) {
      const query: any = { status: { $ne: 'deleted' } }
      if (filters?.status) query.status = filters.status
      if (filters?.deviceId) query.deviceId = filters.deviceId
      return ESimProfile.find(query).sort({ createdAt: -1 }).lean() as unknown as IESimProfile[]
    }
    return Array.from(memoryProfiles.values()).filter(p => {
      if (p.status === 'deleted') return false
      if (filters?.status && p.status !== filters.status) return false
      if (filters?.deviceId && p.deviceId?.toString() !== filters.deviceId) return false
      return true
    })
  }

  async provisionProfile(activationCode: string, userId: string, name?: string): Promise<IESimProfile> {
    const parts = activationCode.split('$')
    if (parts.length < 2 || !parts[0].startsWith('LPA:')) {
      throw new Error('Invalid activation code format')
    }

    const iccid = this.generateICCID()
    
    if (isConnected()) {
      const profile = new ESimProfile({
        iccid,
        name: name || `Profile ${Date.now()}`,
        provider: 'NexoraSIM',
        status: 'pending',
        profileClass: 'operational',
        userId
      })
      await profile.save()
      
      // Simulate provisioning delay
      setTimeout(async () => {
        await ESimProfile.findByIdAndUpdate(profile._id, { status: 'inactive' })
      }, 2000)
      
      return profile
    }

    // Fallback to in-memory
    const profile: any = {
      _id: uuidv4(),
      iccid,
      name: name || `Profile ${Date.now()}`,
      provider: 'NexoraSIM',
      status: 'pending',
      profileClass: 'operational',
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    memoryProfiles.set(iccid, profile)
    
    setTimeout(() => {
      const p = memoryProfiles.get(iccid)
      if (p) {
        p.status = 'inactive'
        p.updatedAt = new Date()
      }
    }, 2000)

    return profile
  }

  async activateProfile(iccid: string, userId: string): Promise<boolean> {
    if (isConnected()) {
      const result = await ESimProfile.findOneAndUpdate(
        { iccid, userId, status: { $ne: 'active' } },
        { status: 'active', activatedDate: new Date(), updatedAt: new Date() },
        { new: true }
      )
      return !!result
    }
    
    const profile = await this.getProfile(iccid, userId)
    if (!profile || profile.status === 'active') return false
    profile.status = 'active'
    profile.activatedDate = new Date()
    profile.updatedAt = new Date()
    return true
  }

  async deactivateProfile(iccid: string, userId: string): Promise<boolean> {
    if (isConnected()) {
      const result = await ESimProfile.findOneAndUpdate(
        { iccid, userId, status: 'active' },
        { status: 'inactive', deactivatedDate: new Date(), updatedAt: new Date() },
        { new: true }
      )
      return !!result
    }
    
    const profile = await this.getProfile(iccid, userId)
    if (!profile || profile.status !== 'active') return false
    profile.status = 'inactive'
    profile.deactivatedDate = new Date()
    profile.updatedAt = new Date()
    return true
  }

  async removeProfile(iccid: string, userId: string): Promise<boolean> {
    if (isConnected()) {
      const result = await ESimProfile.findOneAndUpdate(
        { iccid, userId },
        { status: 'deleted', updatedAt: new Date() },
        { new: true }
      )
      return !!result
    }
    
    const profile = await this.getProfile(iccid, userId)
    if (!profile) return false
    memoryProfiles.delete(iccid)
    return true
  }

  async assignToDevice(iccid: string, userId: string, deviceId: string): Promise<boolean> {
    if (isConnected()) {
      const result = await ESimProfile.findOneAndUpdate(
        { iccid, userId },
        { deviceId, updatedAt: new Date() },
        { new: true }
      )
      return !!result
    }
    
    const profile = await this.getProfile(iccid, userId)
    if (!profile) return false
    profile.deviceId = deviceId as any
    profile.updatedAt = new Date()
    return true
  }

  async generateUniversalLink(iccid: string, userId: string): Promise<UniversalLink | null> {
    const profile = await this.getProfile(iccid, userId)
    if (!profile) return null

    const activationCode = `LPA:1$sm-dp.nexorasim.com$${iccid}`
    const baseUrl = process.env.FRONTEND_URL || 'https://nexorasim.com'
    
    return {
      url: `${baseUrl}/esim/activate?code=${encodeURIComponent(activationCode)}`,
      qrCode: activationCode,
      appleLink: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}`,
      androidLink: `intent://esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}#Intent;scheme=https;package=com.android.settings;end`
    }
  }

  async getStats(userId?: string): Promise<{
    total: number
    active: number
    inactive: number
    pending: number
  }> {
    const query: any = { status: { $ne: 'deleted' } }
    if (userId) query.userId = userId

    if (isConnected()) {
      const [total, active, inactive, pending] = await Promise.all([
        ESimProfile.countDocuments(query),
        ESimProfile.countDocuments({ ...query, status: 'active' }),
        ESimProfile.countDocuments({ ...query, status: 'inactive' }),
        ESimProfile.countDocuments({ ...query, status: 'pending' })
      ])
      return { total, active, inactive, pending }
    }

    const profiles = Array.from(memoryProfiles.values()).filter(p => {
      if (p.status === 'deleted') return false
      if (userId && p.userId?.toString() !== userId) return false
      return true
    })

    return {
      total: profiles.length,
      active: profiles.filter(p => p.status === 'active').length,
      inactive: profiles.filter(p => p.status === 'inactive').length,
      pending: profiles.filter(p => p.status === 'pending').length
    }
  }

  private generateICCID(): string {
    const prefix = '8901'
    const countryCode = '234'
    const issuerCode = '567'
    const accountId = Math.random().toString().substr(2, 9)
    const checkDigit = this.calculateLuhnCheckDigit(prefix + countryCode + issuerCode + accountId)
    return prefix + countryCode + issuerCode + accountId + checkDigit
  }

  private calculateLuhnCheckDigit(number: string): string {
    let sum = 0
    let alternate = false
    
    for (let i = number.length - 1; i >= 0; i--) {
      let n = parseInt(number.charAt(i), 10)
      if (alternate) {
        n *= 2
        if (n > 9) n = (n % 10) + 1
      }
      sum += n
      alternate = !alternate
    }
    
    return ((10 - (sum % 10)) % 10).toString()
  }
}
