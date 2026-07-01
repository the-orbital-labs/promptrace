import { getDb } from '../db.js'
import chalk from 'chalk'
import { diffWords } from 'diff'
import type { Change } from 'diff'

export function diffCommand(name: string, v1: string, v2: string) {
  const db = getDb()

  const rowA = db.prepare(
    'SELECT * FROM prompts WHERE name = ? AND version = ?'
  ).get(name, parseInt(v1)) as { content: string } | undefined

  const rowB = db.prepare(
    'SELECT * FROM prompts WHERE name = ? AND version = ?'
  ).get(name, parseInt(v2)) as { content: string } | undefined

  if (!rowA || !rowB) {
    console.log(chalk.red(`Could not find both versions for '${name}'`))
    db.close()
    return
  }

  console.log(chalk.bold(`\nDiff '${name}': v${v1} -> v${v2}\n`))

  const changes = diffWords(rowA.content, rowB.content)

  changes.forEach((part: Change) => {
    if (part.added) process.stdout.write(chalk.green(part.value))
    else if (part.removed) process.stdout.write(chalk.red(part.value))
    else process.stdout.write(chalk.gray(part.value))
  })

  console.log('\n')
  db.close()
}
