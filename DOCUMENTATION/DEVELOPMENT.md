# Development

*my-extension* is authored in TypeScript and executed as plain JavaScript. Antinote loads `index.js` only. This deviates from the documentation on developing extensions.

## Files

| File | Role |
| --- | --- |
| `index.ts` | Edit this. |
| `index.js` | Emitted by `tsc -p tsconfig.json`. Gitignored (`/index.js`). |
| `index.test.ts` | Edit this. |
| `index.test.js` | What `node index.test.js` runs. Gitignored (`/index.test.js`). `tsconfig.test.json` does not emit it. |
| `antinote.d.ts` | Ambient runtime types. Included by `tsconfig.json`. |
| `test-env.d.ts` | Node `require`, `process`, `__dirname`, and `console` for the test type-check. |
| `extension.json` | Manifest. Not compiled. |

`tsconfig.json` targets ES2015, `module: es2015`, `strict`, `outDir` `.`, and lists `index.ts` plus `antinote.d.ts`. It has no DOM lib and no `@types/node`.

`tsconfig.test.json` targets ES2020, `module: commonjs`, `noEmit: true`, and lists `index.test.ts` plus `test-env.d.ts`. `noImplicitAny` is off, so the small test helpers stay unannotated.

## Checks

```sh
tsc --noEmit -p tsconfig.json
tsc --noEmit -p tsconfig.test.json
tsc -p tsconfig.json
node index.test.js
```

The test installs a stand-in for `Extension`, `Command`, `Parameter`, `Preference`, `TutorialCommand`, `ReturnObject`, and `getExtensionPreference`, then evaluates `index.js` with `vm.runInThisContext`. It does not start Antinote.

When you change `index.test.ts`, update `index.test.js` to match before running `node`. Nothing in the repo compiles the test file for you.

## Comment style

In every `.ts` file, put a `/** ... */` block above each statement and leave a blank line after the statement. Keep the existing file header (`@file`, `@author`, `@license`).

## Do not turn the extension into a module

No `import` and no `export` in `index.ts` or `antinote.d.ts`. JavaScriptCore runs the extension as a script. Tests may import Node builtins; those files are not loaded by Antinote. `// @ts-ignore` sits on the line directly above each test import.

## License mismatch

File headers in the TypeScript sources say AGPL-3.0-or-later and point at https://www.gnu.org/licenses/agpl-3.0.html.

`extension.json` `"license"` is `MIT`. The local test asserts `MIT`. GitHub's license detector has no `LICENSE` file, so the README license badge reads the manifest field via shields.io.

Do not "fix" one side to match the other unless the user chooses a single license. A catalog pull request publishes the `license` field from `extension.json`.

## Version

`extension.json` `"version"` and `new Extension({ version })` are both `1.0.0`. The catalog validator errors when they differ. The README version badge reads `extension.json` from the `master` branch on GitHub, so it stays on the last pushed value until that file is pushed.
