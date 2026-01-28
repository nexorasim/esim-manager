"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProfileTemplateService = void 0;
const uuid_1 = require("uuid");
const ProfileTemplate_1 = require("../models/ProfileTemplate");
const database_1 = require("../config/database");
const memoryTemplates = new Map();
class ProfileTemplateService {
    async getTemplates() {
        if ((0, database_1.isConnected)()) {
            return ProfileTemplate_1.ProfileTemplate.find({ isActive: true })
                .sort({ createdAt: -1 })
                .lean();
        }
        return Array.from(memoryTemplates.values()).filter(t => t.isActive);
    }
    async getTemplate(id) {
        if ((0, database_1.isConnected)()) {
            return ProfileTemplate_1.ProfileTemplate.findById(id).lean();
        }
        return memoryTemplates.get(id) || null;
    }
    async createTemplate(data) {
        if ((0, database_1.isConnected)()) {
            const template = new ProfileTemplate_1.ProfileTemplate({
                ...data,
                isActive: true
            });
            await template.save();
            return template;
        }
        const template = {
            _id: (0, uuid_1.v4)(),
            ...data,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        memoryTemplates.set(template._id, template);
        return template;
    }
    async updateTemplate(id, updates) {
        if ((0, database_1.isConnected)()) {
            return ProfileTemplate_1.ProfileTemplate.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
        }
        const template = memoryTemplates.get(id);
        if (!template)
            return null;
        Object.assign(template, updates, { updatedAt: new Date() });
        return template;
    }
    async deleteTemplate(id) {
        if ((0, database_1.isConnected)()) {
            const result = await ProfileTemplate_1.ProfileTemplate.findByIdAndUpdate(id, { isActive: false });
            return !!result;
        }
        const template = memoryTemplates.get(id);
        if (!template)
            return false;
        template.isActive = false;
        return true;
    }
}
exports.ProfileTemplateService = ProfileTemplateService;
//# sourceMappingURL=ProfileTemplateService.js.map