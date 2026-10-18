/*
 * @file         Antinote Extension
 * @description  my-extension, a community extension for the macOS app Antinote.
 * @author       Kolja Nolte <kolja.nolte@gmail.com>
 * @copyright    2026 (C) Kolja Nolte
 * @see          https://www.kolja-nolte.com
 *
 * This program is free software; you can run, modify, and redistribute it under the GNU Affero
 * General Public License v3 or later. All copies and derivative works must keep original copyright
 * notices intact and preserve this license. Anyone interacting with modified versions over a computer
 * network is entitled to receive the corresponding source code without added restrictions.
 *
 * @license      AGPL-3.0-or-later
 * @see          https://www.gnu.org/licenses/agpl-3.0.html
 */

/**
 * Minimal Node `fs` surface used by index.test.ts when run under `tsc` / Node.
 */
interface TestFs {
  /**
   * Reads a file as a UTF-8 string.
   * @param path Absolute or relative file path.
   * @param encoding Must be `'utf8'` for the test harness.
   */
  readFileSync(path: string, encoding: 'utf8'): string;
}

/**
 * Minimal Node `path` surface used to resolve sibling files next to the test.
 */
interface TestPath {
  /**
   * Joins path segments with the platform separator.
   * @param parts Path segments to join.
   */
  join(...parts: string[]): string;
}

/**
 * Minimal Node `vm` surface used to evaluate compiled index.js in the current context.
 */
interface TestVm {
  /**
   * Evaluates source in the current global context.
   * @param code JavaScript source to run.
   * @param options Optional filename for stack traces.
   */
  runInThisContext(code: string, options?: { filename?: string }): unknown;
}

/**
 * Typed `require` overloads for the three modules the standalone test loads.
 */
interface TestRequire {
  /**
   * Loads the Node `fs` module.
   * @param id Module id `'fs'`.
   */
  (id: 'fs'): TestFs;

  /**
   * Loads the Node `path` module.
   * @param id Module id `'path'`.
   */
  (id: 'path'): TestPath;

  /**
   * Loads the Node `vm` module.
   * @param id Module id `'vm'`.
   */
  (id: 'vm'): TestVm;

  /**
   * Fallback for any other CommonJS id.
   * @param id Module id string.
   */
  (id: string): any;
}

/**
 * CommonJS `require` available when the test runs under Node.
 *
 * @var require Makes Node modules available to the test harness.
 */
declare var require: TestRequire

/**
 * Node `process` subset used to signal test failures via exit code.
 */
declare var process: { exitCode?: number }

/**
 * Absolute directory of the current test file under Node.
 */
declare var __dirname: string

/**
 * Console logging surface used by the lightweight test helpers.
 */
interface Console {
  /**
   * Writes a log line to standard output.
   * @param args Values to print.
   */
  log(...args: unknown[]): void;
}

/**
 * Global console object used by describe/it helpers.
 */
declare var console: Console
