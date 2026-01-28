"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuditService = void 0;
const AuditLog_1 = require("../models/AuditLog");
class AuditService {
    async log(input) {
        const auditEntry = new AuditLog_1.AuditLog({
            ...input,
            severity: input.severity || 'info',
            success: input.success !== false,
            timestamp: new Date()
        });
        try {
            await auditEntry.save();
        }
        catch (error) {
            console.error('Failed to save audit log:', error);
        }
        return auditEntry;
    }
    async getAuditLogs(filters) {
        const query = {};
        if (filters.userId)
            query.userId = filters.userId;
        if (filters.action)
            query.action = { $regex: filters.action, $options: 'i' };
        if (filters.severity)
            query.severity = filters.severity;
        if (filters.startDate || filters.endDate) {
            query.timestamp = {};
            if (filters.startDate)
                query.timestamp.$gte = filters.startDate;
            if (filters.endDate)
                query.timestamp.$lte = filters.endDate;
        }
        const page = filters.page || 1;
        const limit = filters.limit || 50;
        const skip = (page - 1) * limit;
        const [logs, total] = await Promise.all([
            AuditLog_1.AuditLog.find(query)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            AuditLog_1.AuditLog.countDocuments(query)
        ]);
        return {
            logs: logs,
            total,
            pages: Math.ceil(total / limit)
        };
    }
    async getRecentActivity(limit = 10) {
        return AuditLog_1.AuditLog.find()
            .sort({ timestamp: -1 })
            .limit(limit)
            .lean();
    }
    async getSecurityAlerts() {
        return AuditLog_1.AuditLog.find({
            $or: [
                { severity: { $in: ['warning', 'error', 'critical'] } },
                { action: 'user.failed_login' }
            ]
        })
            .sort({ timestamp: -1 })
            .limit(20)
            .lean();
    }
}
exports.AuditService = AuditService;
//# sourceMappingURL=AuditService.js.map