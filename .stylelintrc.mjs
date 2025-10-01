/** @type {import('stylelint').Config} */
export default {
	extends: ['stylelint-config-standard'],
	plugins: ['stylelint-value-no-unknown-custom-properties'],
	overrides: [
		{
			files: ['src/**/*.svelte'],
			customSyntax: 'postcss-html',
		},
	],
	ignoreFiles: ['**/*.js', '**/*.ts', '**/*.json', '**/*.md'],
	defaultSeverity: 'warning',
	rules: {
		/**
		 * Avoid errors
		 */

		// Deprecated
		'declaration-property-value-keyword-no-deprecated': [
			true,
			{
				ignoreKeywords: ['break-word']
			}
		],

		// Descending
		'no-descending-specificity': null,

		// Empty
		'comment-no-empty': true,

		// Unknown
		'selector-pseudo-class-no-unknown': [
			true,
			{
				ignorePseudoClasses: [
					'global', // for Svelte
				]
			}
		],
		'function-no-unknown': [
			true,
			{
				ignoreFunctions: [
					'anchor'
				]
			}
		],
		'declaration-property-value-no-unknown': [
			true,
			{
				ignoreProperties: {
					'top': '/^anchor/',
					'right': '/^anchor/',
					'bottom': '/^anchor/',
					'left': '/^anchor/',
					'inset': '/^anchor/',
				}
			}
		],

		// Conventions
		'property-no-vendor-prefix': [
			true,
			{
				ignoreProperties: [
					'text-size-adjust',
					'text-decoration'
				]
			}
		],
		'length-zero-no-unit': null,
		'custom-property-empty-line-before': 'never',
		'declaration-empty-line-before': 'never',

		// // Duplication
		'declaration-block-no-duplicate-custom-properties': true,
		'declaration-block-no-duplicate-properties': true,
		'font-family-no-duplicate-names': true,
		'no-duplicate-selectors': null,

		/**
		 * Enforce conventions
		 */

		// Allowed, disallowed & required
		'color-named': 'never',

		// Case
		'value-keyword-case': [
			'lower',
			{
				ignoreKeywords: [
					'currentColor',
					'optimizeSpeed',
				],
				ignoreProperties: [
					'font-family',
					'font',
					/^--font/
				],
			}
		],
		'selector-type-case': [
			'lower',
			{
				ignoreTypes: [
					'AtruleName',
					'AtrulePrelude',
					'Comment',
					'Function',
					'Important',
					'Number',
					'Percentage',
					'Property',
					'Selector',
					'SelectorList',
					'String',
					'Unit',
					'Value',
				]
			}
		],

		// Empty lines
		'comment-empty-line-before': null,

		// Max & Min
		'number-max-precision': null, // pretty useless rule

		// Notation
		'alpha-value-notation': 'number',
		'media-feature-range-notation': 'prefix', // because of Safari 16.4+ support

		// Pattern
		'custom-property-pattern': [
			'^_?([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
			{
				message: 'Expected custom property name to be lowercase and hyphen-separated, optionally starting with an underscore to indicate a component-specific variable',
			}
		],

		// Quotes
		'font-family-name-quotes': 'always-unless-keyword',
		'selector-attribute-quotes': 'always',

		// Redundant
		'declaration-block-no-redundant-longhand-properties': null, // Prefer explicit longhand properties
		'shorthand-property-no-redundant-values': null,

		// Others / plugins
		"csstools/value-no-unknown-custom-properties": [
			true,
			{
				importFrom: [
					'./src/lib/css/style.css'
				]
			}
		],
	}
}
