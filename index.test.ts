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
 * Node filesystem helpers used to load index.js and extension.json.
 */
// @ts-ignore
import fs from 'fs'

/**
 * Node path helpers used to resolve sibling files next to this test.
 */
// @ts-ignore
import path from 'path'

/**
 * Node vm helpers used to evaluate compiled index.js in the current context.
 */
// @ts-ignore
import vm from 'vm'

/**
 * Groups related tests under a printed section title.
 * @param name Section title printed before the nested cases.
 * @param fn Callback that registers the nested `it` cases.
 */
function describe(name, fn) {
  /**
   * Print a blank line and the suite name for readable terminal output.
   */
  console.log('\n' + name)

  /**
   * Run the nested cases immediately.
   */
  fn()
}

/**
 * Runs one assertion block and marks the process failed on throw.
 * @param name Case title printed with a pass or fail mark.
 * @param fn Callback that performs expectations.
 */
function it(name, fn) {
  /**
   * Attempt the case body and report success or failure.
   */
  try {
    /**
     * Execute the case assertions.
     */
    fn()

    /**
     * Print a check mark when no assertion threw.
     */
    console.log('  ✓ ' + name)
  } catch (e) {
    /**
     * Print a cross mark when an assertion failed.
     */
    console.log('  ✗ ' + name)

    /**
     * Print the thrown error message indented under the case title.
     */
    console.log('    Error: ' + e.message)

    /**
     * Signal a non-zero exit so CI and local runs treat this as a failure.
     */
    process.exitCode = 1
  }
}

/**
 * Builds a small expectation helper for equality and presence checks.
 * @param actual Value under test.
 * @returns Matcher object with toBe, toBeDefined, and toBeArray.
 */
function expect(actual) {
  /**
   * Return the matcher API used by the cases below.
   */
  return {
    /**
     * Asserts strict equality between actual and expected.
     * @param expected Value that actual must equal.
     */
    toBe: function (expected) {
      /**
       * Fail when the values differ under strict equality.
       */
      if (actual !== expected) {
        /**
         * Throw a readable mismatch error for the it() catch block.
         */
        throw new Error('Expected ' + JSON.stringify(expected) + ' but got ' + JSON.stringify(actual))
      }
    },

    /**
     * Asserts that actual is neither undefined nor null.
     */
    toBeDefined: function () {
      /**
       * Fail when the value is missing.
       */
      if (actual === undefined || actual === null) {
        /**
         * Throw when the expected value was absent.
         */
        throw new Error('Expected value to be defined')
      }
    },

    /**
     * Asserts that actual is an array.
     */
    toBeArray: function () {
      /**
       * Fail when actual is not an array.
       */
      if (!Array.isArray(actual)) {
        /**
         * Throw with the unexpected value for debugging.
         */
        throw new Error('Expected an array but got ' + JSON.stringify(actual))
      }
    }
  }
}

/**
 * Antinote's test runner loads its runtime, then this file.
 * Running `node index.test.js` directly installs the same constructors first.
 * Prefer globalThis when present; otherwise fall back to the classic Function trick.
 */
var runtime = (typeof globalThis !== 'undefined') ? globalThis : Function('return this')()

/**
 * Install a stand-in Antinote runtime when the catalog runner has not already done so.
 */
if (!runtime.commandRegistry) {
  /**
   * Shared list of Command instances registered during evaluation.
   */
  runtime.commandRegistry = []

  /**
   * Shared list of Extension instances registered during evaluation.
   */
  runtime.extensionRegistry = []

  /**
   * Stand-in Command constructor matching Antinote's registration shape.
   * @param config Command definition from index.js.
   */
  runtime.Command = function Command(config) {
    /**
     * Snake_case command name as typed after `::`.
     */
    this.name = config.name

    /**
     * Parameter descriptors, or an empty list when none are declared.
     */
    this.parameters = config.parameters || []

    /**
     * Owning Extension instance, when provided.
     */
    this.extension = config.extension

    /**
     * Output mode; defaults to replaceLine like the real runtime.
     */
    this.type = config.type || 'replaceLine'

    /**
     * Help text shown in the command UI.
     */
    this.helpText = config.helpText || ''

    /**
     * Tutorial examples attached to this command.
     */
    this.tutorials = config.tutorials || []

    /**
     * Copy a custom execute handler when the definition supplies one.
     */
    if (typeof config.execute === 'function') {
      /**
       * Bind the author-supplied execute implementation onto this instance.
       */
      this.execute = config.execute
    }

    /**
     * Register with the owning extension when it exposes register_command.
     */
    if (config.extension && typeof config.extension.register_command === 'function') {
      /**
       * Attach this command to its extension's command list.
       */
      config.extension.register_command(this)
    }

    /**
     * Publish the command on the shared registry for later lookup.
     */
    runtime.commandRegistry.push(this)
  }

  /**
   * Parses payload parameters according to each Parameter descriptor.
   * @param payload Raw command payload from the test or runtime.
   * @returns Ordered list of coerced parameter values.
   */
  runtime.Command.prototype.getParsedParams = function (payload) {
    /**
     * Accumulator for coerced values in declaration order.
     */
    var resolved: any[] = []

    /**
     * Walk every declared parameter and coerce its raw value.
     */
    for (var i = 0; i < this.parameters.length; i++) {
      /**
       * Current parameter descriptor from the command definition.
       */
      var param = this.parameters[i]

      /**
       * Raw string from the invocation, or undefined when omitted.
       */
      var rawValue = payload.parameters ? payload.parameters[i] : undefined

      /**
       * Whether empty string is a meaningful value for this parameter type.
       */
      var isStringType = param.parameterType === 'string' || param.parameterType === 'paragraph'

      /**
       * True when the caller omitted the value (and empty string is not allowed).
       */
      var isMissing = rawValue === undefined || rawValue === null || (!isStringType && rawValue === '')

      /**
       * Required parameters must be present before coercion.
       */
      if (param.required && isMissing) {
        /**
         * Abort with a clear missing-parameter error.
         */
        throw new Error('Required parameter \'' + param.name + '\' is missing')
      }

      /**
       * Fall back to the declared default when the value is missing.
       */
      if (isMissing) {
        /**
         * Substitute the parameter default before type coercion.
         */
        rawValue = param.defaultValue
      }

      /**
       * Coerced value after applying the parameter type rules.
       */
      var parsedValue

      /**
       * Coerce by parameterType the same way Antinote's runtime does.
       */
      switch (param.parameterType) {
        case 'float':
          /**
           * Parse a floating-point number.
           */
          parsedValue = parseFloat(rawValue)

          /**
           * Leave the float branch.
           */
          break

        case 'int':
          /**
           * Parse a base-10 integer.
           */
          parsedValue = parseInt(rawValue, 10)

          /**
           * Leave the int branch.
           */
          break

        case 'bool':
          /**
           * Keep booleans as-is; otherwise treat the string "true" as true.
           */
          parsedValue = typeof rawValue === 'boolean'
              ? rawValue
              : String(rawValue).toLowerCase() === 'true'

          /**
           * Leave the bool branch.
           */
          break

        default:
          /**
           * All remaining types are treated as strings.
           */
          parsedValue = String(rawValue)
      }

      /**
       * Append the coerced value in declaration order.
       */
      resolved.push(parsedValue)
    }

    /**
     * Return the full coerced parameter list to the command execute body.
     */
    return resolved
  }

  /**
   * Stand-in Extension constructor matching Antinote's registration shape.
   * @param config Extension metadata from index.js.
   */
  runtime.Extension = function Extension(config) {
    /**
     * Stable extension id.
     */
    this.name = config.name

    /**
     * Semver-like version string; defaults to 1.0.0.
     */
    this.version = config.version || '1.0.0'

    /**
     * Commands registered on this extension via register_command.
     */
    this.commands = []

    /**
     * Declared network endpoint prefixes.
     */
    this.endpoints = config.endpoints || []

    /**
     * Declared API key ids required by callAPI.
     */
    this.requiredAPIKeys = config.requiredAPIKeys || []

    /**
     * Preferences registered via register_preference.
     */
    this.preferences = []

    /**
     * Author string shown in the catalog.
     */
    this.author = config.author || ''

    /**
     * Category label; defaults to Utilities.
     */
    this.category = config.category || 'Utilities'

    /**
     * Note data scope; defaults to full when omitted.
     */
    this.dataScope = config.dataScope || 'full'

    /**
     * Other extension ids this one depends on.
     */
    this.dependencies = config.dependencies || []

    /**
     * Whether this extension is a background service.
     */
    this.isService = config.isService || false

    /**
     * Publish the extension on the shared registry.
     */
    runtime.extensionRegistry.push(this)
  }

  /**
   * Appends a command to this extension's command list.
   * @param cmd Command instance to register.
   */
  runtime.Extension.prototype.register_command = function (cmd) {
    /**
     * Store the command on the extension instance.
     */
    this.commands.push(cmd)
  }

  /**
   * Appends a preference to this extension's preference list.
   * @param pref Preference instance to register.
   */
  runtime.Extension.prototype.register_preference = function (pref) {
    /**
     * Store the preference on the extension instance.
     */
    this.preferences.push(pref)
  }

  /**
   * Stand-in Preference constructor.
   * @param config Preference metadata from index.js.
   */
  runtime.Preference = function Preference(config) {
    /**
     * Storage key used with getExtensionPreference.
     */
    this.key = config.key

    /**
     * Label shown in Settings.
     */
    this.label = config.label

    /**
     * Preference editor type.
     */
    this.type = config.type

    /**
     * Default value before the user changes Settings.
     */
    this.defaultValue = config.defaultValue

    /**
     * Select options when type is selectOne or selectMultiple.
     */
    this.options = config.options || null

    /**
     * Optional help text for the Settings UI.
     */
    this.helpText = config.helpText || null
  }

  /**
   * Stand-in Parameter constructor.
   * @param config Parameter metadata from index.js.
   */
  runtime.Parameter = function Parameter(config) {
    /**
     * Declared parameter type used during coercion.
     */
    this.parameterType = config.type

    /**
     * Parameter name shown in help text.
     */
    this.name = config.name

    /**
     * Help text for this parameter.
     */
    this.helpText = config.helpText || ''

    /**
     * Default when the caller omits the argument.
     */
    this.defaultValue = config.default !== undefined ? config.default : null

    /**
     * Whether the parameter is mandatory; defaults to true.
     */
    this.required = config.required !== undefined ? config.required : true
  }

  /**
   * Stand-in TutorialCommand constructor.
   * @param config Tutorial example metadata.
   */
  runtime.TutorialCommand = function TutorialCommand(config) {
    /**
     * Example command string shown in tutorials.
     */
    this.command = config.command

    /**
     * Short description of what the example does.
     */
    this.description = config.description
  }

  /**
   * Stand-in ReturnObject constructor.
   * @param config Result fields from a command execute body.
   */
  runtime.ReturnObject = function ReturnObject(config) {
    /**
     * Outcome status; defaults to error when omitted.
     */
    this.status = config.status || 'error'

    /**
     * User-facing message; defaults to a generic error string.
     */
    this.message = config.message || 'Undefined error.'

    /**
     * Payload returned to Antinote; defaults to an empty string.
     */
    this.payload = config.payload || ''
  }

  /**
   * Stand-in preference reader; returns null until a test overrides it.
   * @returns Always null in the default harness.
   */
  runtime.getExtensionPreference = function () {
    /**
     * No preference store exists in the standalone harness.
     */
    return null
  }

  /**
   * Evaluate the compiled extension script so commands register on this runtime.
   */
  vm.runInThisContext(fs.readFileSync(path.join(__dirname, 'index.js'), 'utf8'), {
    filename: 'index.js'
  })
}

/**
 * When the catalog runner already loaded index.js, resolve commands from the registry.
 */
if (typeof hello === 'undefined') {
  /**
   * Locate the hello command registered by index.js.
   */
  var hello = runtime.commandRegistry.find(function (command) {
    /**
     * Match the snake_case command name from extension.json.
     */
    return command.name === 'hello'
  })

  /**
   * Locate the open_docs command registered by index.js.
   */
  var open_docs = runtime.commandRegistry.find(function (command) {
    /**
     * Match the snake_case command name from extension.json.
     */
    return command.name === 'open_docs'
  })
}

/**
 * Parsed extension.json metadata used by the validator-style checks below.
 */
var metadata = JSON.parse(fs.readFileSync(path.join(__dirname, 'extension.json'), 'utf8'))

/**
 * Suite: required extension.json fields and catalog constraints.
 */
describe('my-extension metadata', function () {
  /**
   * Case: every field Antinote's validator requires is present and typed.
   */
  it('has the fields Antinote\'s validator requires', function () {
    /**
     * Extension id must be my-extension, matching index.js.
     */
    expect(metadata.name).toBe('my-extension')

    /**
     * Version must match the Extension constructor version.
     */
    expect(metadata.version).toBe('1.0.0')

    /**
     * Author must be declared for the catalog.
     */
    expect(metadata.author).toBeDefined()

    /**
     * Description must be declared for the catalog.
     */
    expect(metadata.description).toBeDefined()

    /**
     * License field in extension.json is MIT.
     */
    expect(metadata.license).toBe('MIT')

    /**
     * Category is Utilities.
     */
    expect(metadata.category).toBe('Utilities')

    /**
     * my-extension does not read note text.
     */
    expect(metadata.dataScope).toBe('none')

    /**
     * endpoints must be an array (possibly empty of real hosts later).
     */
    expect(metadata.endpoints).toBeArray()

    /**
     * requiredAPIKeys must be an array.
     */
    expect(metadata.requiredAPIKeys).toBeArray()

    /**
     * Community submissions keep official false.
     */
    expect(metadata.official).toBe(false)

    /**
     * commands must be an array of command descriptors.
     */
    expect(metadata.commands).toBeArray()
  })

  /**
   * Case: extension.json command list matches the registered script commands.
   */
  it('lists the same commands the script registers', function () {
    /**
     * First catalog command is hello / insert.
     */
    expect(metadata.commands[0].name).toBe('hello')

    /**
     * hello inserts text at the cursor.
     */
    expect(metadata.commands[0].type).toBe('insert')

    /**
     * Second catalog command is open_docs / openURL.
     */
    expect(metadata.commands[1].name).toBe('open_docs')

    /**
     * open_docs opens a URL.
     */
    expect(metadata.commands[1].type).toBe('openURL')

    /**
     * hello must exist on the runtime registry.
     */
    expect(hello).toBeDefined()

    /**
     * open_docs must exist on the runtime registry.
     */
    expect(open_docs).toBeDefined()
  })
})

/**
 * Suite: ::hello command behavior.
 */
describe('::hello', function () {
  /**
   * Case: empty name argument greets "there".
   */
  it('greets a default person when no name is given', function () {
    /**
     * Invoke hello with no parameters.
     */
    var result = hello.execute({ parameters: [], fullText: '', userSettings: {} })

    /**
     * Command must succeed.
     */
    expect(result.status).toBe('success')

    /**
     * Default payload uses Hello and there.
     */
    expect(result.payload).toBe('Hello, there.')
  })

  /**
   * Case: provided name is used in the greeting.
   */
  it('greets the name it is given', function () {
    /**
     * Invoke hello with Ada as the name parameter.
     */
    var result = hello.execute({ parameters: [ 'Ada' ], fullText: '', userSettings: {} })

    /**
     * Command must succeed.
     */
    expect(result.status).toBe('success')

    /**
     * Payload must include the supplied name.
     */
    expect(result.payload).toBe('Hello, Ada.')
  })

  /**
   * Case: getExtensionPreference overrides the default greeting word.
   */
  it('uses the greeting preference when Antinote provides one', function () {
    /**
     * Preserve the previous preference reader so the case can restore it.
     */
    var previous = runtime.getExtensionPreference

    /**
     * Stub the preference reader to return a custom greeting.
     */
    runtime.getExtensionPreference = function () {
      /**
       * Simulate Settings storing "Hi" for the greeting key.
       */
      return 'Hi'
    }

    /**
     * Run the assertion and always restore the previous reader.
     */
    try {
      /**
       * Invoke hello while the stub is active.
       */
      var result = hello.execute({ parameters: [ 'Ada' ], fullText: '', userSettings: {} })

      /**
       * Payload must use the stubbed greeting word.
       */
      expect(result.payload).toBe('Hi, Ada.')
    } finally {
      /**
       * Restore the original preference reader for later cases.
       */
      runtime.getExtensionPreference = previous
    }
  })
})

/**
 * Suite: ::open_docs command behavior.
 */
describe('::open_docs', function () {
  /**
   * Case: payload is the public extensions guide URL.
   */
  it('returns the extensions guide URL', function () {
    /**
     * Invoke open_docs with an empty payload.
     */
    var result = open_docs.execute({ parameters: [], fullText: '', userSettings: {} })

    /**
     * Command must succeed.
     */
    expect(result.status).toBe('success')

    /**
     * Payload must be the Antinote extensions documentation URL.
     */
    expect(result.payload).toBe('https://antinote.io/extensions/')
  })
})
