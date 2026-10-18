# Antinote Boilerplate

Starter [Antinote](https://antinote.io/extensions/) extension for the macOS app Antinote 2.0 or later. It runs inside a note: type `::`, pick a command, press Return.

This copy does not read your note. `dataScope` is `none`.

To publish it in the community catalog, follow [COMMUNITY.md](COMMUNITY.md).

## Try It

1. Copy this folder into the extensions folder. The default path is `~/Library/Application Support/Antinote/Extensions/`. The folder name must stay `boilerplate` until you rename the extension.
2. In Antinote, open **Settings > Extensions** and click **Reload Extensions**.
3. In a note, type `::hello` or `::hello(Ada)`.
4. Type `::open_docs` to open the extensions guide.

`::hello` uses the **Greeting** preference on this extension's page in Settings. The default is `Hello`.

From Terminal:

```sh
open ~/Library/Application\ Support/Antinote/Extensions
```

## Layout

```
boilerplate/
  extension.json    metadata Antinote reads
  index.js          commands
  index.test.js     standalone check
  README.md
```

`extension.json` and the `new Extension({...})` call must agree on `name` and `version`. The folder name must match `name`. Command names are `snake_case`.

## Make it yours

1. Rename the folder, `extension.json` `"name"`, and `extensionName` in `index.js` to the same `snake_case` ID.
2. Replace `your_name`.
3. Replace `hello` and `open_docs`, or add another `new Command(...)`.
4. Add each command to the `commands` array in `extension.json` with `name`, `description`, and `type`.

### Command types:

| type | payload becomes |
| --- | --- |
| `insert` | text inserted at the cursor |
| `replaceLine` | the whole current line |
| `replaceAll` | the whole note |
| `openURL` | a URL or app URL scheme to open |

`dataScope` is per extension, not per command:

| value | `payload.fullText` |
| --- | --- |
| `none` | empty |
| `line` | the current line |
| `full` | the whole note |

Use the smallest scope that works. Raise it only when a command needs the line or the note. A command returns `new ReturnObject({status: "success"|"error", message, payload})`.

Preferences use `new Preference(...)` and `extensionRoot.register_preference(...)`. Read them with `getExtensionPreference(extensionName, key)`. Antinote provides that function.

## Other Kinds of Commands

Network calls go through `callAPI`. Declare every URL prefix in `endpoints` and every key ID in `requiredAPIKeys`. The key stays in the macOS Keychain. Put `{{API_KEY}}` in the URL and Antinote substitutes it. Turn on **Settings > Privacy > Let extensions call their own APIs**.

```js
var result = callAPI("apikey_example", "https://api.example.com/v1/item?key={{API_KEY}}", "GET", "{}", "");
```

AI commands should depend on the `ai_providers` extension and call `callAIProvider`. Leave `endpoints` and `requiredAPIKeys` empty. Set `dependencies` to `["ai_providers"]` and raise `dataScope` if the prompt needs note text.

```js
var result = callAIProvider(payload.fullText, {
  systemPrompt: "Summarize the note.",
  maxTokens: 200
});
```

Guides: [creating extensions](https://github.com/johnsonfung/antinote-extensions), [network](https://github.com/johnsonfung/antinote-extensions/blob/main/docs/NETWORK_EXTENSIONS.md), [AI](https://github.com/johnsonfung/antinote-extensions/blob/main/docs/AI_EXTENSIONS.md).

Logs: **Settings > Extensions > Enable Extension Logging**, then `console.log` in `index.js`.

## Check

```sh
node index.test.js
```

The test installs a small stand-in for Antinote's JavaScript runtime, then runs the commands. It does not load the app.
