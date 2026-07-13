import { getDb } from '../db.js'
import chalk from 'chalk'

export function addCommand(name: string, content: string, options: { message?: string }) {
  const db = getDb()

  const latest = db.prepare(
    'SELECT MAX(version) as v FROM prompts WHERE name = ?'
  ).get(name) as { v: number | null }

  const nextVersion = (latest?.v ?? 0) + 1

  db.prepare(`
    INSERT INTO prompts (name, content, version, message)
    VALUES (?, ?, ?, ?)
  `).run(name, content, nextVersion, options.message ?? null)

  console.log(chalk.green(`Added '${name}' -> v${nextVersion}`))
  db.close()
}
