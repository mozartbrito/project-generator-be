"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
// Load environment variables
dotenv_1.default.config({ path: path_1.default.resolve(__dirname, "../.env") });
// Verify that the OPENAI_API_KEY is loaded
if (!process.env.OPENAI_API_KEY) {
    console.error("OPENAI_API_KEY is not set in the environment variables.");
    process.exit(1);
}
// Rest of your imports and code...
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const userRoutes_1 = require("./routes/userRoutes");
const codeGenerationRoutes_1 = require("./routes/codeGenerationRoutes");
const setup_1 = require("./database/setup");
const migrations_1 = require("./database/migrations");
const app = (0, express_1.default)();
const port = process.env.PORT || 3001;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
(() => __awaiter(void 0, void 0, void 0, function* () {
    const db = yield (0, setup_1.setupDatabase)();
    yield (0, migrations_1.runMigrations)(db);
}))();
// Routes
app.use("/api/users", userRoutes_1.userRouter);
app.use("/api/code-generation", codeGenerationRoutes_1.codeGenerationRouter);
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
