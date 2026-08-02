const MAX_NESTING_DEPTH = 4

/** @type {import('stylelint').Config} */
export default {
	extends: ['@projectwallace/stylelint-plugin/configs/recommended'],
	overrides: [
		{
			files: ['src/**'],
			extends: ['stylelint-config-standard'],
			rules: {
				'declaration-property-value-keyword-no-deprecated': [true, { ignoreKeywords: ['break-word'] }],
				'no-invalid-position-declaration': null,
				'no-descending-specificity': null,
				// crashes on @container due to css-tree not supporting <container-query>
				'at-rule-prelude-no-invalid': [true, { ignoreAtRules: ['container'] }],
				'comment-no-empty': true,
				'selector-pseudo-class-no-unknown': [true, { ignorePseudoClasses: ['global'] }],
				'function-no-unknown': [true, { ignoreFunctions: ['anchor'] }],
				'declaration-property-value-no-unknown': [
					true,
					{
						ignoreProperties: {
							top: '/^anchor/',
							right: '/^anchor/',
							bottom: '/^anchor/',
							left: '/^anchor/',
							inset: '/^anchor/',
							cursor: '/.*/', // css-tree crashes on <cursor-predefined> syntax reference
							'list-style': '/.*/', // css-tree crashes on <symbols()> syntax reference
							'list-style-type': '/.*/', // css-tree crashes on <symbols()> syntax reference
							'grid-template-rows': 'masonry'
						}
					}
				],
				'property-no-vendor-prefix': [
					true,
					{ ignoreProperties: ['-webkit-text-size-adjust', '-webkit-text-decoration'] }
				],
				'length-zero-no-unit': null,
				'custom-property-empty-line-before': 'never',
				'declaration-empty-line-before': 'never',
				'declaration-block-no-duplicate-custom-properties': true,
				'declaration-block-no-duplicate-properties': true,
				'font-family-no-duplicate-names': true,
				'no-duplicate-selectors': null,
				'color-named': 'never',
				'value-keyword-case': [
					'lower',
					{
						ignoreKeywords: ['currentColor', 'optimizeSpeed'],
						ignoreProperties: ['font-family', 'font', /^--font/]
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
							'Value'
						]
					}
				],
				'selector-id-pattern': null,
				'comment-empty-line-before': null,
				'number-max-precision': null,
				'alpha-value-notation': 'number',
				'media-feature-range-notation': 'prefix', // Safari 16.4+ support
				'custom-property-pattern': [
					// TODO: enfore --pw- as start
					'^_?([a-z][a-z0-9]*)(-[a-z0-9]+)*$',
					{
						message:
							'Expected custom property name to be lowercase and hyphen-separated, optionally starting with an underscore to indicate a component-specific variable'
					}
				],
				'font-family-name-quotes': 'always-unless-keyword',
				'selector-attribute-quotes': 'always',
				'declaration-block-no-redundant-longhand-properties': null, // Prefer explicit longhand properties
				'shorthand-property-no-redundant-values': null
			}
		},
		{
			files: ['src/**/*.svelte'],
			customSyntax: 'postcss-html'
		},
		{
			// HOLISTIC LINTING
			files: ['.svelte-kit/**/*.css'],
			rules: {
				'projectwallace/no-unused-custom-properties': [
					true,
					{
						ignore: [/diffstat-\w+/]
					}
				],
				'projectwallace/max-declarations-per-rule': 27, // our @layer.html spacing scale; TODO: allow { ignore: ['html']}
				'projectwallace/max-spacing-resets': 17,
				'projectwallace/max-unique-media-queries': [
					11, // TODO: reduce and convert some to container queries
					{
						ignore: [
							/forced-colors/,
							/hover/,
							/prefers-color-scheme/,
							/prefers-contrast/,
							/prefers-reduced-motion/,
							/print/
						]
					}
				],
				'projectwallace/max-unique-units': 17,
				'projectwallace/max-unique-font-sizes': [
					18,
					{
						ignore: [
							'calc(14px + 0.5vw)', // polypane callout
							'20px', // polypane callout
							'1em', // relative sizing is hard
							/--\w+-font-size/ // re-mappings of existing font-size scale
						]
					}
				],
				'projectwallace/max-unique-gradients': 11,
				'projectwallace/max-unique-line-heights': [
					7,
					{
						ignore: [
							/--\w+-line-height/, // token remapping
							/calc/,
							'0.1px',
							'0',
							'1.5',
							'1.25',
							'26px' // polypane
						]
					}
				],
				'projectwallace/no-property-shorthand': null, // already covered in source files
				'projectwallace/no-prefixed-selectors': null, // already covered in source files
				'projectwallace/no-prefixed-properties': null, // already covered in source files
				'projectwallace/no-prefixed-values': [true, { ignore: ['-apple-system'] }], // already covered in source files
				'projectwallace/min-declaration-uniqueness-ratio': 0.38,
				'projectwallace/no-unknown-custom-properties': [true, { allowFallback: true }]
			}
		}
	],
	ignoreFiles: ['**/*.js', '**/*.ts', '**/*.json', '**/*.md'],
	defaultSeverity: 'warning',
	rules: {
		'projectwallace/no-unknown-custom-properties': null,
		'projectwallace/no-unused-custom-properties': null,
		'projectwallace/no-property-shorthand': [
			true,
			{
				ignore: [
					'single-value',
					'border',
					'outline', // 1px solid transparent
					/border-block/,
					/border-inline/, // 1px solid transparent
					'grid-column',
					'grid-row',
					'contain-intrinsic-size',
					'transition' // TODO: break down these shorthands
				]
			}
		],
		'projectwallace/max-nesting-depth': MAX_NESTING_DEPTH,
		'projectwallace/no-prefixed-selectors': [
			true,
			{ ignore: [/-meter-/] } // -moz-meter-bar, -webkit-meter-optimum-value, etc.
		]
	}
}
