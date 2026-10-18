# `my-extension`

[![Stars](https://img.shields.io/github/stars/thaikolja/antinote-community-extensions-boilerplate?style=flat)](https://github.com/thaikolja/antinote-community-extensions-boilerplate/stargazers) [![Last commit](https://img.shields.io/github/last-commit/thaikolja/antinote-community-extensions-boilerplate?style=flat)](https://github.com/thaikolja/antinote-community-extensions-boilerplate/commits/master) [![Language](https://img.shields.io/github/languages/top/thaikolja/antinote-community-extensions-boilerplate?style=flat)](https://github.com/thaikolja/antinote-community-extensions-boilerplate) [![Version](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fthaikolja%2Fantinote-community-extensions-boilerplate%2Fmaster%2Fextension.json&query=%24.version&label=version&style=flat)](https://github.com/thaikolja/antinote-community-extensions-boilerplate/blob/master/extension.json) [![License](https://img.shields.io/badge/dynamic/json?url=https%3A%2F%2Fraw.githubusercontent.com%2Fthaikolja%2Fantinote-community-extensions-boilerplate%2Fmaster%2Fextension.json&query=%24.license&label=license&style=flat)](https://github.com/thaikolja/antinote-community-extensions-boilerplate/blob/master/extension.json)

***my-extension*** is a modern starter extension for the macOS app [Antinote](https://antinote.io/extensions/) (`v2.0` or later) switched from JavaScript to TypeScript.  In a note, type `::`, pick one of the two testing commands, and press Return. If you plan to create your own community extension, first review the brief documentation in [`/DOCUMENTATION`](./DOCUMENTATION).

## Try It

1. Keep this folder at `~/Library/Application Support/Antinote/Extensions/my-extension`.
2. In Antinote, open **Settings > Extensions** and click **Reload Extensions**.
3. Type `::hello` or `::hello(Ada)`.
4. Type `::open_docs` to open the extensions guide.

`::hello` uses the **Greeting** preference on this extension's Settings page. The default is `Hello`.

```bash
open ~/Library/Application\ Support/Antinote/Extensions
```

## Contributors

* **Kolja Nolte** (kolja.nolte@gmail.com): Author and maintainer

Saw a bug or want to add something useful to the boilerplate extension? Check out the [`CONTRIBUTING.md`](./CONTRIBUTING.md) file.

## What To Do Next?

- [Using and editing](DOCUMENTATION/USING.md)
- [Publishing to the community catalog](DOCUMENTATION/PUBLISHING.md)
- [API reference](DOCUMENTATION/API.md)
- [Development](DOCUMENTATION/DEVELOPMENT.md)

Coding agents should start at [AGENTS.md](AGENTS.md). 
