import { AuditLog, IAuditLog, AuditAction, AuditSeverity } from '../models/AuditLog'

export interface AuditLogInput {
  action: AuditAction
  severity?: AuditSeverity
  userId?: string
  userEmail?: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success?: boolean
  errorMessage?: string
}

export class AuditService {
  async log(input: AuditLogInput): Promise<IAuditLog> {
    const auditEntry = new AuditLog({
      ...input,
      severity: input.severity || 'info',
      success: input.success !== false,
      timestamp: new Date()
    })
    
    try {
      await auditEntry.save()
    } catch (error) {
      console.error('Failed to save audit log:', error)
    }
    
    return auditEntry
  }

  async getAuditLogs(filters: {
    userId?: string
    action?: string
    severity?: string
    startDate?: Date
    endDate?: Date
    page?: number
    limit?: number
  }): Promise<{ logs: IAuditLog[]; total: number; pages: number }> {
    const query: any = {}
    
    if (filters.userId) query.userId = filters.userId
    if (filters.action) query.action = { $regex: filters.action, $options: 'i' }
    if (filters.severity) query.severity = filters.severity
    if (filters.startDate || filters.endDate) {
      query.timestamp = {}
      if (filters.startDate) query.timestamp.$gte = filters.startDate
      if (filters.endDate) query.timestamp.$lte = filters.endDate
    }

    const page = filters.page || 1
    const limit = filters.limit || 50
    const skip = (page - 1) * limit

    const [logs, total] = await Promise.all([
      AuditLog.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(query)
    ])

    return {
      logs: logs as IAuditLog[],
      total,
      pages: Math.ceil(total / limit)
    }
  }

  async getRecentActivity(limit: number = 10): Promise<IAuditLog[]> {
    return AuditLog.find()
      .sort({ timestamp: -1 })
      .limit(limit)
      .lean() as unknown as IAuditLog[]
  }

  async getSecurityAlerts(): Promise<IAuditLog[]> {
    return AuditLog.find({
      $or: [
        { severity: { $in: ['warning', 'error', 'critical'] } },
        { action: 'user.failed_login' }
      ]
    })
      .sort({ timestamp: -1 })
      .limit(20)
      .lean() as unknown as IAuditLog[]
  }
}
