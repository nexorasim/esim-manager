import { IAuditLog, AuditAction, AuditSeverity } from '../models/AuditLog';
export interface AuditLogInput {
    action: AuditAction;
    severity?: AuditSeverity;
    userId?: string;
    userEmail?: string;
    resourceType?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success?: boolean;
    errorMessage?: string;
}
export declare class AuditService {
    log(input: AuditLogInput): Promise<IAuditLog>;
    getAuditLogs(filters: {
        userId?: string;
        action?: string;
        severity?: string;
        startDate?: Date;
        endDate?: Date;
        page?: number;
        limit?: number;
    }): Promise<{
        logs: IAuditLog[];
        total: number;
        pages: number;
    }>;
    getRecentActivity(limit?: number): Promise<IAuditLog[]>;
    getSecurityAlerts(): Promise<IAuditLog[]>;
}
//# sourceMappingURL=AuditService.d.ts.map