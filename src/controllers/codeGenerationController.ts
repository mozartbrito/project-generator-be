import { Response } from 'express';
import OpenAI from 'openai';
import fs from 'fs/promises';
import path from 'path';
import { setupDatabase } from '../database/setup';
import { AuthenticatedRequest } from '../middleware/auth';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function generateCode(req: AuthenticatedRequest, res: Response) {
  const { prompt } = req.body;
  const userId = req.userId;
  const image = req.file; // Assuming we're using multer for file uploads
  const db = await setupDatabase();

  try {
    let imagePath = '';
    if (image) {
      const uploadDir = path.join(__dirname, '../../uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      imagePath = path.join(uploadDir, image.filename);
      await fs.writeFile(imagePath, image.buffer);
    }

    const messages: { role: string; content: string; name?: string }[] = [
      { role: "system", content: "You are a helpful assistant that generates React code." },
      { role: "user", content: prompt }
    ];

    if (image) {
      const imageBase64 = image.buffer.toString('base64');
      messages.push({
        role: "user",
        content: JSON.stringify([
          { type: "text", text: "Here's an image related to the code I want you to generate:" },
          { type: "image_url", image_url: `data:${image.mimetype};base64,${imageBase64}` }
        ])
      });
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview", // Make sure to use a model that supports image input
      messages,
      max_tokens: 1000,
    });

    const generatedCode = completion.choices[0].message.content;

    // Save to database
    await db.run(
      'INSERT INTO code_generations (user_id, prompt, generated_code, image_path) VALUES (?, ?, ?, ?)',
      [userId, prompt, generatedCode, imagePath]
    );

    res.json({ code: generatedCode });
  } catch (error) {
    console.error('Error generating code:', error);
    res.status(500).json({ error: 'Error generating code' });
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId;
  const db = await setupDatabase();

  try {
    const history = await db.all(
      'SELECT * FROM code_generations WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    res.json(history);
  } catch (error) {
    console.error('Error fetching history:', error);
    res.status(500).json({ error: 'Error fetching history' });
  }
}

