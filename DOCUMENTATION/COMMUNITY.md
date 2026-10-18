# Submit this extension to the community catalog

Antinote lists community extensions from the signed catalog in [johnsonfung/antinote-extensions](https://github.com/johnsonfung/antinote-extensions). You submit by opening a pull request that adds your extension under `extensions-unofficial/`. The app has no upload button.

These steps follow the repository [Contributing](https://github.com/johnsonfung/antinote-extensions#contributing) section, the validator in `scripts/validate.js`, and the release workflow in `.github/workflows/ci.yml`.

## What happens after you merge

A pull request only runs tests. After it is merged to `main`, GitHub Actions tests again, builds a zip of every extension, signs the catalog manifest, and publishes a GitHub Release.

Antinote shows the extension under **Settings > Extensions > Browse community extensions** once that release exists. Turn on **Settings > Privacy > Check GitHub for extension updates**, then refresh the catalog.

`official` stays `false`. An extension that ships inside Antinote is a later decision by the maintainers. Leave that field alone.

## 1. Fork and branch

Fork [johnsonfung/antinote-extensions](https://github.com/johnsonfung/antinote-extensions) and branch from `main`.

```sh
git clone https://github.com/YOUR_USER/antinote-extensions.git
cd antinote-extensions
git checkout -b add-your_extension
```

## 2. Add the extension folder

Copy this boilerplate into the fork as:

```
extensions-unofficial/your_extension/
  index.js
  extension.json
  README.md
  index.test.js
```

Those four files are what the repository asks for. Leave `COMMUNITY.md` out of the pull request. It is only a local note.

The folder name, `"name"` in `extension.json`, and `extensionName` in `index.js` must be the same `snake_case` id: lowercase letters, numbers, and underscores.

Set `author` to your GitHub username. Keep `version` in `extension.json` and in `new Extension({...})` identical. This boilerplate already has `"official": false`. Do not add `includedByDefault`. That field is only for extensions the Antinote app bundles.

Replace the sample commands and the README with what your extension does, including usage examples such as `::your_command(arg)`.

## 3. Match the validator

`npm run validate` fails the pull request when any of these are wrong:

- Required `extension.json` fields: `name`, `version`, `author`, `description`, `license`, `category`, `dataScope`, `endpoints`, `requiredAPIKeys`, `official`, `commands`.
- `name` matches the folder name.
- `official` is `false` for a folder under `extensions-unofficial/`.
- `dataScope` is `none`, `line`, or `full`. Use the smallest one. `none` means the code does not read `payload.fullText`.
- `endpoints` and `requiredAPIKeys` are arrays. Every URL the code calls is declared in `endpoints`. Every key id the code uses, such as one passed to `callAPI`, is declared in `requiredAPIKeys`. `openURL` payloads are not API calls.
- `commands` has at least one command unless `isService` is `true`. Each command has a `snake_case` `name`, a `description`, and a `type` of `insert`, `replaceLine`, `replaceAll`, or `openURL`.
- The version string in `index.js` matches `extension.json`.

A working community example is [`extensions-unofficial/rule_of_three`](https://github.com/johnsonfung/antinote-extensions/tree/main/extensions-unofficial/rule_of_three).

## 4. Test in the fork

From the root of the forked repository:

```sh
npm install
npm test
```

`npm test` runs the script tests, `npm run validate`, and `npm run test:extensions`. CI runs those same commands on Node 18.

`node index.test.js` inside this boilerplate is a local stand-in. It does not load the repository runtime, and it is not the check CI runs. The repository runner loads `antinote-extensions-base-v0.0.1.js`, then your `index.js`, then `index.test.js`, and exposes each command from `extension.json` as a variable (`hello`, `open_docs`, and so on).

## 5. Open the pull request

Open the pull request against `main` of `johnsonfung/antinote-extensions`. In the description, say what the extension does and give usage examples.

CI must pass before review. If it fails, fix the extension and push to the same branch.

## After it is listed

People install it from **Settings > Extensions > Browse community extensions**. They can also copy the folder into `~/Library/Application Support/Antinote/Extensions/` and click **Reload Extensions**.

To ask someone else to write an extension, the extensions page points to the [Antinote Discord](https://discord.gg/Yaa6FZy4zP). That is a request channel. The submission path is still the pull request.

## Official extensions

The repository treats "included with Antinote" as a separate step:

1. Start as an unofficial extension.
2. Show that people use it.
3. Stay aligned with Antinote's simplicity, do one clear job, document and test it, declare the smallest data scope, and pass validation.

Maintainers move it. A community pull request keeps `"official": false`.
