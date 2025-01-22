import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { setupDatabase } from '../database/setup';

export async function register(req: Request, res: Response) {
  const { username, password } = req.body;
  const db = await setupDatabase();

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword]);
    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Error creating user' });
  }
}

export async function login(req: Request, res: Response) {
  const { username, password } = req.body;
  const db = await setupDatabase();

  try {
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
    if (user && await bcrypt.compare(password, user.password)) {
      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });
      res.json({ token, username: user.username }) 
      //const { password, ...userWithoutPassword } = user;
      //res.json({ token, user: userWithoutPassword });
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Error logging in' });
  }
}

