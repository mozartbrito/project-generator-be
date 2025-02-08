import { Request, Response } from 'express';
import { login } from '../controllers/userController';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { setupDatabase } from '../database/setup';

jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('../database/setup');

describe('login', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let mockDb: any;

  beforeEach(() => {
    req = {
      body: {
        username: 'testuser',
        password: 'testpassword',
      },
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockDb = {
      get: jest.fn(),
    };
    (setupDatabase as jest.Mock).mockResolvedValue(mockDb);
  });

  it('should return a token and username for valid credentials', async () => {
    const user = { id: 1, username: 'testuser', password: 'hashedpassword' };
    mockDb.get.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);
    (jwt.sign as jest.Mock).mockReturnValue('testtoken');

    await login(req as Request, res as Response);

    expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
    expect(bcrypt.compare).toHaveBeenCalledWith('testpassword', 'hashedpassword');
    expect(jwt.sign).toHaveBeenCalledWith({ userId: 1 }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
    expect(res.json).toHaveBeenCalledWith({ token: 'testtoken', username: 'testuser' });
  });

  it('should return 401 for invalid credentials', async () => {
    mockDb.get.mockResolvedValue(null);

    await login(req as Request, res as Response);

    expect(mockDb.get).toHaveBeenCalledWith('SELECT * FROM users WHERE username = ?', ['testuser']);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
  });

  it('should return 500 for database errors', async () => {
    mockDb.get.mockRejectedValue(new Error('Database error'));

    await login(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error logging in' });
  });
});