#!/usr/bin/env node
import { Command } from 'commander'
import { initCommand } from './commands/init.js'
import { addCommand } from './commands/add.js'
import { logCommand } from './commands/log.js'
import { diffCommand } from './commands/diff.js'
import { rollbackCommand } from './commands/rollback.js'

const program = new Command()

program
  .name('promptrace')
  .description('Git-style version control for LLM prompts')
  .version('0.1.0')

program
  .command('init')
  .description('Initialize a promptrace repo')
  .action(initCommand)

program
  .command('add <name> <content>')
  .description('Add or update a prompt')
  .action(addCommand)

program
  .command('log <name>')
  .description('Show version history of a prompt')
  .action(logCommand)

program
  .command('diff <name> <v1> <v2>')
  .description('Show word-level diff between two versions')
  .action(diffCommand)

program
  .command('rollback <name>')
  .description('Roll back a prompt to a previous version')
  .option('--to <version>', 'Version to roll back to')
  .action(rollbackCommand)

program.parse()
