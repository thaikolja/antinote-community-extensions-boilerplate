# API Reference

Types for the Antinote runtime live in `antinote.d.ts`. Antinote injects these names before it evaluates `index.js`. This file is ambient: do not add `import` or `export` to `antinote.d.ts` or `index.ts`.

Official upstream notes: [creating extensions](https://github.com/johnsonfung/antinote-extensions), [network](https://github.com/johnsonfung/antinote-extensions/blob/main/docs/NETWORK_EXTENSIONS.md), [AI](https://github.com/johnsonfung/antinote-extensions/blob/main/docs/AI_EXTENSIONS.md).

## extension.json

| Field | Role |
| --- | --- |
| `name` | Extension ID. Here it is `my-extension`. |
| `version` | Same string as `new Extension({ version })`. |
| `author` | Shown in the catalog. |
| `description` | One line about what my-extension does. |
| `license` | SPDX ID in the manifest. See [DEVELOPMENT.md](DEVELOPMENT.md) for the header mismatch. |
| `category` | Settings grouping. This copy uses `Utilities`. |
| `dataScope` | `none`, `line`, or `full`. |
| `endpoints` | URL prefixes the script may call. |
| `requiredAPIKeys` | Key IDs passed to `callAPI`. |
| `official` | `false` for a community extension. |
| `commands` | `{ name, description, type }` for each command. |
| `dependencies` | Other extension IDs. Optional. Not in the required field list, but the validator checks that each ID exists in the catalog. |
| `isService` | `true` allows zero commands. |
| `files` | Optional load order for a multi-file extension. `index.js` must be first. Omit it for a single file. |
| `includedByDefault` | Official extensions only. Do not set it here. |

## Extension

```js
var extensionRoot = new Extension({
  name:            extensionName,
  version:         '1.0.0',
  endpoints:       [],
  requiredAPIKeys: [],
  author:          'Kolja Nolte',
  category:        'Utilities',
  dataScope:       'none',
  dependencies:    [],
  isService:       false
})
```

Methods:

- `register_command(cmd)`
- `register_preference(pref)`

Passing `extension: extensionRoot` into `new Command` also registers the command when the runtime does that for you. *my-extension* relies on that path.

## Command

```js
var hello = new Command({
  name:       'hello',
  parameters: [ /* Parameter */ ],
  type:       'insert',
  helpText:   'Insert a greeting at the cursor.',
  tutorials:  [ /* TutorialCommand */ ],
  aliases:    [],
  extension:  extensionRoot
})
```

| `type` | What Antinote does with `payload` |
| --- | --- |
| `insert` | Inserts text at the cursor |
| `replaceLine` | Replaces the current line |
| `replaceAll` | Replaces the whole note |
| `openURL` | Opens a URL or app URL scheme |

`hello.execute = function (payload) { ... }` runs with `this` set to the command. `this.getParsedParams(payload)` returns values coerced to the parameter types, in declaration order.

`new TutorialCommand({ command, description })` is an example shown in the UI. `command` is the text the user can run, without a requirement that it include `::`.

## Parameter

`new Parameter({ type, name, helpText, default, required })`.

| `type` | Coercion |
| --- | --- |
| `string`, `paragraph` | String. Empty string is a real value. |
| `float` | `parseFloat` |
| `int` | `parseInt` base 10 |
| `bool` | Boolean, or the string `true` |
| `expression`, `mathExpression` | Treated as strings by the local test stub |

`required` defaults to `true` in the local test stub when omitted. my-extension sets `required: false` on the optional name.

## Preference

```js
extensionRoot.register_preference(new Preference({
  key:          'greeting',
  label:        'Greeting',
  type:         'string',
  defaultValue: 'Hello',
  helpText:     'Word inserted by ::hello.',
  options:      null
}))
```

`type` is `bool`, `string`, `paragraph`, `selectOne`, or `selectMultiple`. `options` is for the select types.

```js
var configured = getExtensionPreference(extensionName, 'greeting')
```

Return type: `string | number | boolean | string[] | null`.

## ReturnObject

```js
return new ReturnObject({
  status:  'success',
  message: 'Greeting inserted.',
  payload: 'Hello, there.'
})
```

`status` is `success` or `error`. `payload` is a string or number. For `openURL`, `payload` is the URL.

## Command payload

```ts
interface CommandPayload {
  parameters: string[]
  fullText: string
  userSettings: {
    decimalSeparator: string
    thousandsSeparator: string
  }
}
```

| `dataScope` | `payload.fullText` |
| --- | --- |
| `none` | empty |
| `line` | the current line |
| `full` | the whole note |

The scope is per extension, not per command. Use the smallest one.

## callAPI

```js
var result = callAPI(
  'apikey_example',
  'https://api.example.com/v1/item?key={{API_KEY}}',
  'GET',
  '{}',
  ''
)
```

Arguments: `apiKeyId`, `url`, `method`, `headers`, `body`. Headers and body are strings.

Result:

```ts
type CallAPIResult =
  | { success: true; data: string; error?: string }
  | { success: false; data?: string; error?: string }
```

Put the key ID in `requiredAPIKeys` and the origin in `endpoints`.

## callAIProvider

```js
var result = callAIProvider(payload.fullText, {
  provider:     'optional-provider-name',
  model:        'optional-model-id',
  systemPrompt: 'Summarize the note.',
  maxTokens:    200,
  temperature:  0.2
})
```

Returns a `ReturnObject`. Set `dependencies` to `['ai_providers']`. Raise `dataScope` when the prompt needs note text.

## MathEvaluator

Global object:

- `eval(expression)` → number
- `evalSafe(expression, defaultValue?)` → number
- `isMathExpression(str)` → boolean
- `parseNumeric(value)` → number

## Other globals

- `commandRegistry: Command[]`
- `extensionRegistry: Extension[]`
- `console.log / info / warn / error`
- `global` with the same registries, `MathEvaluator`, and an index signature for other injected names
