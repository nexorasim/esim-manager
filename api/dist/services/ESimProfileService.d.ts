import { IESimProfile, ProfileStatus } from '../models/ESimProfile';
export interface UniversalLink {
    url: string;
    qrCode: string;
    appleLink: string;
    androidLink: string;
}
export declare class ESimProfileService {
    getProfiles(userId: string): Promise<IESimProfile[]>;
    getProfile(iccid: string, userId: string): Promise<IESimProfile | null>;
    getAllProfiles(filters?: {
        status?: ProfileStatus;
        deviceId?: string;
    }): Promise<IESimProfile[]>;
    provisionProfile(activationCode: string, userId: string, name?: string): Promise<IESimProfile>;
    activateProfile(iccid: string, userId: string): Promise<boolean>;
    deactivateProfile(iccid: string, userId: string): Promise<boolean>;
    removeProfile(iccid: string, userId: string): Promise<boolean>;
    assignToDevice(iccid: string, userId: string, deviceId: string): Promise<boolean>;
    generateUniversalLink(iccid: string, userId: string): Promise<UniversalLink | null>;
    getStats(userId?: string): Promise<{
        total: number;
        active: number;
        inactive: number;
        pending: number;
    }>;
    private generateICCID;
    private calculateLuhnCheckDigit;
}
//# sourceMappingURL=ESimProfileService.d.ts.map