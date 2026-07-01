# Trace

Git-style version control for LLM prompts.

Track changes, diff versions, and roll back prompts across your AI projects, from the terminal.

```bash
npm install -g trace
```

---

## The Problem

You're iterating on a system prompt. It was working great last week. You changed something, tone, structure, a single sentence, and now outputs are worse. You don't remember exactly what you changed. There's no diff. No history. No way back.

Most teams manage prompts in a Notion doc, a `.txt` file, or hardcoded strings in the repo. When something breaks, there's no audit trail.

Trace fixes that.

---

## Demo

```bash
$ trace init
Initialized empty Trace repo in .trace/

$ trace add qol/tutor/feedback "You are an Arabic tutor. Correct mistakes clearly."
Added 'qol/tutor/feedback' -> v1

$ trace add qol/tutor/feedback "You are an Arabic tutor. Correct mistakes gently. Be encouraging."
Added 'qol/tutor/feedback' -> v2

$ trace log qol/tutor/feedback
History for 'qol/tutor/feedback':

v2, 2026-07-01 12:22:34
  You are an Arabic tutor. Correct mistakes gently. Be encouraging.

v1, 2026-07-01 12:18:17
  You are an Arabic tutor. Correct mistakes clearly.

$ trace diff qol/tutor/feedback 1 2
Diff 'qol/tutor/feedback': v1 -> v2

You are an Arabic tutor. Correct mistakes [clearly -> gently]. Be encouraging.

$ trace rollback qol/tutor/feedback --to 1
Rolled back 'qol/tutor/feedback' to v1 -> saved as v3
```

---

## Commands

| Command | Description |
|---|---|
| `trace init` | Initialize a repo in the current directory |
| `trace add <name> <prompt>` | Add or update a prompt (auto-increments version) |
| `trace log <name>` | Show full version history for a prompt |
| `trace diff <name> <v1> <v2>` | Word-level diff between two versions |
| `trace rollback <name> --to <v>` | Roll back to a previous version (non-destructive) |

---

## How It Works

Running `trace init` creates a `.trace/` directory in your project with a local SQLite database. All prompt history is stored there, no cloud, no auth, no setup.

Add `.trace/` to `.gitignore` to keep it local, or commit it to share prompt history with your team.

---

## Prompt Naming

Use namespaced names to organize prompts across a project:

```
myapp/summarizer/system
myapp/classifier/user
myapp/onboarding/day1
```

Any string works, slashes are just a convention for readability.

---

## Roadmap

- [ ] `trace list`, list all tracked prompts
- [ ] `trace diff --semantic`, embedding-based semantic diff
- [ ] Commit messages (`trace add <name> <prompt> -m "soften tone"`)
- [ ] Remote sync for team sharing
- [ ] SDK: pull versioned prompts at runtime

---

## License

MIT
