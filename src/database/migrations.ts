import type { Database } from "sqlite"

export async function runMigrations(db: Database) {
  // Check if image_path column exists
  const tableInfo = await db.all("PRAGMA table_info(code_generations)")
  const imagePathColumnExists = tableInfo.some((column) => column.name === "image_path")

  if (!imagePathColumnExists) {
    // Add image_path column if it doesn't exist
    await db.exec(`
      ALTER TABLE code_generations ADD COLUMN image_path TEXT;
    `)
    console.log("Added image_path column to code_generations table")
  }
}

