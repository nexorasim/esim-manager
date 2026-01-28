import mongoose, { Document, Schema } from 'mongoose'

export type AuditAction = 
  | 'user.login' | 'user.logout' | 'user.register' | 'user.failed_login'
  | 'profile.create' | 'profile.activate' | 'profile.deactivate' | 'profile.delete'
  | 'device.add' | 'device.remove' | 'device.connect' | 'device.disconnect'
  | 'admin.user_create' | 'admin.user_update' | 'admin.user_delete'
  | 'system.config_change'

export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical'

export interface IAuditLog extends Document {
  action: AuditAction
  severity: AuditSeverity
  userId?: mongoose.Types.ObjectId
  userEmail?: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  timestamp: Date
}

const auditLogSchema = new Schema<IAuditLog>({
  action: { type: String, required: true },
  severity: { type: String, enum: ['info', 'warning', 'error', 'critical'], default: 'info' },
  userId: { type: Schema.Types.ObjectId, ref: 'User' },
  userEmail: { type: String },
  resourceType: { type: String },
  resourceId: { type: String },
  details: { type: Schema.Types.Mixed },
  ipAddress: { type: String },
  userAgent: { type: String },
  success: { type: Boolean, default: true },
  errorMessage: { type: String },
  timestamp: { type: Date, default: Date.now }
})

auditLogSchema.index({ timestamp: -1 })
auditLogSchema.index({ action: 1 })
auditLogSchema.index({ userId: 1 })
auditLogSchema.index({ severity: 1 })

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', auditLogSchema)
