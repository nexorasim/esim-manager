import mongoose, { Document } from 'mongoose';
export type ConnectionType = 'wlan' | 'bluetooth' | 'usb';
export type DeviceStatus = 'online' | 'offline' | 'error';
export interface IDevice extends Document {
    name: string;
    eid: string;
    connectionType: ConnectionType;
    status: DeviceStatus;
    ipAddress?: string;
    macAddress?: string;
    lastSeen?: Date;
    userId: mongoose.Types.ObjectId;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const Device: mongoose.Model<IDevice, {}, {}, {}, mongoose.Document<unknown, {}, IDevice, {}, mongoose.DefaultSchemaOptions> & IDevice & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IDevice>;
//# sourceMappingURL=Device.d.ts.map