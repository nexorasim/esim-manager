"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ESimProfileService = void 0;
const uuid_1 = require("uuid");
const ESimProfile_1 = require("../models/ESimProfile");
const database_1 = require("../config/database");
// In-memory fallback storage
const memoryProfiles = new Map();
class ESimProfileService {
    async getProfiles(userId) {
        if ((0, database_1.isConnected)()) {
            return ESimProfile_1.ESimProfile.find({ userId, status: { $ne: 'deleted' } })
                .sort({ createdAt: -1 })
                .lean();
        }
        return Array.from(memoryProfiles.values())
            .filter(p => p.userId?.toString() === userId && p.status !== 'deleted');
    }
    async getProfile(iccid, userId) {
        if ((0, database_1.isConnected)()) {
            return ESimProfile_1.ESimProfile.findOne({ iccid, userId }).lean();
        }
        const profile = memoryProfiles.get(iccid);
        return profile && profile.userId?.toString() === userId ? profile : null;
    }
    async getAllProfiles(filters) {
        if ((0, database_1.isConnected)()) {
            const query = { status: { $ne: 'deleted' } };
            if (filters?.status)
                query.status = filters.status;
            if (filters?.deviceId)
                query.deviceId = filters.deviceId;
            return ESimProfile_1.ESimProfile.find(query).sort({ createdAt: -1 }).lean();
        }
        return Array.from(memoryProfiles.values()).filter(p => {
            if (p.status === 'deleted')
                return false;
            if (filters?.status && p.status !== filters.status)
                return false;
            if (filters?.deviceId && p.deviceId?.toString() !== filters.deviceId)
                return false;
            return true;
        });
    }
    async provisionProfile(activationCode, userId, name) {
        const parts = activationCode.split('$');
        if (parts.length < 2 || !parts[0].startsWith('LPA:')) {
            throw new Error('Invalid activation code format');
        }
        const iccid = this.generateICCID();
        if ((0, database_1.isConnected)()) {
            const profile = new ESimProfile_1.ESimProfile({
                iccid,
                name: name || `Profile ${Date.now()}`,
                provider: 'NexoraSIM',
                status: 'pending',
                profileClass: 'operational',
                userId
            });
            await profile.save();
            // Simulate provisioning delay
            setTimeout(async () => {
                await ESimProfile_1.ESimProfile.findByIdAndUpdate(profile._id, { status: 'inactive' });
            }, 2000);
            return profile;
        }
        // Fallback to in-memory
        const profile = {
            _id: (0, uuid_1.v4)(),
            iccid,
            name: name || `Profile ${Date.now()}`,
            provider: 'NexoraSIM',
            status: 'pending',
            profileClass: 'operational',
            userId,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        memoryProfiles.set(iccid, profile);
        setTimeout(() => {
            const p = memoryProfiles.get(iccid);
            if (p) {
                p.status = 'inactive';
                p.updatedAt = new Date();
            }
        }, 2000);
        return profile;
    }
    async activateProfile(iccid, userId) {
        if ((0, database_1.isConnected)()) {
            const result = await ESimProfile_1.ESimProfile.findOneAndUpdate({ iccid, userId, status: { $ne: 'active' } }, { status: 'active', activatedDate: new Date(), updatedAt: new Date() }, { new: true });
            return !!result;
        }
        const profile = await this.getProfile(iccid, userId);
        if (!profile || profile.status === 'active')
            return false;
        profile.status = 'active';
        profile.activatedDate = new Date();
        profile.updatedAt = new Date();
        return true;
    }
    async deactivateProfile(iccid, userId) {
        if ((0, database_1.isConnected)()) {
            const result = await ESimProfile_1.ESimProfile.findOneAndUpdate({ iccid, userId, status: 'active' }, { status: 'inactive', deactivatedDate: new Date(), updatedAt: new Date() }, { new: true });
            return !!result;
        }
        const profile = await this.getProfile(iccid, userId);
        if (!profile || profile.status !== 'active')
            return false;
        profile.status = 'inactive';
        profile.deactivatedDate = new Date();
        profile.updatedAt = new Date();
        return true;
    }
    async removeProfile(iccid, userId) {
        if ((0, database_1.isConnected)()) {
            const result = await ESimProfile_1.ESimProfile.findOneAndUpdate({ iccid, userId }, { status: 'deleted', updatedAt: new Date() }, { new: true });
            return !!result;
        }
        const profile = await this.getProfile(iccid, userId);
        if (!profile)
            return false;
        memoryProfiles.delete(iccid);
        return true;
    }
    async assignToDevice(iccid, userId, deviceId) {
        if ((0, database_1.isConnected)()) {
            const result = await ESimProfile_1.ESimProfile.findOneAndUpdate({ iccid, userId }, { deviceId, updatedAt: new Date() }, { new: true });
            return !!result;
        }
        const profile = await this.getProfile(iccid, userId);
        if (!profile)
            return false;
        profile.deviceId = deviceId;
        profile.updatedAt = new Date();
        return true;
    }
    async generateUniversalLink(iccid, userId) {
        const profile = await this.getProfile(iccid, userId);
        if (!profile)
            return null;
        const activationCode = `LPA:1$sm-dp.nexorasim.com$${iccid}`;
        const baseUrl = process.env.FRONTEND_URL || 'https://nexorasim.com';
        return {
            url: `${baseUrl}/esim/activate?code=${encodeURIComponent(activationCode)}`,
            qrCode: activationCode,
            appleLink: `https://esimsetup.apple.com/esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}`,
            androidLink: `intent://esim_qrcode_provisioning?carddata=${encodeURIComponent(activationCode)}#Intent;scheme=https;package=com.android.settings;end`
        };
    }
    async getStats(userId) {
        const query = { status: { $ne: 'deleted' } };
        if (userId)
            query.userId = userId;
        if ((0, database_1.isConnected)()) {
            const [total, active, inactive, pending] = await Promise.all([
                ESimProfile_1.ESimProfile.countDocuments(query),
                ESimProfile_1.ESimProfile.countDocuments({ ...query, status: 'active' }),
                ESimProfile_1.ESimProfile.countDocuments({ ...query, status: 'inactive' }),
                ESimProfile_1.ESimProfile.countDocuments({ ...query, status: 'pending' })
            ]);
            return { total, active, inactive, pending };
        }
        const profiles = Array.from(memoryProfiles.values()).filter(p => {
            if (p.status === 'deleted')
                return false;
            if (userId && p.userId?.toString() !== userId)
                return false;
            return true;
        });
        return {
            total: profiles.length,
            active: profiles.filter(p => p.status === 'active').length,
            inactive: profiles.filter(p => p.status === 'inactive').length,
            pending: profiles.filter(p => p.status === 'pending').length
        };
    }
    generateICCID() {
        const prefix = '8901';
        const countryCode = '234';
        const issuerCode = '567';
        const accountId = Math.random().toString().substr(2, 9);
        const checkDigit = this.calculateLuhnCheckDigit(prefix + countryCode + issuerCode + accountId);
        return prefix + countryCode + issuerCode + accountId + checkDigit;
    }
    calculateLuhnCheckDigit(number) {
        let sum = 0;
        let alternate = false;
        for (let i = number.length - 1; i >= 0; i--) {
            let n = parseInt(number.charAt(i), 10);
            if (alternate) {
                n *= 2;
                if (n > 9)
                    n = (n % 10) + 1;
            }
            sum += n;
            alternate = !alternate;
        }
        return ((10 - (sum % 10)) % 10).toString();
    }
}
exports.ESimProfileService = ESimProfileService;
//# sourceMappingURL=ESimProfileService.js.map