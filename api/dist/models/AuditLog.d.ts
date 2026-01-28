import mongoose, { Document } from 'mongoose';
export type AuditAction = 'user.login' | 'user.logout' | 'user.register' | 'user.failed_login' | 'profile.create' | 'profile.activate' | 'profile.deactivate' | 'profile.delete' | 'device.add' | 'device.remove' | 'device.connect' | 'device.disconnect' | 'admin.user_create' | 'admin.user_update' | 'admin.user_delete' | 'system.config_change';
export type AuditSeverity = 'info' | 'warning' | 'error' | 'critical';
export interface IAuditLog extends Document {
    action: AuditAction;
    severity: AuditSeverity;
    userId?: mongoose.Types.ObjectId;
    userEmail?: string;
    resourceType?: string;
    resourceId?: string;
    details?: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
    timestamp: Date;
}
export declare const AuditLog: mongoose.Model<IAuditLog, {}, {}, {}, mongoose.Document<unknown, {}, IAuditLog, {}, mongoose.DefaultSchemaOptions> & IAuditLog & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IAuditLog>;
//# sourceMappingURL=AuditLog.d.ts.map