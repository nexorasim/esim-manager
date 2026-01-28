import { IDevice, ConnectionType, DeviceStatus } from '../models/Device';
export declare class DeviceService {
    getDevices(userId: string): Promise<IDevice[]>;
    getDevice(eid: string, userId: string): Promise<IDevice | null>;
    getDeviceById(id: string): Promise<IDevice | null>;
    addDevice(data: {
        name: string;
        eid?: string;
        connectionType: ConnectionType;
        ipAddress?: string;
        macAddress?: string;
        userId: string;
    }): Promise<IDevice>;
    updateDevice(eid: string, userId: string, updates: Partial<IDevice>): Promise<IDevice | null>;
    updateDeviceStatus(eid: string, userId: string, status: DeviceStatus): Promise<boolean>;
    removeDevice(eid: string, userId: string): Promise<boolean>;
    getAllDevices(filters?: {
        status?: DeviceStatus;
        connectionType?: ConnectionType;
    }): Promise<IDevice[]>;
    getStats(userId?: string): Promise<{
        total: number;
        online: number;
        offline: number;
    }>;
    private generateEID;
}
//# sourceMappingURL=DeviceService.d.ts.map