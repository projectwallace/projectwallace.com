export const COMPONENT_PRESETS = {
	button: ['button', '.button', '.btn', '[role="button"]'],
	heading: ['h1', '.h1', '.heading-1']
} as const

export type Component = keyof typeof COMPONENT_PRESETS

// Prefix-matched against declaration.property. Intentionally excludes
// spacing/layout props (margin, padding, width, gap, position, display, ...).
export const DESIGN_TOKEN_PROPERTY_PREFIXES = [
	'background',
	'color',
	'border',
	'outline',
	'box-shadow',
	'font',
	'line-height',
	'text-decoration',
	'fill',
	'stroke',
	'accent-color',
	'caret-color'
]

// Dynamic/interaction pseudo-classes that never structurally "match" a static
// DOM (linkedom has no real hover/focus state) - stripped before .matches(),
// remembered as a "state" bucket for the resulting tokens.
export const STATE_PSEUDO_CLASSES = [
	'hover',
	'focus',
	'focus-visible',
	'focus-within',
	'active',
	'disabled',
	'visited',
	'target'
]
