import { FirebaseService } from '../lib/firebase-service'
import { FirestoreDevice, ConnectionType, DeviceStatus } from '../lib/firestore-types'
import { auth } from '../lib/firebase-config'

export interface CreateDeviceData {
  name: string
  eid: string
  connectionType: ConnectionType
  ipAddress?: string
  macAddress?: string
  metadata?: Record<string, any>
}

export interface UpdateDeviceData {
  name?: string
  status?: DeviceStatus
  ipAddress?: string
  macAddress?: string
  lastSeen?: Date
  metadata?: Record<string, any>
}

export class DeviceService {
  static async createDevice(data: CreateDeviceData): Promise<string> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    
    const deviceData = {
      ...data,
      status: 'offline' as DeviceStatus,
      userId: auth.currentUser.uid
    }
    
    const deviceId = await FirebaseService.createDevice(deviceData)
    
    // Log device creation
    await FirebaseService.createAuditLog({
      action: 'device.add',
      severity: 'info',
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email!,
      resourceType: 'device',
      resourceId: deviceId,
      details: { eid: data.eid, name: data.name, connectionType: data.connectionType },
      success: true
    })
    
    return deviceId
  }
  
  static async getUserDevices(): Promise<FirestoreDevice[]> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    return FirebaseService.getUserDevices(auth.currentUser.uid)
  }
  
  static async updateDevice(deviceId: string, updates: UpdateDeviceData): Promise<void> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    
    await FirebaseService.updateDevice(deviceId, updates)
    
    // Log device update
    await FirebaseService.createAuditLog({
      action: updates.status === 'online' ? 'device.connect' : 
              updates.status === 'offline' ? 'device.disconnect' : 'device.update',
      severity: 'info',
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email!,
      resourceType: 'device',
      resourceId: deviceId,
      details: updates,
      success: true
    })
  }
  
  static async deleteDevice(deviceId: string): Promise<void> {
    if (!auth.currentUser) throw new Error('User not authenticated')
    
    await FirebaseService.deleteDevice(deviceId)
    
    // Log device deletion
    await FirebaseService.createAuditLog({
      action: 'device.remove',
      severity: 'info',
      userId: auth.currentUser.uid,
      userEmail: auth.currentUser.email!,
      resourceType: 'device',
      resourceId: deviceId,
      success: true
    })
  }
  
  static subscribeToDevices(callback: (devices: FirestoreDevice[]) => void) {
    if (!auth.currentUser) throw new Error('User not authenticated')
    return FirebaseService.subscribeToUserDevices(auth.currentUser.uid, callback)
  }
}