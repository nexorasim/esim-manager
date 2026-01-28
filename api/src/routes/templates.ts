import { Router } from 'express'
import { ProfileTemplateService } from '../services/ProfileTemplateService'
import { authenticateToken, isOperator, isAdmin, AuthenticatedRequest } from '../middleware/auth'

const router = Router()
const templateService = new ProfileTemplateService()

// Get all templates
router.get('/', authenticateToken, async (req, res, next) => {
  try {
    const templates = await templateService.getTemplates()
    res.json(templates)
  } catch (error) {
    next(error)
  }
})

// Get specific template
router.get('/:id', authenticateToken, async (req, res, next) => {
  try {
    const template = await templateService.getTemplate(req.params.id)
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }
    res.json(template)
  } catch (error) {
    next(error)
  }
})

// Create template (operator/admin)
router.post('/', authenticateToken, isOperator, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { name, description, provider, profileClass, defaultNotes, metadata } = req.body
    
    if (!name) {
      return res.status(400).json({ error: 'Template name is required' })
    }
    
    const template = await templateService.createTemplate({
      name,
      description,
      provider,
      profileClass,
      defaultNotes,
      metadata,
      createdBy: req.user!.id
    })
    
    res.status(201).json(template)
  } catch (error) {
    next(error)
  }
})

// Update template (admin only)
router.put('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const template = await templateService.updateTemplate(req.params.id, req.body)
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }
    res.json(template)
  } catch (error) {
    next(error)
  }
})

// Delete template (admin only)
router.delete('/:id', authenticateToken, isAdmin, async (req, res, next) => {
  try {
    const success = await templateService.deleteTemplate(req.params.id)
    if (!success) {
      return res.status(404).json({ error: 'Template not found' })
    }
    res.json({ success: true })
  } catch (error) {
    next(error)
  }
})

export { router as templateRoutes }
