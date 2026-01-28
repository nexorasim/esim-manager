import mongoose, { Document } from 'mongoose';
export type ProfileStatus = 'active' | 'inactive' | 'pending' | 'deleted';
export type ProfileClass = 'operational' | 'test' | 'provisioning';
export interface IESimProfile extends Document {
    iccid: string;
    name: string;
    provider: string;
    status: ProfileStatus;
    profileClass: ProfileClass;
    userId: mongoose.Types.ObjectId;
    deviceId?: mongoose.Types.ObjectId;
    activatedDate?: Date;
    deactivatedDate?: Date;
    customNotes?: string;
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ESimProfile: mongoose.Model<IESimProfile, {}, {}, {}, mongoose.Document<unknown, {}, IESimProfile, {}, mongoose.DefaultSchemaOptions> & IESimProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IESimProfile>;
//# sourceMappingURL=ESimProfile.d.ts.map