# Publish `my-extension` on GitHub

Antinote has no upload button. Community extensions come from the signed catalog in [johnsonfung/antinote-extensions](https://github.com/johnsonfung/antinote-extensions). You publish by opening a pull request that adds a folder under `extensions-unofficial/`.

This guide follows that repo's [Contributing](https://github.com/johnsonfung/antinote-extensions#contributing) section, `scripts/validate.js`, and `.github/workflows/ci.yml`.

my-extension's own Git repository is [thaikolja/antinote-community-extensions-boilerplate](https://github.com/thaikolja/antinote-community-extensions-boilerplate). That remote is the starter. It is not the catalog.

## Catalog ID

This project is called `my-extension`. The catalog validator rejects that ID. Folder names under `extensions-unofficial/` must match `^[a-z0-9_]+$/` (lowercase letters, numbers, underscores).

For the pull request, pick a snake_case ID and use it in all three places:

- the folder name
- `extension.json` `"name"`
- `extensionName` / `new Extension({ name })` in `index.js`

Keep this repository named `my-extension`. Rename it only in the catalog fork.

## After the pull request merges

A pull request only runs tests. After it merges to `main`, GitHub Actions tests again, zips every extension, signs the catalog manifest, and publishes a GitHub Release.

Antinote then lists it under **Settings > Extensions > Browse community extensions**. Turn on **Settings > Privacy > Check GitHub for extension updates**, then refresh the catalog.

Leave `"official": false`. Do not add `includedByDefault`. Shipping inside the Antinote app is a later decision for the maintainer.

## 1. Fork and Branch

Fork [johnsonfung/antinote-extensions](https://github.com/johnsonfung/antinote-extensions) and branch from `main`.

```sh
git clone https://github.com/YOUR_USER/antinote-extensions.git
cd antinote-extensions
git checkout -b add-my-extension
```

## 2. Add the extension folder

Copy the built extension into the fork. The catalog asks for these four files:

```text
extensions-unofficial/YOUR_SNAKE_CASE_ID/
  index.js
  extension.json
  README.md
  index.test.js
```

Leave out `index.ts`, `antinote.d.ts`, `AGENTS.md`, and this `DOCUMENTATION/` folder. Antinote and CI run `index.js`.

Before you push:

- Set `author` to your GitHub username.
- Make `version` in `extension.json` and in `new Extension({...})` the same string.
- Replace the sample commands and the README with what the extension does, including examples such as `::your_command(arg)`.
- Declare the smallest `dataScope` that still works.

## 3. Match the Validator

From the fork root, `npm run validate` fails the pull request when any of these are wrong:

- Required `extension.json` fields: `name`, `version`, `author`, `description`, `license`, `category`, `dataScope`, `endpoints`, `requiredAPIKeys`, `official`, `commands`.
- `name` matches the folder name, and that folder name is snake_case.
- `official` is `false` for a folder under `extensions-unofficial/`.
- `dataScope` is `none`, `line`, or `full`. `none` means the code does not read `payload.fullText`.
- `endpoints` and `requiredAPIKeys` are arrays. Every URL the code calls is declared in `endpoints`. Every key ID passed to `callAPI` is declared in `requiredAPIKeys`. `openURL` payloads are not API calls.
- `commands` has at least one command unless `isService` is `true`. Each command has a snake_case `name`, a `description`, and a `type` of `insert`, `replaceLine`, `replaceAll`, or `openURL`.
- The version string in `index.js` matches `extension.json`.

A working example is [`extensions-unofficial/rule_of_three`](https://github.com/johnsonfung/antinote-extensions/tree/main/extensions-unofficial/rule_of_three).

## 4. Test in the fork

```sh
npm install
npm test
```

`npm test` runs the script tests, `npm run validate`, and `npm run test:extensions`. CI runs those commands on Node 18.

`node index.test.js` inside my-extension is a local stand-in. It doesn't load the catalog runtime, and it is not what CI runs. The catalog runner loads `antinote-extensions-base-v0.0.1.js`, then your `index.js`, then `index.test.js`, and exposes each command from `extension.json` as a variable (`hello`, `open_docs`, and so on).

## 5. Open the Pull Request

Open it against `main` of `johnsonfung/antinote-extensions`. Say what the extension does and give usage examples.

CI must pass before review. If it fails, fix the extension and push to the same branch.

## After it is Listed

People install it from **Settings > Extensions > Browse community extensions**. They can also copy the folder into `~/Library/Application Support/Antinote/Extensions/` and click **Reload Extensions**.

To ask someone else to write an extension, the extensions page points to the [Antinote Discord](https://discord.gg/Yaa6FZy4zP). That is a request channel. The submission path is still the pull request.

## Included with Antinote

The catalog treats "included with Antinote" as a separate step:

1. Start as an unofficial extension.
2. Show that people use it.
3. Stay small, do one job, document and test it, declare the smallest data scope, and pass validation.

Maintainers move it. A community pull request keeps `"official": false`.
