interface ESimProfile {
  iccid: string
  name: string
  provider: string
  status: 'active' | 'inactive' | 'pending'
  activatedDate?: Date
}

interface UniversalLink {
  url: string
  qrCode: string
}

export class ESimService {
  private static baseUrl = process.env.NEXT_PUBLIC_API_URL || '/api'

  static async getProfiles(): Promise<ESimProfile[]> {
    // Mock data for development
    return [
      {
        iccid: '8901234567890123456',
        name: 'Business Plan',
        provider: 'NexoraSIM',
        status: 'active',
        activatedDate: new Date('2024-01-15')
      },
      {
        iccid: '8901234567890123457',
        name: 'Travel Plan',
        provider: 'NexoraSIM',
        status: 'inactive'
      }
    ]
  }

  static async activateProfile(iccid: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${iccid}/activate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      return response.ok
    } catch (error) {
      console.error('Activation failed:', error)
      return false
    }
  }

  static async deactivateProfile(iccid: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${iccid}/deactivate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })
      return response.ok
    } catch (error) {
      console.error('Deactivation failed:', error)
      return false
    }
  }

  static async removeProfile(iccid: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/${iccid}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      })
      return response.ok
    } catch (error) {
      console.error('Removal failed:', error)
      return false
    }
  }

  static async provisionProfile(activationCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/profiles/provision`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activationCode })
      })
      return response.ok
    } catch (error) {
      console.error('Provisioning failed:', error)
      return false
    }
  }

  static async generateUniversalLink(iccid: string): Promise<UniversalLink> {
    const activationCode = `LPA:1$sm-dp.nexorasim.com$${iccid}`
    const universalLink = `https://nexorasim.com/esim/activate?code=${encodeURIComponent(activationCode)}`
    
    return {
      url: universalLink,
      qrCode: activationCode
    }
  }

  static generateAppleUniversalLink(activationCode: string): string {
    return `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}`
  }

  static generateAndroidDeepLink(activationCode: string): string {
    return `intent://esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}#Intent;scheme=https;package=com.android.settings;end`
  }
}