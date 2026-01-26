import { v4 as uuidv4 } from 'uuid'

export interface ESimProfile {
  id: string
  iccid: string
  name: string
  provider: string
  status: 'active' | 'inactive' | 'pending'
  userId: string
  activatedDate?: Date
  createdAt: Date
  updatedAt: Date
}

export interface UniversalLink {
  url: string
  qrCode: string
  appleLink: string
  androidLink: string
}

export class ESimProfileService {
  private profiles: Map<string, ESimProfile> = new Map()

  async getProfiles(userId: string): Promise<ESimProfile[]> {
    return Array.from(this.profiles.values())
      .filter(profile => profile.userId === userId)
  }

  async getProfile(iccid: string, userId: string): Promise<ESimProfile | null> {
    const profile = this.profiles.get(iccid)
    return profile && profile.userId === userId ? profile : null
  }

  async provisionProfile(activationCode: string, userId: string): Promise<ESimProfile> {
    // Parse LPA activation code
    const parts = activationCode.split('$')
    if (parts.length < 2 || !parts[0].startsWith('LPA:')) {
      throw new Error('Invalid activation code format')
    }

    const iccid = this.generateICCID()
    const profile: ESimProfile = {
      id: uuidv4(),
      iccid,
      name: `Profile ${Date.now()}`,
      provider: 'NexoraSIM',
      status: 'pending',
      userId,
      createdAt: new Date(),
      updatedAt: new Date()
    }

    this.profiles.set(iccid, profile)
    
    // Simulate provisioning delay
    setTimeout(() => {
      const p = this.profiles.get(iccid)
      if (p) {
        p.status = 'inactive'
        p.updatedAt = new Date()
      }
    }, 2000)

    return profile
  }

  async activateProfile(iccid: string, userId: string): Promise<boolean> {
    const profile = await this.getProfile(iccid, userId)
    if (!profile || profile.status === 'active') {
      return false
    }

    profile.status = 'active'
    profile.activatedDate = new Date()
    profile.updatedAt = new Date()
    
    return true
  }

  async deactivateProfile(iccid: string, userId: string): Promise<boolean> {
    const profile = await this.getProfile(iccid, userId)
    if (!profile || profile.status !== 'active') {
      return false
    }

    profile.status = 'inactive'
    profile.updatedAt = new Date()
    
    return true
  }

  async removeProfile(iccid: string, userId: string): Promise<boolean> {
    const profile = await this.getProfile(iccid, userId)
    if (!profile) {
      return false
    }

    this.profiles.delete(iccid)
    return true
  }

  async generateUniversalLink(iccid: string, userId: string): Promise<UniversalLink | null> {
    const profile = await this.getProfile(iccid, userId)
    if (!profile) {
      return null
    }

    const activationCode = `LPA:1$sm-dp.nexorasim.com$${iccid}`
    const baseUrl = process.env.FRONTEND_URL || 'https://nexorasim.com'
    
    return {
      url: `${baseUrl}/esim/activate?code=${encodeURIComponent(activationCode)}`,
      qrCode: activationCode,
      appleLink: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}`,
      androidLink: `intent://esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}#Intent;scheme=https;package=com.android.settings;end`
    }
  }

  private generateICCID(): string {
    // Generate a valid ICCID (19-20 digits)
    const prefix = '8901' // Industry identifier for telecommunications
    const countryCode = '234' // Example country code
    const issuerCode = '567' // Example issuer code
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
        if (n > 9) {
          n = (n % 10) + 1
        }
      }
      
      sum += n
      alternate = !alternate
    }
    
    return ((10 - (sum % 10)) % 10).toString()
  }
}