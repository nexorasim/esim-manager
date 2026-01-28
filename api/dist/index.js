"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const dotenv_1 = __importDefault(require("dotenv"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const database_1 = require("./config/database");
const profiles_1 = require("./routes/profiles");
const auth_1 = require("./routes/auth");
const devices_1 = require("./routes/devices");
const audit_1 = require("./routes/audit");
const users_1 = require("./routes/users");
const templates_1 = require("./routes/templates");
const errorHandler_1 = require("./middleware/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const PORT = process.env.PORT || 3001;
// Rate limiting
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use('/api', limiter);
// Routes
app.use('/api/auth', auth_1.authRoutes);
app.use('/api/profiles', profiles_1.profileRoutes);
app.use('/api/devices', devices_1.deviceRoutes);
app.use('/api/audit', audit_1.auditRoutes);
app.use('/api/users', users_1.userRoutes);
app.use('/api/templates', templates_1.templateRoutes);
// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        service: 'NexoraSIM API'
    });
});
// Dashboard stats endpoint
app.get('/api/stats', async (req, res) => {
    res.json({
        profiles: { total: 0, active: 0, inactive: 0, pending: 0 },
        devices: { total: 0, online: 0, offline: 0 },
        users: { total: 0 }
    });
});
// Error handling
app.use(errorHandler_1.errorHandler);
// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Connect to database and start server
const startServer = async () => {
    await (0, database_1.connectDatabase)();
    if (process.env.NODE_ENV !== 'production') {
        app.listen(PORT, () => {
            console.log(`NexoraSIM API running on port ${PORT}`);
        });
    }
};
startServer();
//# sourceMappingURL=index.js.map