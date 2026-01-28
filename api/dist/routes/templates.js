"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.templateRoutes = void 0;
const express_1 = require("express");
const ProfileTemplateService_1 = require("../services/ProfileTemplateService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.templateRoutes = router;
const templateService = new ProfileTemplateService_1.ProfileTemplateService();
// Get all templates
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const templates = await templateService.getTemplates();
        res.json(templates);
    }
    catch (error) {
        next(error);
    }
});
// Get specific template
router.get('/:id', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const template = await templateService.getTemplate(req.params.id);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(template);
    }
    catch (error) {
        next(error);
    }
});
// Create template (operator/admin)
router.post('/', auth_1.authenticateToken, auth_1.isOperator, async (req, res, next) => {
    try {
        const { name, description, provider, profileClass, defaultNotes, metadata } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Template name is required' });
        }
        const template = await templateService.createTemplate({
            name,
            description,
            provider,
            profileClass,
            defaultNotes,
            metadata,
            createdBy: req.user.id
        });
        res.status(201).json(template);
    }
    catch (error) {
        next(error);
    }
});
// Update template (admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        const template = await templateService.updateTemplate(req.params.id, req.body);
        if (!template) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json(template);
    }
    catch (error) {
        next(error);
    }
});
// Delete template (admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        const success = await templateService.deleteTemplate(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'Template not found' });
        }
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=templates.js.map