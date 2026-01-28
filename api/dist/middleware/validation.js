"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateProfile = exports.validateActivationCode = exports.validateRegister = exports.validateLogin = void 0;
const joi_1 = __importDefault(require("joi"));
const loginSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required()
});
const registerSchema = joi_1.default.object({
    email: joi_1.default.string().email().required(),
    password: joi_1.default.string().min(6).required(),
    name: joi_1.default.string().min(2).max(50).required()
});
const activationCodeSchema = joi_1.default.object({
    activationCode: joi_1.default.string().pattern(/^LPA:/).required()
});
const validateLogin = (req, res, next) => {
    const { error } = loginSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateLogin = validateLogin;
const validateRegister = (req, res, next) => {
    const { error } = registerSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: error.details[0].message });
    }
    next();
};
exports.validateRegister = validateRegister;
const validateActivationCode = (req, res, next) => {
    const { error } = activationCodeSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ error: 'Invalid activation code format' });
    }
    next();
};
exports.validateActivationCode = validateActivationCode;
const validateProfile = (req, res, next) => {
    const { iccid } = req.params;
    if (!iccid || iccid.length < 15) {
        return res.status(400).json({ error: 'Invalid ICCID' });
    }
    next();
};
exports.validateProfile = validateProfile;
//# sourceMappingURL=validation.js.map