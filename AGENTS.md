# AGENTS.md

Handoff for coding agents working on **my-extension**.

The project name is `my-extension` in every file: the folder, `extension.json` `"name"`, and `extensionName` in `index.ts` / `index.js`. Do not rename it to `boilerplate`, `exchange_rates`, or another title unless the user asks.

Repository: https://github.com/thaikolja/antinote-community-extensions-boilerplate

## Read first

1. [DOCUMENTATION/USING.md](DOCUMENTATION/USING.md) — install locally and edit commands.
2. [DOCUMENTATION/API.md](DOCUMENTATION/API.md) — runtime types. Do not invent APIs that are not in `antinote.d.ts`.
3. [DOCUMENTATION/DEVELOPMENT.md](DOCUMENTATION/DEVELOPMENT.md) — TypeScript, tests, and the license mismatch.
4. [DOCUMENTATION/PUBLISHING.md](DOCUMENTATION/PUBLISHING.md) — only when the task is a community-catalog pull request.

## Layout

| Path | Role |
| --- | --- |
| `index.ts` | Extension source. Antinote never loads this file. |
| `index.js` | What Antinote and `node index.test.js` run. Gitignored. Regenerate from `index.ts`. |
| `extension.json` | Metadata Antinote and the catalog validator read. |
| `antinote.d.ts` | Ambient types for the Antinote runtime. Not a module. |
| `index.test.ts` | Test source. |
| `index.test.js` | Test file `node` runs. Gitignored. Keep it in sync with `index.test.ts`. |
| `test-env.d.ts` | Node globals for the test typecheck. |
| `tsconfig.json` | Emits `index.js`. |
| `tsconfig.test.json` | Typecheck only (`noEmit`). |

## Rules

- Do not add `import` or `export` to `index.ts` or `antinote.d.ts`. Either one makes a module, and JavaScriptCore evaluates the extension as a script.
- Keep `extension.json` `"name"` and `"version"` identical to `new Extension({ name, version })`.
- Command names are `snake_case`: lowercase letters, numbers, underscores. Each command in code needs a matching `commands[]` entry (`name`, `description`, `type`).
- `"official"` stays `false`. Do not add `includedByDefault`.
- Use the smallest `dataScope` (`none`, then `line`, then `full`).
- Declare every network host in `endpoints` and every key id in `requiredAPIKeys`. `openURL` payloads are not API calls.
- In `.ts` files, put a `/** ... */` comment above each statement and leave a blank line after the statement.
- Source file headers say AGPL-3.0-or-later. `extension.json` `"license"` is `MIT`. Do not change either unless the user asks. See DEVELOPMENT.md.
- The catalog validator rejects a hyphen in the folder name. Publishing uses a snake_case id. This repo stays `my-extension`. See PUBLISHING.md.

## Verify

```sh
tsc --noEmit -p tsconfig.json
tsc --noEmit -p tsconfig.test.json
tsc -p tsconfig.json
node index.test.js
```

`node index.test.js` uses a local stand-in for Antinote. It does not launch the app. The catalog CI check is different; see PUBLISHING.md.

## Current behavior

- `::hello` / `::hello(Name)` inserts a greeting. Optional **Greeting** preference, default `Hello`.
- `::open_docs` returns `https://antinote.io/extensions/`.
- `dataScope` is `none`.
- One declared endpoint: `https://60797dd9460a6600174fbd2d.mockapi.io/location_url`. The script does not call it.
