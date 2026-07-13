import { getDb } from '../db.js'
import chalk from 'chalk'

export function listCommand() {
  const db = getDb()

  const rows = db.prepare(`
    SELECT name, MAX(version) as version, MAX(created_at) as created_at
    FROM prompts
    GROUP BY name
    ORDER BY name ASC
  `).all() as { name: string, version: number, created_at: string }[]

  if (rows.length === 0) {
    console.log(chalk.yellow('No prompts tracked yet.'))
    db.close()
    return
  }

  console.log(chalk.bold('\nTracked prompts:\n'))

  for (const row of rows) {
    console.log(`${row.name} ${chalk.cyan(`v${row.version}`)} ${chalk.gray(`- ${row.created_at}`)}`)
  }

  console.log()
  db.close()
}
