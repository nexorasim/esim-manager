"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRoutes = void 0;
const express_1 = require("express");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const AuthService_1 = require("../services/AuthService");
const AuditService_1 = require("../services/AuditService");
const validation_1 = require("../middleware/validation");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.authRoutes = router;
const authService = new AuthService_1.AuthService();
const auditService = new AuditService_1.AuditService();
// Register
router.post('/register', validation_1.validateRegister, async (req, res, next) => {
    try {
        const { email, password, name } = req.body;
        const existingUser = await authService.getUserByEmail(email);
        if (existingUser) {
            await auditService.log({
                action: 'user.register',
                severity: 'warning',
                userEmail: email,
                success: false,
                errorMessage: 'User already exists',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(400).json({ error: 'User already exists' });
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        const user = await authService.createUser({
            email,
            password: hashedPassword,
            name,
            role: 'viewer' // Default role
        });
        const token = jsonwebtoken_1.default.sign({ id: user._id || user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        await auditService.log({
            action: 'user.register',
            userId: user._id || user.id,
            userEmail: user.email,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(201).json({
            token,
            user: {
                id: user._id || user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Login
router.post('/login', validation_1.validateLogin, async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const user = await authService.getUserByEmail(email);
        if (!user) {
            await auditService.log({
                action: 'user.failed_login',
                severity: 'warning',
                userEmail: email,
                success: false,
                errorMessage: 'User not found',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        // Check if account is locked
        if (authService.isAccountLocked(user)) {
            await auditService.log({
                action: 'user.failed_login',
                severity: 'warning',
                userId: user._id || user.id,
                userEmail: email,
                success: false,
                errorMessage: 'Account locked',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(423).json({ error: 'Account locked. Try again later.' });
        }
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            await authService.recordFailedLogin(user._id || user.id);
            await auditService.log({
                action: 'user.failed_login',
                severity: 'warning',
                userId: user._id || user.id,
                userEmail: email,
                success: false,
                errorMessage: 'Invalid password',
                ipAddress: req.ip,
                userAgent: req.get('User-Agent')
            });
            return res.status(401).json({ error: 'Invalid credentials' });
        }
        await authService.recordSuccessfulLogin(user._id || user.id);
        const token = jsonwebtoken_1.default.sign({ id: user._id || user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        await auditService.log({
            action: 'user.login',
            userId: user._id || user.id,
            userEmail: user.email,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.json({
            token,
            user: {
                id: user._id || user.id,
                email: user.email,
                name: user.name,
                role: user.role
            }
        });
    }
    catch (error) {
        next(error);
    }
});
// Get current user
router.get('/me', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const user = await authService.getUserById(req.user.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: user._id || user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            isActive: user.isActive,
            lastLogin: user.lastLogin,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        next(error);
    }
});
// Update profile
router.put('/me', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { name, currentPassword, newPassword } = req.body;
        const updates = {};
        if (name)
            updates.name = name;
        if (newPassword) {
            const user = await authService.getUserById(req.user.id);
            if (!user) {
                return res.status(404).json({ error: 'User not found' });
            }
            const isValid = await bcryptjs_1.default.compare(currentPassword, user.password);
            if (!isValid) {
                return res.status(400).json({ error: 'Current password is incorrect' });
            }
            updates.password = await bcryptjs_1.default.hash(newPassword, 12);
        }
        const updatedUser = await authService.updateUser(req.user.id, updates);
        if (!updatedUser) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json({
            id: updatedUser._id || updatedUser.id,
            email: updatedUser.email,
            name: updatedUser.name,
            role: updatedUser.role
        });
    }
    catch (error) {
        next(error);
    }
});
// Refresh token
router.post('/refresh', async (req, res, next) => {
    try {
        const { token } = req.body;
        if (!token) {
            return res.status(401).json({ error: 'Token required' });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await authService.getUserById(decoded.id);
        if (!user) {
            return res.status(401).json({ error: 'Invalid token' });
        }
        const newToken = jsonwebtoken_1.default.sign({ id: user._id || user.id, email: user.email, role: user.role }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '7d' });
        res.json({ token: newToken });
    }
    catch (error) {
        res.status(401).json({ error: 'Invalid token' });
    }
});
// Logout (client-side token invalidation, server-side audit)
router.post('/logout', auth_1.authenticateToken, async (req, res) => {
    await auditService.log({
        action: 'user.logout',
        userId: req.user.id,
        userEmail: req.user.email,
        ipAddress: req.ip,
        userAgent: req.get('User-Agent')
    });
    res.json({ success: true });
});
//# sourceMappingURL=auth.js.map