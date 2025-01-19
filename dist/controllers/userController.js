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
exports.register = register;
exports.login = login;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const setup_1 = require("../database/setup");
function register(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        const db = yield (0, setup_1.setupDatabase)();
        try {
            const hashedPassword = yield bcrypt_1.default.hash(password, 10);
            yield db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
            res.status(201).json({ message: 'User created successfully' });
        }
        catch (error) {
            res.status(500).json({ error: 'Error creating user' });
        }
    });
}
function login(req, res) {
    return __awaiter(this, void 0, void 0, function* () {
        const { username, password } = req.body;
        const db = yield (0, setup_1.setupDatabase)();
        try {
            const user = yield db.get('SELECT * FROM users WHERE username = ?', [username]);
            if (user && (yield bcrypt_1.default.compare(password, user.password))) {
                const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
                res.json({ token });
            }
            else {
                res.status(401).json({ error: 'Invalid credentials' });
            }
        }
        catch (error) {
            res.status(500).json({ error: 'Error logging in' });
        }
    });
}
