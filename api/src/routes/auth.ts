import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { AuthService } from '../services/AuthService'
import { AuditService } from '../services/AuditService'
import { validateLogin, validateRegister } from '../middleware/validation'
import { authenticateToken, requireRole, AuthenticatedRequest } from '../middleware/auth'
import { env } from '../config/env'

const router = Router()
const authService = new AuthService()
const auditService = new AuditService()

// Register
router.post('/register', validateRegister, async (req, res, next) => {
  try {
    const { email, password, name } = req.body
    
    const existingUser = await authService.getUserByEmail(email)
    if (existingUser) {
      await auditService.log({
        action: 'user.register',
        severity: 'warning',
        userEmail: email,
        success: false,
        errorMessage: 'User already exists',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })
      return res.status(400).json({ error: 'User already exists' })
    }
    
    const hashedPassword = await bcrypt.hash(password, 12)
    const user = await authService.createUser({
      email,
      password: hashedPassword,
      name,
      role: 'viewer' // Default role
    })
    
    const userId = (user as any)._id || (user as any).id
    const token = jwt.sign(
      { email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn, subject: String(userId), issuer: env.jwt.issuer, audience: env.jwt.audience }
    )
    
    await auditService.log({
      action: 'user.register',
      userId: (user as any)._id || (user as any).id,
      userEmail: user.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.status(201).json({
      token,
      user: {
        id: (user as any)._id || (user as any).id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
})

// Login
router.post('/login', validateLogin, async (req, res, next) => {
  try {
    const { email, password } = req.body
    
    const user = await authService.getUserByEmail(email)
    if (!user) {
      await auditService.log({
        action: 'user.failed_login',
        severity: 'warning',
        userEmail: email,
        success: false,
        errorMessage: 'User not found',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    // Check if account is locked
    if (authService.isAccountLocked(user)) {
      await auditService.log({
        action: 'user.failed_login',
        severity: 'warning',
        userId: (user as any)._id || (user as any).id,
        userEmail: email,
        success: false,
        errorMessage: 'Account locked',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })
      return res.status(423).json({ error: 'Account locked. Try again later.' })
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      await authService.recordFailedLogin((user as any)._id || (user as any).id)
      await auditService.log({
        action: 'user.failed_login',
        severity: 'warning',
        userId: (user as any)._id || (user as any).id,
        userEmail: email,
        success: false,
        errorMessage: 'Invalid password',
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
      })
      return res.status(401).json({ error: 'Invalid credentials' })
    }
    
    await authService.recordSuccessfulLogin((user as any)._id || (user as any).id)
    
    const userId = (user as any)._id || (user as any).id
    const token = jwt.sign(
      { email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn, subject: String(userId), issuer: env.jwt.issuer, audience: env.jwt.audience }
    )
    
    await auditService.log({
      action: 'user.login',
      userId: (user as any)._id || (user as any).id,
      userEmail: user.email,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.json({
      token,
      user: {
        id: (user as any)._id || (user as any).id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
})

// Get current user
router.get('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const user = await authService.getUserById(req.user!.id)
    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }
    res.json({
      id: (user as any)._id || (user as any).id,
      email: user.email,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      lastLogin: user.lastLogin,
      createdAt: user.createdAt
    })
  } catch (error) {
    next(error)
  }
})

// Update profile
router.put('/me', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, currentPassword, newPassword } = req.body
    const updates: any = {}
    
    if (name) updates.name = name
    
    if (newPassword) {
      const user = await authService.getUserById(req.user!.id)
      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }
      
      const isValid = await bcrypt.compare(currentPassword, user.password)
      if (!isValid) {
        return res.status(400).json({ error: 'Current password is incorrect' })
      }
      
      updates.password = await bcrypt.hash(newPassword, 12)
    }
    
    const updatedUser = await authService.updateUser(req.user!.id, updates)
    if (!updatedUser) {
      return res.status(404).json({ error: 'User not found' })
    }
    
    res.json({
      id: (updatedUser as any)._id || (updatedUser as any).id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role
    })
  } catch (error) {
    next(error)
  }
})

// Refresh token
router.post('/refresh', async (req, res, next) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(401).json({ error: 'Token required' })
    }
    
    const decoded = jwt.verify(token, env.jwt.secret, { algorithms: ['HS256'], issuer: env.jwt.issuer, audience: env.jwt.audience }) as any
    const user = await authService.getUserById(decoded.id)
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' })
    }
    
    const newToken = jwt.sign(
      { email: user.email, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn, subject: String((user as any)._id || (user as any).id), issuer: env.jwt.issuer, audience: env.jwt.audience }
    )
    
    res.json({ token: newToken })
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' })
  }
})

// Logout (client-side token invalidation, server-side audit)
router.post('/logout', authenticateToken, async (req: AuthenticatedRequest, res) => {
  await auditService.log({
    action: 'user.logout',
    userId: req.user!.id,
    userEmail: req.user!.email,
    ipAddress: req.ip,
    userAgent: req.get('User-Agent')
  })
  res.json({ success: true })
})

export { router as authRoutes }
