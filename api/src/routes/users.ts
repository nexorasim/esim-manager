import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { AuthService } from '../services/AuthService'
import { AuditService } from '../services/AuditService'
import { authenticateToken, isAdmin, AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const authService = new AuthService()
const auditService = new AuditService()

// Get all users (admin only)
router.get('/', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { role, isActive } = req.query
    const users = await authService.getAllUsers({
      role: role as any,
      isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
    })
    res.json(users)
  } catch (error) {
    next(error)
  }
})

// Create new user (admin only)
router.post('/', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { email, password, name, role } = req.body
    
    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Email, password, and name are required' })
    }
    
    const existingUser = await authService.getUserByEmail(email)
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await authService.createUser({
      email,
      password: hashedPassword,
      name,
      role: role || 'viewer'
    })
    
    await auditService.log({
      action: 'admin.user_create',
      userId: req.user!.id,
      userEmail: req.user!.email,
      resourceType: 'user',
      resourceId: (user as any)._id || (user as any).id,
      details: { createdUserEmail: user.email, role: user.role },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.status(201).json({
      id: (user as any)._id || (user as any).id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    })
  } catch (error) {
    next(error)
  }
})

// Update user (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, role, isActive } = req.body
    
    const updates: any = {}
    if (name !== undefined) updates.name = name
    if (role !== undefined) updates.role = role
    if (isActive !== undefined) updates.isActive = isActive
    
    const user = await authService.updateUser(req.params.id, updates)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    await auditService.log({
      action: 'admin.user_update',
      userId: req.user!.id,
      userEmail: req.user!.email,
      resourceType: 'user',
      resourceId: req.params.id,
      details: { updates },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.json({
      id: (user as any)._id || (user as any).id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive
    })
  } catch (error) {
    next(error)
  }
})

// Delete user (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req: AuthenticatedRequest, res, next) => {
  try {
    // Prevent self-deletion
    if (req.params.id === req.user!.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' })
    }
    
    const success = await authService.deleteUser(req.params.id)
    if (!success) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    await auditService.log({
      action: 'admin.user_delete',
      severity: 'warning',
      userId: req.user!.id,
      userEmail: req.user!.email,
      resourceType: 'user',
      resourceId: req.params.id,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export { router as userRoutes }
