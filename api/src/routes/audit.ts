import { Router } from 'express'
import { AuditService } from '../services/AuditService'
import { authenticateToken, isAdmin, AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const auditService = new AuditService()

// Get audit logs (admin only)
router.get('/', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { userId, action, severity, startDate, endDate, page, limit } = req.query
    
    const result = await auditService.getAuditLogs({
      userId: userId as string,
      action: action as string,
      severity: severity as string,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
      page: page ? parseInt(page as string) : 1,
      limit: limit ? parseInt(limit as string) : 50
    })
    
    res.json(result)
  } catch (error) {
    next(error)
  }
})

// Get recent activity
router.get('/recent', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 10
    const logs = await auditService.getRecentActivity(limit)
    res.json(logs)
  } catch (error) {
    next(error)
  }
})

// Get security alerts (admin only)
router.get('/alerts', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const alerts = await auditService.getSecurityAlerts()
    res.json(alerts)
  } catch (error) {
    next(error)
  }
})

export { router as auditRoutes }
