import express from 'express';
import multer from 'multer';
import { generateCode, getHistory } from '../controllers/codeGenerationController';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

export const codeGenerationRouter = express.Router();

const upload = multer({ storage: multer.memoryStorage() });

codeGenerationRouter.use(authenticateToken as express.RequestHandler);
codeGenerationRouter.post('/generate', upload.single('image'), generateCode as express.RequestHandler);
codeGenerationRouter.get('/history', getHistory as express.RequestHandler);

