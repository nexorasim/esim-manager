"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceService = void 0;
const uuid_1 = require("uuid");
const Device_1 = require("../models/Device");
const database_1 = require("../config/database");
// In-memory fallback storage
const memoryDevices = new Map();
class DeviceService {
    async getDevices(userId) {
        if ((0, database_1.isConnected)()) {
            return Device_1.Device.find({ userId })
                .sort({ lastSeen: -1 })
                .lean();
        }
        return Array.from(memoryDevices.values())
            .filter(d => d.userId?.toString() === userId);
    }
    async getDevice(eid, userId) {
        if ((0, database_1.isConnected)()) {
            return Device_1.Device.findOne({ eid, userId }).lean();
        }
        const device = memoryDevices.get(eid);
        return device && device.userId?.toString() === userId ? device : null;
    }
    async getDeviceById(id) {
        if ((0, database_1.isConnected)()) {
            return Device_1.Device.findById(id).lean();
        }
        return Array.from(memoryDevices.values()).find(d => d._id === id) || null;
    }
    async addDevice(data) {
        const eid = data.eid || this.generateEID();
        if ((0, database_1.isConnected)()) {
            const device = new Device_1.Device({
                ...data,
                eid,
                status: 'offline',
                lastSeen: new Date()
            });
            await device.save();
            return device;
        }
        const device = {
            _id: (0, uuid_1.v4)(),
            ...data,
            eid,
            status: 'offline',
            lastSeen: new Date(),
            createdAt: new Date(),
            updatedAt: new Date()
        };
        memoryDevices.set(eid, device);
        return device;
    }
    async updateDevice(eid, userId, updates) {
        if ((0, database_1.isConnected)()) {
            return Device_1.Device.findOneAndUpdate({ eid, userId }, { ...updates, updatedAt: new Date() }, { new: true }).lean();
        }
        const device = await this.getDevice(eid, userId);
        if (!device)
            return null;
        Object.assign(device, updates, { updatedAt: new Date() });
        return device;
    }
    async updateDeviceStatus(eid, userId, status) {
        const update = { status };
        if (status === 'online')
            update.lastSeen = new Date();
        const result = await this.updateDevice(eid, userId, update);
        return !!result;
    }
    async removeDevice(eid, userId) {
        if ((0, database_1.isConnected)()) {
            const result = await Device_1.Device.findOneAndDelete({ eid, userId });
            return !!result;
        }
        const device = await this.getDevice(eid, userId);
        if (!device)
            return false;
        memoryDevices.delete(eid);
        return true;
    }
    async getAllDevices(filters) {
        if ((0, database_1.isConnected)()) {
            const query = {};
            if (filters?.status)
                query.status = filters.status;
            if (filters?.connectionType)
                query.connectionType = filters.connectionType;
            return Device_1.Device.find(query).sort({ lastSeen: -1 }).lean();
        }
        return Array.from(memoryDevices.values()).filter(d => {
            if (filters?.status && d.status !== filters.status)
                return false;
            if (filters?.connectionType && d.connectionType !== filters.connectionType)
                return false;
            return true;
        });
    }
    async getStats(userId) {
        const query = {};
        if (userId)
            query.userId = userId;
        if ((0, database_1.isConnected)()) {
            const [total, online] = await Promise.all([
                Device_1.Device.countDocuments(query),
                Device_1.Device.countDocuments({ ...query, status: 'online' })
            ]);
            return { total, online, offline: total - online };
        }
        const devices = Array.from(memoryDevices.values()).filter(d => {
            if (userId && d.userId?.toString() !== userId)
                return false;
            return true;
        });
        return {
            total: devices.length,
            online: devices.filter(d => d.status === 'online').length,
            offline: devices.filter(d => d.status !== 'online').length
        };
    }
    generateEID() {
        // Generate a valid 32-digit EID
        const prefix = '89'; // Global platform identifier
        const countryCode = '049'; // Example country code
        const issuerCode = '001'; // Example issuer code
        const rest = Array.from({ length: 25 }, () => Math.floor(Math.random() * 10)).join('');
        return prefix + countryCode + issuerCode + rest;
    }
}
exports.DeviceService = DeviceService;
//# sourceMappingURL=DeviceService.js.map