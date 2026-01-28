import { Router } from 'express'
import { ESimProfileService } from '../services/ESimProfileService'
import { AuditService } from '../services/AuditService'
import { validateActivationCode } from '../middleware/validation'
import { authenticateToken, isOperator, AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const profileService = new ESimProfileService()
const auditService = new AuditService()

// Get all profiles for authenticated user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.id
    const profiles = await profileService.getProfiles(userId)
    res.json(profiles)
  } catch (error) {
    next(error)
  }
})

// Get profile stats
router.get('/stats', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const userId = req.user!.role === 'admin' ? undefined : req.user!.id
    const stats = await profileService.getStats(userId)
    res.json(stats)
  } catch (error) {
    next(error)
  }
})

// Get specific profile
router.get('/:iccid', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user!.id
    const profile = await profileService.getProfile(iccid, userId)
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    
    res.json(profile)
  } catch (error) {
    next(error)
  }
})

// Provision new profile
router.post('/provision', authenticateToken, isOperator, validateActivationCode, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { activationCode, name } = req.body
    const userId = req.user!.id
    
    const profile = await profileService.provisionProfile(activationCode, userId, name)
    
    await auditService.log({
      action: 'profile.create',
      userId,
      userEmail: req.user!.email,
      resourceType: 'profile',
      resourceId: profile.iccid,
      details: { name: profile.name },
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.status(201).json(profile)
  } catch (error) {
    next(error)
  }
})

// Activate profile
router.post('/:iccid/activate', authenticateToken, isOperator, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user!.id
    
    const success = await profileService.activateProfile(iccid, userId)
    if (!success) {
      return res.status(400).json({ error: 'Failed to activate profile' })
    }
    
    await auditService.log({
      action: 'profile.activate',
      userId,
      userEmail: req.user!.email,
      resourceType: 'profile',
      resourceId: iccid,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Deactivate profile
router.post('/:iccid/deactivate', authenticateToken, isOperator, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user!.id
    
    const success = await profileService.deactivateProfile(iccid, userId)
    if (!success) {
      return res.status(400).json({ error: 'Failed to deactivate profile' })
    }
    
    await auditService.log({
      action: 'profile.deactivate',
      userId,
      userEmail: req.user!.email,
      resourceType: 'profile',
      resourceId: iccid,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Remove profile
router.delete('/:iccid', authenticateToken, isOperator, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user!.id
    
    const success = await profileService.removeProfile(iccid, userId)
    if (!success) {
      return res.status(400).json({ error: 'Failed to remove profile' })
    }
    
    await auditService.log({
      action: 'profile.delete',
      userId,
      userEmail: req.user!.email,
      resourceType: 'profile',
      resourceId: iccid,
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    })
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Assign profile to device
router.post('/:iccid/assign', authenticateToken, isOperator, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { iccid } = req.params
    const { deviceId } = req.body
    const userId = req.user!.id
    
    const success = await profileService.assignToDevice(iccid, userId, deviceId)
    if (!success) {
      return res.status(400).json({ error: 'Failed to assign profile to device' })
    }
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Generate Universal Link
router.get('/:iccid/universal-link', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user!.id
    
    const link = await profileService.generateUniversalLink(iccid, userId)
    if (!link) {
      return res.status(404).json({ error: 'Profile not found' })
    }
    
    res.json(link)
  } catch (error) {
    next(error)
  }
})

export { router as profileRoutes }
