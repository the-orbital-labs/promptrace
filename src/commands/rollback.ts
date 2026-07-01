import { getDb } from '../db.js'
import chalk from 'chalk'

export function rollbackCommand(name: string, options: { to: string }) {
  const db = getDb()

  const target = db.prepare(
    'SELECT * FROM prompts WHERE name = ? AND version = ?'
  ).get(name, parseInt(options.to)) as { content: string, version: number } | undefined

  if (!target) {
    console.log(chalk.red(`Version v${options.to} not found for '${name}'`))
    db.close()
    return
  }

  const latest = db.prepare(
    'SELECT MAX(version) as v FROM prompts WHERE name = ?'
  ).get(name) as { v: number }

  const nextVersion = latest.v + 1

  db.prepare(`
    INSERT INTO prompts (name, content, version, message)
    VALUES (?, ?, ?, ?)
  `).run(name, target.content, nextVersion, `rollback to v${options.to}`)

  console.log(chalk.green(`Rolled back '${name}' to v${options.to} -> saved as v${nextVersion}`))
  db.close()
}
