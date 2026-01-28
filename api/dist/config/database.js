"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isConnected = exports.connectDatabase = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const connectDatabase = async () => {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'nexorasim';
    try {
        await mongoose_1.default.connect(`${mongoUrl}/${dbName}`);
        console.log('MongoDB connected successfully');
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        // Continue without MongoDB - use in-memory storage as fallback
    }
};
exports.connectDatabase = connectDatabase;
const isConnected = () => {
    return mongoose_1.default.connection.readyState === 1;
};
exports.isConnected = isConnected;
//# sourceMappingURL=database.js.map