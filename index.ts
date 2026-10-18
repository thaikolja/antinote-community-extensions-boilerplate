/*
 * @file         Antinote Extension
 * @description  Boilerplate community extension for the macOS app Antinote.
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
 * Stable snake_case id for this extension. Must match the folder name and extension.json "name".
 */
var extensionName = 'boilerplate'

/**
 * Root Extension instance Antinote registers when it loads index.js.
 */
var extensionRoot = new Extension({
  name:            extensionName,
  version:         '1.0.0',
  endpoints:       [ 'https://60797dd9460a6600174fbd2d.mockapi.io/location_url' ],
  requiredAPIKeys: [],
  author:          'Kolja Nolte',
  category:        'Utilities',
  dataScope:       'none',
  dependencies:    [],
  isService:       false
})

/**
 * Registers the Greeting preference shown under Settings > Extensions for this extension.
 */
extensionRoot.register_preference(new Preference({
  key:          'greeting',
  label:        'Greeting',
  type:         'string',
  defaultValue: 'Hello',
  helpText:     'Word inserted by ::hello. Shown in Settings > Extensions.'
}))

/**
 * Command that inserts a greeting at the cursor via `::hello` or `::hello(Name)`.
 */
var hello = new Command({
  name:       'hello',
  parameters: [
    new Parameter({
      type:     'string',
      name:     'name',
      helpText: 'Who to greet. Leave empty to greet "there".',
      default:  '',
      required: false
    })
  ],
  type:       'insert',
  helpText:   'Insert a greeting at the cursor.',
  tutorials:  [
    new TutorialCommand({ command: 'hello', description: 'Insert the default greeting.' }),
    new TutorialCommand({ command: 'hello(Ada)', description: 'Greet Ada.' })
  ],
  extension:  extensionRoot
})

/**
 * Runs ::hello: reads the optional name, optional greeting preference, and returns insert text.
 * @param payload Runtime payload from Antinote with parameters and note context.
 * @returns Success ReturnObject whose payload is the greeting string to insert.
 */
hello.execute = function (payload) {
  /**
   * First parsed command parameter; the optional person name.
   */
  var name = this.getParsedParams(payload)[0]

  /**
   * Greeting word used when no preference is available.
   */
  var greeting = 'Hello'

  /**
   * Prefer the Settings value when Antinote injects getExtensionPreference.
   */
  if (typeof getExtensionPreference === 'function') {
    /**
     * Value stored for the greeting preference key, if any.
     */
    var configured = getExtensionPreference(extensionName, 'greeting')

    /**
     * Override the default greeting when a non-empty preference exists.
     */
    if (configured) {
      /**
       * Normalize the preference to a string for concatenation.
       */
      greeting = String(configured)
    }
  }

  /**
   * Display name: trimmed parameter, or "there" when empty or missing.
   */
  var who = name && String(name).trim() ? String(name).trim() : 'there'

  /**
   * Hand the composed greeting back to Antinote for insertion at the cursor.
   */
  return new ReturnObject({
    status:  'success',
    message: 'Greeting inserted.',
    payload: greeting + ', ' + who + '.'
  })
}

/**
 * Command that opens the Antinote extensions guide via `::open_docs`.
 */
var openDocs = new Command({
  name:       'open_docs',
  parameters: [],
  type:       'openURL',
  helpText:   'Open the Antinote extensions guide.',
  tutorials:  [
    new TutorialCommand({ command: 'open_docs', description: 'Open https://antinote.io/extensions/.' })
  ],
  extension:  extensionRoot
})

/**
 * Runs ::open_docs and returns the URL Antinote should open.
 * @returns Success ReturnObject whose payload is the extensions guide URL.
 */
openDocs.execute = function () {
  /**
   * Tell Antinote to open the public extensions documentation page.
   */
  return new ReturnObject({
    status:  'success',
    message: 'Opening the extensions guide.',
    payload: 'https://antinote.io/extensions/'
  })
}
