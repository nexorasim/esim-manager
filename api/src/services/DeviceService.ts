import { v4 as uuidv4 } from 'uuid'
import { Device, IDevice, ConnectionType, DeviceStatus } from '../models/Device'
import { isConnected } from '../config/database'

// In-memory fallback storage
const memoryDevices: Map<string, IDevice> = new Map()

export class DeviceService {
  async getDevices(userId: string): Promise<IDevice[]> {
    if (isConnected()) {
      return Device.find({ userId })
        .sort({ lastSeen: -1 })
        .lean() as unknown as IDevice[]
    }
    return Array.from(memoryDevices.values())
      .filter(d => d.userId?.toString() === userId)
  }

  async getDevice(eid: string, userId: string): Promise<IDevice | null> {
    if (isConnected()) {
      return Device.findOne({ eid, userId }).lean() as unknown as IDevice | null
    }
    const device = memoryDevices.get(eid)
    return device && device.userId?.toString() === userId ? device : null
  }

  async getDeviceById(id: string): Promise<IDevice | null> {
    if (isConnected()) {
      return Device.findById(id).lean() as unknown as IDevice | null
    }
    return Array.from(memoryDevices.values()).find(d => (d as any)._id === id) || null
  }

  async addDevice(data: {
    name: string
    eid?: string
    connectionType: ConnectionType
    ipAddress?: string
    macAddress?: string
    userId: string
  }): Promise<IDevice> {
    const eid = data.eid || this.generateEID()
    
    if (isConnected()) {
      const device = new Device({
        ...data,
        eid,
        status: 'offline',
        lastSeen: new Date()
      })
      await device.save()
      return device
    }

    const device: any = {
      _id: uuidv4(),
      ...data,
      eid,
      status: 'offline',
      lastSeen: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    }
    memoryDevices.set(eid, device)
    return device
  }

  async updateDevice(eid: string, userId: string, updates: Partial<IDevice>): Promise<IDevice | null> {
    if (isConnected()) {
      return Device.findOneAndUpdate(
        { eid, userId },
        { ...updates, updatedAt: new Date() },
        { new: true }
      ).lean() as unknown as IDevice | null
    }

    const device = await this.getDevice(eid, userId)
    if (!device) return null
    Object.assign(device, updates, { updatedAt: new Date() })
    return device
  }

  async updateDeviceStatus(eid: string, userId: string, status: DeviceStatus): Promise<boolean> {
    const update: Partial<IDevice> = { status }
    if (status === 'online') update.lastSeen = new Date()
    
    const result = await this.updateDevice(eid, userId, update)
    return !!result
  }

  async removeDevice(eid: string, userId: string): Promise<boolean> {
    if (isConnected()) {
      const result = await Device.findOneAndDelete({ eid, userId })
      return !!result
    }
    
    const device = await this.getDevice(eid, userId)
    if (!device) return false
    memoryDevices.delete(eid)
    return true
  }

  async getAllDevices(filters?: { status?: DeviceStatus; connectionType?: ConnectionType }): Promise<IDevice[]> {
    if (isConnected()) {
      const query: any = {}
      if (filters?.status) query.status = filters.status
      if (filters?.connectionType) query.connectionType = filters.connectionType
      return Device.find(query).sort({ lastSeen: -1 }).lean() as unknown as IDevice[]
    }
    
    return Array.from(memoryDevices.values()).filter(d => {
      if (filters?.status && d.status !== filters.status) return false
      if (filters?.connectionType && d.connectionType !== filters.connectionType) return false
      return true
    })
  }

  async getStats(userId?: string): Promise<{
    total: number
    online: number
    offline: number
  }> {
    const query: any = {}
    if (userId) query.userId = userId

    if (isConnected()) {
      const [total, online] = await Promise.all([
        Device.countDocuments(query),
        Device.countDocuments({ ...query, status: 'online' })
      ])
      return { total, online, offline: total - online }
    }

    const devices = Array.from(memoryDevices.values()).filter(d => {
      if (userId && d.userId?.toString() !== userId) return false
      return true
    })

    return {
      total: devices.length,
      online: devices.filter(d => d.status === 'online').length,
      offline: devices.filter(d => d.status !== 'online').length
    }
  }

  private generateEID(): string {
    // Generate a valid 32-digit EID
    const prefix = '89' // Global platform identifier
    const countryCode = '049' // Example country code
    const issuerCode = '001' // Example issuer code
    const rest = Array.from({ length: 25 }, () => Math.floor(Math.random() * 10)).join('')
    return prefix + countryCode + issuerCode + rest
  }
}
