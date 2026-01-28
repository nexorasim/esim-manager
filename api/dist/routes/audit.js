"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRoutes = void 0;
const express_1 = require("express");
const AuditService_1 = require("../services/AuditService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.auditRoutes = router;
const auditService = new AuditService_1.AuditService();
// Get audit logs (admin only)
router.get('/', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        const { userId, action, severity, startDate, endDate, page, limit } = req.query;
        const result = await auditService.getAuditLogs({
            userId: userId,
            action: action,
            severity: severity,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 50
        });
        res.json(result);
    }
    catch (error) {
        next(error);
    }
});
// Get recent activity
router.get('/recent', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const limit = req.query.limit ? parseInt(req.query.limit) : 10;
        const logs = await auditService.getRecentActivity(limit);
        res.json(logs);
    }
    catch (error) {
        next(error);
    }
});
// Get security alerts (admin only)
router.get('/alerts', auth_1.authenticateToken, auth_1.isAdmin, async (req, res, next) => {
    try {
        const alerts = await auditService.getSecurityAlerts();
        res.json(alerts);
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=audit.js.map