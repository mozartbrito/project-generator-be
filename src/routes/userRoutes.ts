import express from 'express';
import { register, login } from '../controllers/userController';

export const userRouter = express.Router();

userRouter.post('/register', register);
userRouter.post('/login', login);