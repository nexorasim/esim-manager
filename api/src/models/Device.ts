import mongoose, { Document, Schema } from 'mongoose'

export type ConnectionType = 'wlan' | 'bluetooth' | 'usb'
export type DeviceStatus = 'online' | 'offline' | 'error'

export interface IDevice extends Document {
  name: string
  eid: string
  connectionType: ConnectionType
  status: DeviceStatus
  ipAddress?: string
  macAddress?: string
  lastSeen?: Date
  userId: mongoose.Types.ObjectId
  metadata?: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

const deviceSchema = new Schema<IDevice>({
  name: { type: String, required: true },
  eid: { type: String, required: true, unique: true },
  connectionType: { type: String, enum: ['wlan', 'bluetooth', 'usb'], default: 'wlan' },
  status: { type: String, enum: ['online', 'offline', 'error'], default: 'offline' },
  ipAddress: { type: String },
  macAddress: { type: String },
  lastSeen: { type: Date },
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  metadata: { type: Schema.Types.Mixed }
}, { timestamps: true })

deviceSchema.index({ userId: 1 })
deviceSchema.index({ eid: 1 })
deviceSchema.index({ status: 1 })

export const Device = mongoose.model<IDevice>('Device', deviceSchema)
