# Using and editing my-extension

my-extension runs inside [Antinote](https://antinote.io/extensions/) on macOS. Antinote loads `index.js` and `extension.json` from this folder. You edit `index.ts`, then compile it. See [DEVELOPMENT.md](DEVELOPMENT.md).

## Run it locally

The folder must be named `my-extension` and sit here:

```text
~/Library/Application Support/Antinote/Extensions/my-extension
```

In Antinote, open **Settings > Extensions** and click **Reload Extensions**.

In a note:

- `::hello` inserts `Hello, there.`
- `::hello(Ada)` inserts `Hello, Ada.`
- `::open_docs` opens https://antinote.io/extensions/

The greeting word comes from the **Greeting** preference on this extension's Settings page. The default is `Hello`.

Logs: **Settings > Extensions > Enable Extension Logging**, then `console.log` in the script.

## Edit a command

1. Change or add a `new Command({...})` in `index.ts`.
2. Assign `execute`. Return `new ReturnObject({ status, message, payload })`.
3. Add the same command to `extension.json` `commands` with `name`, `description`, and `type`.
4. Compile `index.js` and reload extensions in Antinote.

`name` in `extension.json`, `extensionName` in the script, and this folder name must all stay `my-extension`.

Command `name` values are `snake_case` (`hello`, `open_docs`). The `::` prefix is what the user types; it is not part of the name.

`type` decides what Antinote does with `payload`:

| type | payload |
| --- | --- |
| `insert` | text inserted at the cursor |
| `replaceLine` | replaces the current line |
| `replaceAll` | replaces the whole note |
| `openURL` | URL or app URL scheme to open |

## Preferences

Register one with `extensionRoot.register_preference(new Preference({...}))`. Read it with `getExtensionPreference(extensionName, key)`. Antinote injects that function. The local test stub returns `null` until a test replaces it.

## Note text

`dataScope` is `none`, so `payload.fullText` is empty. Raise it only when a command needs the current line (`line`) or the whole note (`full`). Details are in [API.md](API.md).

## Network and AI

Do not call `fetch` yourself.

- HTTP goes through `callAPI`. Put each host in `endpoints` and each key id in `requiredAPIKeys`. The key stays in the macOS Keychain. `{{API_KEY}}` in the URL is substituted by Antinote. Turn on **Settings > Privacy > Let extensions call their own APIs**.
- Model calls go through `callAIProvider`. Depend on `ai_providers` and leave this extension's own `endpoints` and `requiredAPIKeys` empty unless this extension calls something else.

Patterns for both are in [API.md](API.md).
