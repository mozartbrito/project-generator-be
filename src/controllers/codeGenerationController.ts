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
} from './prompts'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function generateCode(req: AuthenticatedRequest, res: Response) {
  const { prompt } = req.body
  const userId = req.userId
  const image = req.file
  const db = await setupDatabase()

  try {
    let imagePath = ""
    if (image) {
        /*console.log("Image received:", {
            filename: image.originalname,
            mimetype: image.mimetype,
            size: image.buffer.length,
            image
        })*/
      const uploadDir = path.join(__dirname, "../../uploads")
      //console.log("Upload directory:", uploadDir)

      await fs.mkdir(uploadDir, { recursive: true })
      const filename =
        image.originalname || `${Date.now()}-${Math.random().toString(36).substring(7)}.${image.mimetype.split("/")[1]}`
      imagePath = path.join(uploadDir, filename)

      //imagePath = path.join(uploadDir, image.filename)
      await fs.writeFile(imagePath, image.buffer)

      //console.log("File written to:", imagePath)

    }

    const messages = [
      {
        role: "system",
        content: OPEN_AI_SYSTEM_PROMPT,
      },
    ]

    if (image) {
      // Convert the image buffer to base64
      const base64Image = image.buffer.toString("base64")

      messages.push({
        role: "user",
        content: [
          {
            type: "text",
            text: prompt + '. ' + OPENAI_USER_PROMPT,
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
        content: prompt + '. ' + OPENAI_USER_PROMPT,
      })
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      max_tokens: 2000,
      temperature: 0.7,
    })

    const generatedCode = completion.choices[0].message.content

    // Save to database
    await db.run("INSERT INTO code_generations (user_id, prompt, generated_code, image_path) VALUES (?, ?, ?, ?)", [
      userId,
      prompt,
      generatedCode,
      imagePath,
    ])

    res.json({ code: generatedCode })
  } catch (error: any) {
    console.error("Error generating code:", error)
    if (error.message && error.message.includes("has been deprecated")) {
      res.status(500).json({
        error: "The AI model is currently unavailable. Please try again later or contact support.",
        details: error.message,
      })
    } else {
      res.status(500).json({
        error: "Error generating code. Please try again.",
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

