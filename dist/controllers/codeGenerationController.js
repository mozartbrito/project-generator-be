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
exports.generateCode = generateCode;
exports.getHistory = getHistory;
const openai_1 = __importDefault(require("openai"));
const setup_1 = require("../database/setup");
const openai = new openai_1.default({
    apiKey: process.env.OPENAI_API_KEY,
});
function generateCode(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { prompt } = req.body;
        const userId = req.userId; // Assuming middleware sets this
        const db = yield (0, setup_1.setupDatabase)();
        try {
            const completion = yield openai.chat.completions.create({
                model: "gpt-3.5-turbo",
                messages: [
                    { role: "system", content: "You are a helpful assistant that generates React code." },
                    { role: "user", content: prompt }
                ],
            });
            const generatedCode = completion.choices[0].message.content;
            // Save to database
            yield db.run('INSERT INTO code_generations (user_id, prompt, generated_code) VALUES (?, ?, ?)', [userId, prompt, generatedCode]);
            res.json({ code: generatedCode });
        }
        catch (error) {
            console.error('Error generating code:', error);
            res.status(500).json({ error: 'Error generating code' });
        }
    });
}
function getHistory(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const userId = req.userId;
        const db = yield (0, setup_1.setupDatabase)();
        try {
            const history = yield db.all('SELECT * FROM code_generations WHERE user_id = ? ORDER BY created_at DESC', [userId]);
            res.json(history);
        }
        catch (error) {
            console.error('Error fetching history:', error);
            res.status(500).json({ error: 'Error fetching history' });
        }
    });
}
