import mongoose, { Document } from 'mongoose';
export interface IProfileTemplate extends Document {
    name: string;
    description?: string;
    provider: string;
    profileClass: 'operational' | 'test' | 'provisioning';
    defaultNotes?: string;
    metadata?: Record<string, any>;
    isActive: boolean;
    createdBy: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ProfileTemplate: mongoose.Model<IProfileTemplate, {}, {}, {}, mongoose.Document<unknown, {}, IProfileTemplate, {}, mongoose.DefaultSchemaOptions> & IProfileTemplate & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IProfileTemplate>;
//# sourceMappingURL=ProfileTemplate.d.ts.map