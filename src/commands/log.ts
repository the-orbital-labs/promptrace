import { getDb } from '../db.js'
import chalk from 'chalk'

export function logCommand(name: string) {
  const db = getDb()

  const rows = db.prepare(`
    SELECT * FROM prompts WHERE name = ? ORDER BY version DESC
  `).all(name) as { id: number, name: string, content: string, version: number, message: string, created_at: string }[]

  if (rows.length === 0) {
    console.log(chalk.yellow(`No prompt found: '${name}'`))
    db.close()
    return
  }

  console.log(chalk.bold(`\nHistory for '${name}':\n`))

  for (const row of rows) {
    console.log(chalk.cyan(`v${row.version}`) + chalk.gray(` - ${row.created_at}`))
    console.log(`  ${row.content}`)
    console.log()
  }

  db.close()
}
