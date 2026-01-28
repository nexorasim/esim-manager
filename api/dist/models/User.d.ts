import mongoose, { Document } from 'mongoose';
export type UserRole = 'admin' | 'operator' | 'viewer';
export interface IUser extends Document {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    isActive: boolean;
    lastLogin?: Date;
    failedLoginAttempts: number;
    lockedUntil?: Date;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}, any, IUser>;
//# sourceMappingURL=User.d.ts.map