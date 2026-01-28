"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const uuid_1 = require("uuid");
const User_1 = require("../models/User");
const database_1 = require("../config/database");
// In-memory fallback storage
const memoryUsers = new Map();
const memoryEmailIndex = new Map();
class AuthService {
    async createUser(userData) {
        if ((0, database_1.isConnected)()) {
            const user = new User_1.User({
                email: userData.email.toLowerCase(),
                password: userData.password,
                name: userData.name,
                role: userData.role || 'viewer',
                isActive: true
            });
            await user.save();
            return user;
        }
        // Fallback to in-memory storage
        const id = (0, uuid_1.v4)();
        const user = {
            _id: id,
            id: id,
            email: userData.email.toLowerCase(),
            password: userData.password,
            name: userData.name,
            role: userData.role || 'viewer',
            isActive: true,
            failedLoginAttempts: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        memoryUsers.set(id, user);
        memoryEmailIndex.set(user.email, id);
        return user;
    }
    async getUserById(id) {
        if ((0, database_1.isConnected)()) {
            return User_1.User.findById(id).lean();
        }
        return memoryUsers.get(id) || null;
    }
    async getUserByEmail(email) {
        if ((0, database_1.isConnected)()) {
            return User_1.User.findOne({ email: email.toLowerCase() }).lean();
        }
        const userId = memoryEmailIndex.get(email.toLowerCase());
        return userId ? memoryUsers.get(userId) || null : null;
    }
    async updateUser(id, updates) {
        if ((0, database_1.isConnected)()) {
            return User_1.User.findByIdAndUpdate(id, { ...updates, updatedAt: new Date() }, { new: true }).lean();
        }
        const user = memoryUsers.get(id);
        if (!user)
            return null;
        const updatedUser = { ...user, ...updates, updatedAt: new Date() };
        memoryUsers.set(id, updatedUser);
        return updatedUser;
    }
    async getAllUsers(filters) {
        if ((0, database_1.isConnected)()) {
            const query = {};
            if (filters?.role)
                query.role = filters.role;
            if (filters?.isActive !== undefined)
                query.isActive = filters.isActive;
            return User_1.User.find(query).select('-password').lean();
        }
        return Array.from(memoryUsers.values()).filter(u => {
            if (filters?.role && u.role !== filters.role)
                return false;
            if (filters?.isActive !== undefined && u.isActive !== filters.isActive)
                return false;
            return true;
        });
    }
    async deleteUser(id) {
        if ((0, database_1.isConnected)()) {
            const result = await User_1.User.findByIdAndDelete(id);
            return !!result;
        }
        const user = memoryUsers.get(id);
        if (!user)
            return false;
        memoryUsers.delete(id);
        memoryEmailIndex.delete(user.email);
        return true;
    }
    async recordFailedLogin(id) {
        const user = await this.getUserById(id);
        if (user) {
            const attempts = (user.failedLoginAttempts || 0) + 1;
            const updates = { failedLoginAttempts: attempts };
            if (attempts >= 5) {
                updates.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 minutes
            }
            await this.updateUser(id, updates);
        }
    }
    async recordSuccessfulLogin(id) {
        await this.updateUser(id, {
            failedLoginAttempts: 0,
            lockedUntil: undefined,
            lastLogin: new Date()
        });
    }
    isAccountLocked(user) {
        if (!user.lockedUntil)
            return false;
        return new Date(user.lockedUntil) > new Date();
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=AuthService.js.map