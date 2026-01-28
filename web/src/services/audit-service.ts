import api from './api'

export interface AuditLog {
  _id: string
  action: string
  severity: 'info' | 'warning' | 'error' | 'critical'
  userId?: string
  userEmail?: string
  resourceType?: string
  resourceId?: string
  details?: Record<string, any>
  ipAddress?: string
  userAgent?: string
  success: boolean
  errorMessage?: string
  timestamp: string
}

export interface AuditLogsResponse {
  logs: AuditLog[]
  total: number
  pages: number
}

export const auditService = {
  async getAuditLogs(params?: {
    userId?: string
    action?: string
    severity?: string
    startDate?: string
    endDate?: string
    page?: number
    limit?: number
  }): Promise<AuditLogsResponse> {
    const response = await api.get('/api/audit', { params })
    return response.data
  },

  async getRecentActivity(limit: number = 10): Promise<AuditLog[]> {
    const response = await api.get('/api/audit/recent', { params: { limit } })
    return response.data
  },

  async getSecurityAlerts(): Promise<AuditLog[]> {
    const response = await api.get('/api/audit/alerts')
    return response.data
  }
}

export default auditService
