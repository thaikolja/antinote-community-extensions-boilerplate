# Changelog

User-visible changes to *my-extension*. Versions follow the Git tags. The extension manifest `version` is the string inside `extension.json` and `new Extension({ version })`.

## [1.0.0-beta.1] - 2026-10-19

### Changed

- The extension ID is `my_extension` in the folder metadata, `extension.json` `"name"`, and `extensionName`. The initial commit used `exchange_rates` in the manifest and `boilerplate` in the script.
- The manifest version is `1.0.0`. The initial manifest was `0.0.1`, while the script already said `1.0.0`.
- The description now matches the two commands: insert a greeting and open the Antinote extensions guide.
- `::hello` and `::hello(Name)` still insert a greeting. The **Greeting** preference still defaults to `Hello`.
- Documentation is now [USING.md](DOCUMENTATION/USING.md), [API.md](DOCUMENTATION/API.md), [DEVELOPMENT.md](DOCUMENTATION/DEVELOPMENT.md), and [PUBLISHING.md](DOCUMENTATION/PUBLISHING.md). [AGENTS.md](AGENTS.md) is the handoff for coding agents.

### Removed

- The placeholder `rate` command from `extension.json`. The script command is  `::open_docs`, which returns `https://antinote.io/extensions/`.
- The unused MockAPI endpoint `https://60797dd9460a6600174fbd2d.mockapi.io/location_url`. `endpoints` is empty. `dataScope` stays `none`.
- `DOCUMENTATION/COMMUNITY.md`. Catalog steps live in [PUBLISHING.md](DOCUMENTATION/PUBLISHING.md).

### Fixed

- The WebStorm file watcher no longer compiles every `.ts` save with `tsconfig.json`. `index.ts` emits `index.js`. `index.test.ts` emits `index.test.js`. Saving one file no longer rewrites the other output.

## [0.0.1] - 2026-10-19

### Added

- Initial commit of the Antinote community extension starter. `::hello` inserts a greeting. The manifest still described an exchange-rate sample and declared a `rate` command.

[1.0.0-beta.1]: https://github.com/thaikolja/antinote-community-extensions-boilerplate/compare/79d725bcf8ac2aef8f38b31ce1c43ea6939c1a52...v1.0.0-beta.1
[0.0.1]: https://github.com/thaikolja/antinote-community-extensions-boilerplate/commit/79d725bcf8ac2aef8f38b31ce1c43ea6939c1a52
