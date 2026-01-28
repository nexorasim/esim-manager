import { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'operator' | 'viewer'
export type ProfileStatus = 'active' | 'inactive' | 'pending' | 'deleted'
export type ProfileClass = 'operational' | 'test' | 'provisioning'
export type ConnectionType = 'wlan' | 'bluetooth' | 'usb'
export type DeviceStatus = 'online' | 'offline' | 'error'
export type AuditAction = 
  | 'user.login' | 'user.logout' | 'user.register' | 'user.failed_login'
  | 'profile.create' | 'profile.activate' | 'profile.deactivate' | 'profile.delete'
  | 'device.add' | 'device.remove' | 'device.connect' | 'device.disconnect'
  | 'admin.user_create' | 'admin.user_update' | 'admin.user_delete'
  | 'system.config_change'
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface FirestoreUser {
  id: string
  email: string
  name: string
  role: UserRole
  isActive: boolean
  lastLogin?: Timestamp
  failedLoginAttempts: number
  lockedUntil?: Timestamp
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreProfile {
  id: string
  iccid: string
  name: string
  provider: string
  status: ProfileStatus
  profileClass: ProfileClass
  userId: string
  deviceId?: string
  activatedDate?: Timestamp
  deactivatedDate?: Timestamp
  customNotes?: string
  metadata?: Record<string, any>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreDevice {
  id: string
  name: string
  eid: string
  connectionType: ConnectionType
  status: DeviceStatus
  ipAddress?: string
  macAddress?: string
  lastSeen?: Timestamp
  userId: string
  metadata?: Record<string, any>
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreAuditLog {
  id: string
  action: AuditAction
  severity: AuditSeverity
  userId?: string
  userEmail?: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  timestamp: Timestamp
}