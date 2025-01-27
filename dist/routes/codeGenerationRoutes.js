"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.codeGenerationRouter = void 0;
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const codeGenerationController_1 = require("../controllers/codeGenerationController");
const auth_1 = require("../middleware/auth");
exports.codeGenerationRouter = express_1.default.Router();
const upload = (0, multer_1.default)({ storage: multer_1.default.memoryStorage() });
exports.codeGenerationRouter.use(auth_1.authenticateToken);
exports.codeGenerationRouter.post('/generate', upload.single('image'), codeGenerationController_1.generateCode);
exports.codeGenerationRouter.get('/history', codeGenerationController_1.getHistory);
