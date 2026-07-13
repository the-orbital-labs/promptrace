#!/usr/bin/env node
"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/index.ts
var import_commander = require("commander");

// src/db.ts
var import_better_sqlite3 = __toESM(require("better-sqlite3"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var DIR = import_path.default.join(process.cwd(), ".promptrace");
var DB_PATH = import_path.default.join(DIR, "store.db");
function initDb() {
  if (import_fs.default.existsSync(DIR)) {
    console.log("Already initialized.");
    return;
  }
  import_fs.default.mkdirSync(DIR);
  const db = new import_better_sqlite3.default(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS prompts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      version INTEGER NOT NULL DEFAULT 1,
      message TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  db.close();
  console.log("Initialized empty promptrace repo in .promptrace/");
}
function getDb() {
  if (!import_fs.default.existsSync(DIR)) {
    console.error("Not a promptrace repo. Run: promptrace init");
    process.exit(1);
  }
  return new import_better_sqlite3.default(DB_PATH);
}

// src/commands/init.ts
function initCommand() {
  initDb();
}

// src/commands/add.ts
var import_chalk = __toESM(require("chalk"), 1);
function addCommand(name, content, options) {
  const db = getDb();
  const latest = db.prepare(
    "SELECT MAX(version) as v FROM prompts WHERE name = ?"
  ).get(name);
  const nextVersion = (latest?.v ?? 0) + 1;
  db.prepare(`
    INSERT INTO prompts (name, content, version, message)
    VALUES (?, ?, ?, ?)
  `).run(name, content, nextVersion, options.message ?? null);
  console.log(import_chalk.default.green(`Added '${name}' -> v${nextVersion}`));
  db.close();
}

// src/commands/list.ts
var import_chalk2 = __toESM(require("chalk"), 1);
function listCommand() {
  const db = getDb();
  const rows = db.prepare(`
    SELECT name, MAX(version) as version, MAX(created_at) as created_at
    FROM prompts
    GROUP BY name
    ORDER BY name ASC
  `).all();
  if (rows.length === 0) {
    console.log(import_chalk2.default.yellow("No prompts tracked yet."));
    db.close();
    return;
  }
  console.log(import_chalk2.default.bold("\nTracked prompts:\n"));
  for (const row of rows) {
    console.log(`${row.name} ${import_chalk2.default.cyan(`v${row.version}`)} ${import_chalk2.default.gray(`- ${row.created_at}`)}`);
  }
  console.log();
  db.close();
}

// src/commands/log.ts
var import_chalk3 = __toESM(require("chalk"), 1);
function logCommand(name) {
  const db = getDb();
  const rows = db.prepare(`
    SELECT * FROM prompts WHERE name = ? ORDER BY version DESC
  `).all(name);
  if (rows.length === 0) {
    console.log(import_chalk3.default.yellow(`No prompt found: '${name}'`));
    db.close();
    return;
  }
  console.log(import_chalk3.default.bold(`
History for '${name}':
`));
  for (const row of rows) {
    console.log(import_chalk3.default.cyan(`v${row.version}`) + import_chalk3.default.gray(` - ${row.created_at}`));
    if (row.message) console.log(import_chalk3.default.gray(`  ${row.message}`));
    console.log(`  ${row.content}`);
    console.log();
  }
  db.close();
}

// src/commands/diff.ts
var import_chalk4 = __toESM(require("chalk"), 1);
var import_diff = require("diff");
function diffCommand(name, v1, v2) {
  const db = getDb();
  const rowA = db.prepare(
    "SELECT * FROM prompts WHERE name = ? AND version = ?"
  ).get(name, parseInt(v1));
  const rowB = db.prepare(
    "SELECT * FROM prompts WHERE name = ? AND version = ?"
  ).get(name, parseInt(v2));
  if (!rowA || !rowB) {
    console.log(import_chalk4.default.red(`Could not find both versions for '${name}'`));
    db.close();
    return;
  }
  console.log(import_chalk4.default.bold(`
Diff '${name}': v${v1} -> v${v2}
`));
  const changes = (0, import_diff.diffWords)(rowA.content, rowB.content);
  changes.forEach((part) => {
    if (part.added) process.stdout.write(import_chalk4.default.green(part.value));
    else if (part.removed) process.stdout.write(import_chalk4.default.red(part.value));
    else process.stdout.write(import_chalk4.default.gray(part.value));
  });
  console.log("\n");
  db.close();
}

// src/commands/rollback.ts
var import_chalk5 = __toESM(require("chalk"), 1);
function rollbackCommand(name, options) {
  const db = getDb();
  const target = db.prepare(
    "SELECT * FROM prompts WHERE name = ? AND version = ?"
  ).get(name, parseInt(options.to));
  if (!target) {
    console.log(import_chalk5.default.red(`Version v${options.to} not found for '${name}'`));
    db.close();
    return;
  }
  const latest = db.prepare(
    "SELECT MAX(version) as v FROM prompts WHERE name = ?"
  ).get(name);
  const nextVersion = latest.v + 1;
  db.prepare(`
    INSERT INTO prompts (name, content, version, message)
    VALUES (?, ?, ?, ?)
  `).run(name, target.content, nextVersion, `rollback to v${options.to}`);
  console.log(import_chalk5.default.green(`Rolled back '${name}' to v${options.to} -> saved as v${nextVersion}`));
  db.close();
}

// src/index.ts
var program = new import_commander.Command();
program.name("promptrace").description("Git-style version control for LLM prompts").version("0.1.0");
program.command("init").description("Initialize a promptrace repo").action(initCommand);
program.command("add <name> <content>").description("Add or update a prompt").option("-m, --message <message>", "Commit message describing the change").action(addCommand);
program.command("list").description("List all tracked prompts").action(listCommand);
program.command("log <name>").description("Show version history of a prompt").action(logCommand);
program.command("diff <name> <v1> <v2>").description("Show word-level diff between two versions").action(diffCommand);
program.command("rollback <name>").description("Roll back a prompt to a previous version").option("--to <version>", "Version to roll back to").action(rollbackCommand);
program.parse();
