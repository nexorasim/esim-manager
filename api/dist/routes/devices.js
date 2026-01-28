"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deviceRoutes = void 0;
const express_1 = require("express");
const DeviceService_1 = require("../services/DeviceService");
const AuditService_1 = require("../services/AuditService");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
exports.deviceRoutes = router;
const deviceService = new DeviceService_1.DeviceService();
const auditService = new AuditService_1.AuditService();
// Get all devices for user
router.get('/', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const devices = await deviceService.getDevices(req.user.id);
        res.json(devices);
    }
    catch (error) {
        next(error);
    }
});
// Get device stats
router.get('/stats', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const userId = req.user.role === 'admin' ? undefined : req.user.id;
        const stats = await deviceService.getStats(userId);
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
});
// Get specific device
router.get('/:eid', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const device = await deviceService.getDevice(req.params.eid, req.user.id);
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    }
    catch (error) {
        next(error);
    }
});
// Add new device
router.post('/', auth_1.authenticateToken, auth_1.isOperator, async (req, res, next) => {
    try {
        const { name, eid, connectionType, ipAddress, macAddress } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'Device name is required' });
        }
        const device = await deviceService.addDevice({
            name,
            eid,
            connectionType: connectionType || 'wlan',
            ipAddress,
            macAddress,
            userId: req.user.id
        });
        await auditService.log({
            action: 'device.add',
            userId: req.user.id,
            userEmail: req.user.email,
            resourceType: 'device',
            resourceId: device.eid,
            details: { name: device.name, connectionType: device.connectionType },
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.status(201).json(device);
    }
    catch (error) {
        next(error);
    }
});
// Update device
router.put('/:eid', auth_1.authenticateToken, auth_1.isOperator, async (req, res, next) => {
    try {
        const { name, connectionType, ipAddress, macAddress, metadata } = req.body;
        const device = await deviceService.updateDevice(req.params.eid, req.user.id, {
            name,
            connectionType,
            ipAddress,
            macAddress,
            metadata
        });
        if (!device) {
            return res.status(404).json({ error: 'Device not found' });
        }
        res.json(device);
    }
    catch (error) {
        next(error);
    }
});
// Update device status (for connection/disconnection)
router.post('/:eid/status', auth_1.authenticateToken, async (req, res, next) => {
    try {
        const { status } = req.body;
        if (!['online', 'offline', 'error'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const success = await deviceService.updateDeviceStatus(req.params.eid, req.user.id, status);
        if (!success) {
            return res.status(404).json({ error: 'Device not found' });
        }
        await auditService.log({
            action: status === 'online' ? 'device.connect' : 'device.disconnect',
            userId: req.user.id,
            userEmail: req.user.email,
            resourceType: 'device',
            resourceId: req.params.eid,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
// Remove device
router.delete('/:eid', auth_1.authenticateToken, auth_1.isOperator, async (req, res, next) => {
    try {
        const success = await deviceService.removeDevice(req.params.eid, req.user.id);
        if (!success) {
            return res.status(404).json({ error: 'Device not found' });
        }
        await auditService.log({
            action: 'device.remove',
            userId: req.user.id,
            userEmail: req.user.email,
            resourceType: 'device',
            resourceId: req.params.eid,
            ipAddress: req.ip,
            userAgent: req.get('User-Agent')
        });
        res.json({ success: true });
    }
    catch (error) {
        next(error);
    }
});
//# sourceMappingURL=devices.js.map