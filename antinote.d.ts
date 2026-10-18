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
 * Ambient types for names Antinote injects before it evaluates index.js.
 * This file is not a module and is never loaded by the app.
 * Do not add import or export here or in index.ts. Either one
 * turns the program into a module, and JavaScriptCore evaluates
 * the extension as a script.
 */

/**
 * Describes the metadata Antinote uses when registering an extension.
 * These values are supplied to the Extension constructor and used by the
 * runtime to expose the extension to the user and to other extensions.
 */
interface ExtensionConfig {
  /**
   * Stable identifier shown by Antinote for the extension.
   */
  name: string;

  /**
   * Human-readable extension version such as "1.2.3".
   */
  version?: string;

  /**
   * Optional list of local or remote endpoint routes the extension exposes.
   */
  endpoints?: string[];

  /**
   * API key identifiers required before the extension can make outbound requests.
   */
  requiredAPIKeys?: string[];

  /**
   * Name of the extension author or maintainer.
   */
  author?: string;

  /**
   * High-level category used to classify the extension in the UI.
   */
  category?: string;

  /**
   * Scope of data this extension reads or writes.
   */
  dataScope?: 'none' | 'line' | 'full';

  /**
   * Other extensions this extension depends on at runtime.
   */
  dependencies?: string[];

  /**
   * Whether this extension behaves as a background service rather than a direct command provider.
   */
  isService?: boolean;
}

/**
 * The structured payload Antinote passes to a command when it is executed.
 * This includes parsed parameter values and the original text context.
 */
interface CommandPayload {
  /**
   * Values extracted from the command invocation after parsing.
   */
  parameters: string[];

  /**
   * Full text the user entered before or around the command.
   */
  fullText: string;

  /**
   * User locale and formatting preferences relevant for numeric parsing.
   */
  userSettings: {
    /**
     * Decimal separator, such as "." or ",".
     */
    decimalSeparator: string;

    /**
     * Grouping separator, such as "," or " ".
     */
    thousandsSeparator: string;
  };
}

/**
 * Definition used to register a command within an extension.
 * The runtime uses this object to build the command registry and to invoke
 * the command handler with the correct payload type.
 */
interface CommandConfig {
  /**
   * Name of the command as typed by the user.
   */
  name: string;

  /**
   * Optional list of parameters accepted by the command.
   */
  parameters?: Parameter[];

  /**
   * Output mode used when the command replaces or inserts text.
   */
  type?: 'insert' | 'replaceLine' | 'replaceAll' | 'openURL';

  /**
   * Help text displayed in command documentation or the UI.
   */
  helpText?: string;

  /**
   * Tutorials or examples that can be shown to the user.
   */
  tutorials?: TutorialCommand[];

  /**
   * Alternative names that resolve to the same command handler.
   */
  aliases?: string[];

  /**
   * Extension that owns this command.
   */
  extension?: Extension;

  /**
   * Function invoked when the command executes.
   */
  execute?: (this: Command, payload: CommandPayload) => ReturnObject;
}

/**
 * Descriptor for a single command parameter. Antinote uses this metadata to
 * parse user input, validate values, and render helpful tooltips.
 */
interface ParameterConfig {
  /**
   * The expected data type for the parameter.
   */
  type: 'float' | 'int' | 'bool' | 'string' | 'paragraph' | 'expression' | 'mathExpression';

  /**
   * Name of the parameter as it appears in the command signature.
   */
  name: string;

  /**
   * Explanatory text shown to the user.
   */
  helpText?: string;

  /**
   * Default value used when the user omits the parameter.
   */
  default?: string | number | boolean | null;

  /**
   * Whether the parameter is mandatory.
   */
  required?: boolean;
}

/**
 * A persisted user preference that can be configured through Antinote.
 */
interface PreferenceConfig {
  /**
   * Unique key used to store the preference value.
   */
  key: string;

  /**
   * Label shown in the settings interface.
   */
  label: string;

  /**
   * Input type for the preference editor.
   */
  type: 'bool' | 'string' | 'paragraph' | 'selectOne' | 'selectMultiple';

  /**
   * Default stored value when no value has been set yet.
   */
  defaultValue?: string | number | boolean | string[] | null;

  /**
   * Allowed options for select-style preferences.
   */
  options?: string[] | null;

  /**
   * Additional context or usage notes for the preference.
   */
  helpText?: string | null;
}

/**
 * A single example command and its explanation used in tutorials.
 */
interface TutorialCommandConfig {
  /**
   * Command string to show in the tutorial.
   */
  command: string;

  /**
   * Explanation associated with the tutorial example.
   */
  description: string;
}

/**
 * Result object returned by command execution and helper APIs.
 */
interface ReturnObjectConfig {
  /**
   * Status of the operation.
   */
  status?: 'success' | 'error';

  /**
   * User-facing human-readable message.
   */
  message?: string;

  /**
   * Optional data payload to return to the caller.
   */
  payload?: string | number;
}

/**
 * Optional runtime options accepted by the AI provider call wrapper.
 */
interface CallAIProviderOptions {
  /**
   * Preferred provider implementation name.
   */
  provider?: string;

  /**
   * Model identifier to use for the call.
   */
  model?: string;

  /**
   * System prompt injected at the beginning of the model request.
   */
  systemPrompt?: string;

  /**
   * Maximum number of tokens to generate.
   */
  maxTokens?: number;

  /**
   * Sampling temperature for generation.
   */
  temperature?: number;
}

/**
 * Result returned by the low-level API helper.
 * The success union makes the outcome explicit to callers.
 */
type CallAPIResult =
    | { success: true; data: string; error?: string }
    | { success: false; data?: string; error?: string };

/**
 * Allowed runtime value type for an extension preference.
 */
type PreferenceValue = string | number | boolean | string[] | null;

/**
 * Represents a registered Antinote extension and the commands/preferences it owns.
 *
 * The runtime instantiates these values at startup, so we expose the shape as an
 * interface and keep the constructor as a global factory for compatibility with
 * the extension environment.
 */
interface Extension {
  /**
   * Name used to identify the extension in the registry.
   */
  name: string;

  /**
   * Extension version string.
   */
  version: string;

  /**
   * Commands registered on this extension.
   */
  commands: Command[];

  /**
   * Endpoints exposed by the extension.
   */
  endpoints: string[];

  /**
   * API key identifiers required by the extension.
   */
  requiredAPIKeys: string[];

  /**
   * Preferences owned by the extension.
   */
  preferences: Preference[];

  /**
   * Author name.
   */
  author: string;

  /**
   * Extension category.
   */
  category: string;

  /**
   * Scope of data read or written by the extension.
   */
  dataScope: 'none' | 'line' | 'full';

  /**
   * Dependencies required for the extension to run correctly.
   */
  dependencies: string[];

  /**
   * Whether the extension is a background service.
   */
  isService: boolean;

  /**
   * Registers a command with this extension.
   * @param cmd Command instance to attach.
   */
  register_command(cmd: Command): void;

  /**
   * Registers a user preference for this extension.
   * @param pref Preference instance to attach.
   */
  register_preference(pref: Preference): void;
}

declare var Extension: {
  new(config: ExtensionConfig): Extension;
}

/**
 * Represents a command that Antinote can execute from the command registry.
 */
interface Command {
  /**
   * Name of the command.
   */
  name: string;

  /**
   * Parameter definitions accepted by the command.
   */
  parameters: Parameter[];

  /**
   * Extension that owns this command, if any.
   */
  extension: Extension | undefined;

  /**
   * The insertion or replacement behavior used to apply the command result.
   */
  type: 'insert' | 'replaceLine' | 'replaceAll' | 'openURL';

  /**
   * Help text displayed to the user.
   */
  helpText: string;

  /**
   * Tutorial examples for this command.
   */
  tutorials: TutorialCommand[];

  /**
   * Alternate names that resolve to this command.
   */
  aliases: string[];

  /**
   * Shared command registry reference.
   */
  commandRegistry: Command[];

  /**
   * Parses a command payload into values matching the parameter definitions.
   * @param payload The raw payload supplied by the runtime.
   */
  getParsedParams(payload: CommandPayload): Array<string | number | boolean>;

  /**
   * Function used to execute the command and produce a ReturnObject.
   */
  execute: (this: Command, payload: CommandPayload) => ReturnObject;
}

declare var Command: {
  new(config: CommandConfig): Command;
}

/**
 * Describes a parameter accepted by a command.
 */
interface Parameter {
  /**
   * Parameter type as declared by the configuration.
   */
  parameterType: ParameterConfig['type'];

  /**
   * Name used to refer to the parameter in the payload.
   */
  name: string;

  /**
   * Help text shown to the user.
   */
  helpText: string;

  /**
   * Default value when the user does not provide one.
   */
  defaultValue: string | number | boolean | null;

  /**
   * Whether this parameter is required.
   */
  required: boolean;
}

declare var Parameter: {
  new(config: ParameterConfig): Parameter;
}

/**
 * A user-facing preference object stored in the extension settings layer.
 */
interface Preference {
  /**
   * Storage key used to access the preference value.
   */
  key: string;

  /**
   * Label displayed to the user.
   */
  label: string;

  /**
   * Data type of the preference value.
   */
  type: PreferenceConfig['type'];

  /**
   * Default value applied before user settings are saved.
   */
  defaultValue: string | number | boolean | string[] | null;

  /**
   * Options used when the preference is an enumerated selector.
   */
  options: string[] | null;

  /**
   * Additional explanatory text for the preference.
   */
  helpText: string | null;
}

declare var Preference: {
  new(config: PreferenceConfig): Preference;
}

/**
 * Example command metadata used in tutorials and help screens.
 */
interface TutorialCommand {
  /**
   * Tutorial command text the user can run.
   */
  command: string;

  /**
   * Explanation or context for the example.
   */
  description: string;
}

declare var TutorialCommand: {
  new(config: TutorialCommandConfig): TutorialCommand;
}

/**
 * Standard result object returned after a command or helper operation completes.
 */
interface ReturnObject {
  /**
   * Final status of the operation.
   */
  status: 'success' | 'error';

  /**
   * User-facing message describing the outcome.
   */
  message: string;

  /**
   * Optional structured data returned to the caller.
   */
  payload: string | number;
}

declare var ReturnObject: {
  new(config: ReturnObjectConfig): ReturnObject;
}

/**
 * Helper API for evaluating mathematical expressions in a safe and typed manner.
 */
interface MathEvaluator {
  /**
   * Evaluates the expression and returns a numeric result.
   * @param expression Math expression string to evaluate.
   */
  eval(expression: string): number;

  /**
   * Evaluates the expression, returning a fallback value if parsing fails.
   * @param expression Math expression string to evaluate.
   * @param defaultValue Value returned when evaluation fails.
   */
  evalSafe(expression: string, defaultValue?: number): number;

  /**
   * Determines whether a string represents a mathematical expression.
   * @param str Candidate string to inspect.
   */
  isMathExpression(str: string): boolean;

  /**
   * Parses a numeric-like value into a number.
   * @param value String or number to parse.
   */
  parseNumeric(value: string | number): number;
}

/**
 * Global math evaluator injected by Antinote before the extension script runs.
 *
 * @var MathEvaluator MathEvaluator instance providing safe expression evaluation.
 */
declare const MathEvaluator: MathEvaluator

/**
 * Reads a preference value for a specific extension and key.
 * @param extensionName Name of the extension owning the preference.
 * @param key Preference key to look up.
 */
declare function getExtensionPreference(extensionName: string, key: string): PreferenceValue;

/**
 * Executes a network request through Antinote's helper layer.
 * @param apiKeyId Identifier of the configured API key.
 * @param url Destination URL for the call.
 * @param method HTTP method, such as GET or POST.
 * @param headers Header string serialized by the caller.
 * @param body Request body payload.
 */
declare function callAPI(
    apiKeyId: string,
    url: string,
    method: string,
    headers: string,
    body: string
): CallAPIResult;

/**
 * Sends a prompt to an AI provider using Antinote's provider abstraction.
 * @param prompt Human-readable prompt sent to the model.
 * @param options Optional provider settings such as model name or temperature.
 */
declare function callAIProvider(prompt: string, options?: CallAIProviderOptions): ReturnObject;

/**
 * Shared registry of commands available to Antinote.
 *
 * @var commandRegistry Array of Command instances representing all registered commands.
 */
declare var commandRegistry: Command[]

/**
 * Shared registry of extensions currently loaded by Antinote.
 *
 * @var extensionRegistry Array of Extension instances representing all loaded extensions.
 */
declare var extensionRegistry: Extension[]

/**
 * The global object surface Antinote exposes to extension code.
 * This object is available on the global scope during script execution.
 */
interface AntinoteGlobal {
  /**
   * Registry of all commands available in the runtime.
   */
  commandRegistry: Command[];

  /**
   * Registry of all loaded extensions.
   */
  extensionRegistry: Extension[];

  /**
   * Math helper exposed globally by the runtime.
   */
  MathEvaluator: MathEvaluator;

  /**
   * Additional dynamic members are allowed on the global object.
   */
  [name: string]: unknown;
}

/**
 * Global object provided by the environment when the extension code runs in a script context.
 *
 * @var global AntinoteGlobal object containing runtime registries and helpers.
 */
declare var global: AntinoteGlobal

/**
 * Console interface matching the global logging surface exposed to extension code.
 */
interface Console {
  /**
   * Logs a message to the console.
   * @param args Values to print.
   */
  log(...args: unknown[]): void;

  /**
   * Writes an informational log entry.
   * @param args Values to print.
   */
  info(...args: unknown[]): void;

  /**
   * Logs a warning message.
   * @param args Values to print.
   */
  warn(...args: unknown[]): void;

  /**
   * Logs an error message.
   * @param args Values to print.
   */
  error(...args: unknown[]): void;
}

/**
 * Global console object available in the Antinote runtime.
 *
 * @var console Console interface for logging and debugging.
 */
declare var console: Console
