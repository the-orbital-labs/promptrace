import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'

const DIR = path.join(process.cwd(), '.trace')
const DB_PATH = path.join(DIR, 'store.db')

export function initDb() {
  if (fs.existsSync(DIR)) {
    console.log('Already initialized.')
    return
  }

  fs.mkdirSync(DIR)
  const db = new Database(DB_PATH)

  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `)

  db.close()
  console.log('Initialized empty Trace repo in .trace/')
}

export function getDb(): InstanceType<typeof Database> {
  if (!fs.existsSync(DIR)) {
    console.error('Not a Trace repo. Run: trace init')
    process.exit(1)
  }
  return new Database(DB_PATH)
}
