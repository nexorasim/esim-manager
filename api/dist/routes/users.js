"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRoutes = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const AuthService_1 = require("../services/AuthService");
const AuditService_1 = require("../services/AuditService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.userRoutes = router;
const authService = new AuthService_1.AuthService();
const auditService = new AuditService_1.AuditService();
// Get all users (admin only)
router.get('/', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        const { role, isActive } = req.query;
        const users = await authService.getAllUsers({
            role: role,
            isActive: isActive === 'true' ? true : isActive === 'false' ? false : undefined
        });
        res.json(users);
    }
    catch (error) {
        next(error);
    }
});
// Create new user (admin only)
router.post('/', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({ error: 'Email, password, and name are required' });
        }
        const existingUser = await authService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await authService.createUser({
            email,
            password: hashedPassword,
            name,
            role: role || 'viewer'
        });
        await auditService.log({
            action: 'admin.user_create',
            userId: req.user.id,
            userEmail: req.user.email,
            resourceType: 'user',
            resourceId: user._id || user.id,
            details: { createdUserEmail: user.email, role: user.role },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(201).json({
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive
        });
    }
    catch (error) {
        next(error);
    }
});
// Update user (admin only)
router.put('/:id', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        const { name, role, isActive } = req.body;
        const updates = {};
        if (name !== undefined)
            updates.name = name;
        if (role !== undefined)
            updates.role = role;
        if (isActive !== undefined)
            updates.isActive = isActive;
        const user = await authService.updateUser(req.params.id, updates);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await auditService.log({
            action: 'admin.user_update',
            userId: req.user.id,
            userEmail: req.user.email,
            resourceType: 'user',
            resourceId: req.params.id,
            details: { updates },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.json({
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive
        });
    }
    catch (error) {
        next(error);
    }
});
// Delete user (admin only)
router.delete('/:id', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        // Prevent self-deletion
        if (req.params.id === req.user.id) {
            return res.status(400).json({ error: 'Cannot delete your own account' });
        }
        const success = await authService.deleteUser(req.params.id);
        if (!success) {
            return res.status(404).json({ error: 'User not found' });
        }
        await auditService.log({
            action: 'admin.user_delete',
            severity: 'warning',
            userId: req.user.id,
            userEmail: req.user.email,
            resourceType: 'user',
            resourceId: req.params.id,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=users.js.map