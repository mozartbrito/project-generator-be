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
exports.generateCode = void 0;
exports.getHistory = getHistory;
const openai_1 = __importDefault(require("openai"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const setup_1 = require("../database/setup");
const prompts_1 = require("./prompts");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
const generateCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { prompt, code } = req.body;
    const userId = req.userId;
    const image = req.file;
    const type = req.query.type;
    const db = yield (0, setup_1.setupDatabase)();
    try {
        let imagePath = "";
        if (image) {
            const uploadDir = path_1.default.join(__dirname, "../../uploads");
            yield promises_1.default.mkdir(uploadDir, { recursive: true });
            const filename = image.originalname || `${Date.now()}-${Math.random().toString(36).substring(7)}.${image.mimetype.split("/")[1]}`;
            imagePath = path_1.default.join(uploadDir, filename);
            yield promises_1.default.writeFile(imagePath, image.buffer);
        }
        const messages = [
            {
                role: "system",
                content: type === "explain" ? prompts_1.OPEN_AI_SYSTEM_PROMPT_EXPLAIN : prompts_1.OPEN_AI_SYSTEM_PROMPT
            },
        ];
        if (type === "explain") {
            messages.push({
                role: "user",
                content: prompts_1.OPEN_AI_SYSTEM_PROMPT_EXPLAIN + `:\n\n${code}`,
            });
        }
        else if (image) {
            const base64Image = image.buffer.toString("base64");
            messages.push({
                role: "user",
                content: [
                    {
                        type: "text",
                        text: prompt + ". " + prompts_1.OPENAI_USER_PROMPT,
                    },
                    {
                        type: "image_url",
                        image_url: {
                            url: `data:${image.mimetype};base64,${base64Image}`,
                        },
                    },
                ],
            });
        }
        else {
            messages.push({
                role: "user",
                content: prompt + ". " + prompts_1.OPENAI_USER_PROMPT,
            });
        }
        const completion = yield openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: messages,
            max_tokens: 2000,
            temperature: 0.7,
        });
        const generatedContent = completion.choices[0].message.content;
        if (type === "explain") {
            res.json({ explanation: generatedContent });
        }
        else {
            // Save to database only for code generation, not for explanations
            yield db.run("INSERT INTO code_generations (user_id, prompt, generated_code, image_path) VALUES (?, ?, ?, ?)", [
                userId,
                prompt,
                generatedContent,
                imagePath,
            ]);
            res.json({ code: generatedContent });
        }
        //return res.json({ code: generatedContent })
    }
    catch (error) {
        console.error("Error generating code or explanation:", error);
        if (error.message && error.message.includes("has been deprecated")) {
            res.status(500).json({
                error: "The AI model is currently unavailable. Please try again later or contact support.",
                details: error.message,
            });
        }
        else {
            res.status(500).json({
                error: "Error generating code or explanation. Please try again.",
                details: error.message,
            });
        }
    }
});
exports.generateCode = generateCode;
function getHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        const db = yield (0, setup_1.setupDatabase)();
        try {
            const history = yield db.all("SELECT * FROM code_generations WHERE user_id = ? ORDER BY created_at DESC", [userId]);
            res.json(history);
        }
        catch (error) {
            console.error("Error fetching history:", error);
            res.status(500).json({ error: "Error fetching history" });
        }
    });
}
