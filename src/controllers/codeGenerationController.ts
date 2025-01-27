import type { Response } from "express"
import OpenAI from "openai"
import fs from "fs/promises"
import path from "path"
import { setupDatabase } from "../database/setup"
import type { AuthenticatedRequest } from "../middleware/auth"

import {
	OPENAI_USER_PROMPT,
	OPENAI_USER_PROMPT_WITH_PREVIOUS_DESIGN,
	OPEN_AI_SYSTEM_PROMPT,
  OPEN_AI_SYSTEM_PROMPT_EXPLAIN,
} from './prompts'

type MessageContent = string | { type: string; text?: string; image_url?: { url: string } }[]

interface Message {
  role: string
  content: MessageContent
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export const generateCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  const { prompt, code } = req.body
  const userId = req.userId
  const image = req.file
  const type = req.query.type as string | undefined
  const db = await setupDatabase()

  try {
    let imagePath = ""
    if (image) {
      const uploadDir = path.join(__dirname, "../../uploads")

      await fs.mkdir(uploadDir, { recursive: true })
      const filename =
        image.originalname || `${Date.now()}-${Math.random().toString(36).substring(7)}.${image.mimetype.split("/")[1]}`
      imagePath = path.join(uploadDir, filename)

      await fs.writeFile(imagePath, image.buffer)
    }

    const messages: Message[] = [
      {
        role: "system",
        content: type === "explain" ? OPEN_AI_SYSTEM_PROMPT_EXPLAIN : OPEN_AI_SYSTEM_PROMPT
      },
    ]

    if (type === "explain") {
        messages.push({
            role: "user",
            content: OPEN_AI_SYSTEM_PROMPT_EXPLAIN + `:\n\n${code}`,
        })
    } else if (image) {
        const base64Image = image.buffer.toString("base64")
        messages.push({
            role: "user",
            content: [
                {
                    type: "text",
                    text: prompt + ". " + OPENAI_USER_PROMPT,
                },
                {
                    type: "image_url",
                    image_url: {
                    url: `data:${image.mimetype};base64,${base64Image}`,
                    },
                },
            ],
        })
    } else {
        messages.push({
            role: "user",
            content: prompt + ". " + OPENAI_USER_PROMPT,
        })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages as any,
      max_tokens: 2000,
      temperature: 0.7,
    })

    const generatedContent = completion.choices[0].message.content

    if (type === "explain") {
        res.json({ explanation: generatedContent })
    } else {
        // Save to database only for code generation, not for explanations
        await db.run("INSERT INTO code_generations (user_id, prompt, generated_code, image_path) VALUES (?, ?, ?, ?)", [
            userId,
            prompt,
            generatedContent,
            imagePath,
        ])
        res.json({ code: generatedContent })
    }
    //return res.json({ code: generatedContent })
  } catch (error: any) {
    console.error("Error generating code or explanation:", error)
    if (error.message && error.message.includes("has been deprecated")) {
        res.status(500).json({
        error: "The AI model is currently unavailable. Please try again later or contact support.",
        details: error.message,
      })
    } else {
        res.status(500).json({
        error: "Error generating code or explanation. Please try again.",
        details: error.message,
      })
    }
  }
}

export async function getHistory(req: AuthenticatedRequest, res: Response) {
  const userId = req.userId
  const db = await setupDatabase()

  try {
    const history = await db.all("SELECT * FROM code_generations WHERE user_id = ? ORDER BY created_at DESC", [userId])
    res.json(history)
  } catch (error) {
    console.error("Error fetching history:", error)
    res.status(500).json({ error: "Error fetching history" })
  }
}

