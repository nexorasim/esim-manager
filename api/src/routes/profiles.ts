import { Router } from 'express'
import { ESimProfileService } from '../services/ESimProfileService'
import { validateProfile, validateActivationCode } from '../middleware/validation'
import { authenticateToken } from '../middleware/auth'

const router = Router()
const profileService = new ESimProfileService()

// Get all profiles for authenticated user
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const userId = req.user?.id
    const profiles = await profileService.getProfiles(userId)
    res.json(profiles)
  } catch (error) {
    next(error)
  }
})

// Get specific profile
router.get('/:iccid', authenticateToken, async (req, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user?.id
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
router.post('/provision', authenticateToken, validateActivationCode, async (req, res, next) => {
  try {
    const { activationCode } = req.body
    const userId = req.user?.id
    
    const profile = await profileService.provisionProfile(activationCode, userId)
    res.status(201).json(profile)
  } catch (error) {
    next(error)
  }
})

// Activate profile
router.post('/:iccid/activate', authenticateToken, async (req, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user?.id
    
    const success = await profileService.activateProfile(iccid, userId)
    if (!success) {
      return res.status(400).json({ error: 'Failed to activate profile' })
    }
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Deactivate profile
router.post('/:iccid/deactivate', authenticateToken, async (req, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user?.id
    
    const success = await profileService.deactivateProfile(iccid, userId)
    if (!success) {
      return res.status(400).json({ error: 'Failed to deactivate profile' })
    }
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Remove profile
router.delete('/:iccid', authenticateToken, async (req, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user?.id
    
    const success = await profileService.removeProfile(iccid, userId)
    if (!success) {
      return res.status(400).json({ error: 'Failed to remove profile' })
    }
    
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

// Generate Universal Link
router.get('/:iccid/universal-link', authenticateToken, async (req, res, next) => {
  try {
    const { iccid } = req.params
    const userId = req.user?.id
    
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