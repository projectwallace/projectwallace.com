import {
	parse,
	parse_selector,
	parse_value,
	parse_declaration,
	walk,
	SKIP,
	type CSSNode,
	AT_RULE,
	SELECTOR_LIST,
	SELECTOR,
	DECLARATION,
	NUMBER,
	DIMENSION,
	FUNCTION,
	STRING,
	URL,
	COMMENT
} from '@projectwallace/css-parser'

const token_types = [
	'AtruleName',
	'AtrulePrelude',
	'SelectorList',
	'Selector',
	'Property',
	'Value',
	'Number',
	'Unit',
	'Percentage',
	'Function',
	'String',
	'Comment',
	'Important'
]

const HIGHLIGHT_LEVEL_FULL = 1
const HIGHLIGHT_LEVEL_PARTIAL = 2
const HIGHLIGHT_LEVEL_MINIMAL = 3

const TIME_TO_WAIT = 50

function get_highlight_level(css_size: number, user_agent: string): number {
	let level = HIGHLIGHT_LEVEL_FULL

	if (css_size > 2_000_000) {
		level = HIGHLIGHT_LEVEL_MINIMAL
	} else if (css_size > 1_000_000) {
		level = HIGHLIGHT_LEVEL_PARTIAL
	} else {
		level = HIGHLIGHT_LEVEL_FULL
	}

	let is_chrome = /chrome|chromium/i.test(user_agent) || /edg/i.test(user_agent)

	if (is_chrome) {
		if (level === HIGHLIGHT_LEVEL_FULL) {
			level = HIGHLIGHT_LEVEL_PARTIAL
		} else if (level === HIGHLIGHT_LEVEL_PARTIAL) {
			level = HIGHLIGHT_LEVEL_MINIMAL
		}
	}

	return level
}

export type NodeType = 'selector' | 'declaration' | 'selectorList' | 'atrule' | 'value' | 'rule'

export function highlight_css(
	node: HTMLElement,
	{ css, node_type, enabled = true }: { css: string; node_type?: NodeType; enabled?: boolean }
) {
	if (!enabled) {
		return
	}
	let supports_highlights = 'highlights' in window.CSS
	if (!supports_highlights) {
		console.warn('CSS highlights are not supported in this browser')
		return
	}

	let user_agent = navigator.userAgent
	let highlight_level = get_highlight_level(css.length, user_agent)

	let highlights = window.CSS.highlights
	let text_node = node.firstChild!

	let ranges = new Set<StaticRange>()

	function add_range(token_type: string, start: number, end: number) {
		let range = new StaticRange({
			startContainer: text_node,
			startOffset: start,
			endContainer: text_node,
			endOffset: end
		})

		// Keep track of all ranges within scope to remove them later to prevent memory leaks
		ranges.add(range)
		highlights.get(token_type)?.add(range)
	}

	function do_highlight(css: string, node_type?: string) {
		try {
			let ast: CSSNode | CSSNode[]

			// Use appropriate parser based on node_type
			if (node_type === 'selector' || node_type === 'selectorList') {
				ast = parse_selector(css)
			} else if (node_type === 'value') {
				ast = parse_value(css)
			} else if (node_type === 'declaration') {
				ast = parse_declaration(css)
			} else {
				// Default: parse as full stylesheet
				ast = parse(css, {
					parse_atrule_preludes: highlight_level !== HIGHLIGHT_LEVEL_MINIMAL,
					parse_values: highlight_level === HIGHLIGHT_LEVEL_FULL,
					parse_selectors: highlight_level === HIGHLIGHT_LEVEL_FULL
				})
			}

			for (let token_type of token_types) {
				if (!highlights.has(token_type)) {
					highlights.set(token_type, new Highlight())
				}
			}

			// Walk handles both single nodes and arrays
			let nodes_to_walk = Array.isArray(ast) ? ast : [ast]
			for (let root of nodes_to_walk) {
				walk(root, (node: CSSNode) => {
					let start = node.start
					let end = node.end

					if (node.type === COMMENT) {
						// TODO: @projectwallace/css-parser currently doesn't support comments yet
						// https://github.com/projectwallace/css-parser/issues/22
						add_range('Comment', start, end)
					} else if (node.type === AT_RULE) {
						let name = node.name!
						add_range('AtruleName', start, start + name.length + 1)

						if (node.prelude) {
							// The prelude starts after @name and any whitespace
							let prelude_start = start + name.length + 1
							add_range('AtrulePrelude', prelude_start, prelude_start + node.prelude.text.length + 1)
						}
					} else if (
						node.type === SELECTOR_LIST &&
						(highlight_level === HIGHLIGHT_LEVEL_PARTIAL || highlight_level === HIGHLIGHT_LEVEL_MINIMAL)
					) {
						add_range('SelectorList', start, end)
						return SKIP
					} else if (node.type === SELECTOR && highlight_level === HIGHLIGHT_LEVEL_FULL) {
						add_range('Selector', start, end)
					} else if (
						node.type === DECLARATION &&
						(highlight_level === HIGHLIGHT_LEVEL_PARTIAL || highlight_level === HIGHLIGHT_LEVEL_FULL)
					) {
						add_range('Property', start, start + node.property!.length)

						if (node.is_important) {
							add_range('Important', end - 10, end)
						}

						if (highlight_level === HIGHLIGHT_LEVEL_PARTIAL) {
							return SKIP
						}
					} else if (node.type === NUMBER && highlight_level === HIGHLIGHT_LEVEL_FULL) {
						add_range('Number', start, end)
					} else if (node.type === DIMENSION && highlight_level === HIGHLIGHT_LEVEL_FULL) {
						let unit = node.unit || ''
						if (unit === '%') {
							add_range('Number', start, end - 1)
						} else {
							add_range('Number', start, end - unit.length)
							add_range('Unit', end - unit.length, end)
						}
					} else if (node.type === FUNCTION && highlight_level === HIGHLIGHT_LEVEL_FULL) {
						add_range('Function', start, start + node.name!.length)
					} else if (node.type === STRING && highlight_level === HIGHLIGHT_LEVEL_FULL) {
						add_range('String', start, end)
					} else if (node.type === URL && highlight_level === HIGHLIGHT_LEVEL_FULL) {
						add_range('Function', start, start + 3)
						add_range('String', start + 4, end - 1)
					}
				})
			}
		} catch {
			// noop
		}
	}

	function cleanup() {
		for (let token_type of token_types) {
			let items = highlights.get(token_type)
			if (items) {
				for (let range of ranges) {
					if (items.has(range)) {
						// Remove the range from the Highlight to prevent memory leaks
						items.delete(range)
					}
				}
			}
		}
		// Clear the ranges to prevent memory leaks
		ranges.clear()
	}

	let timer =
		'requestIdleCallback' in window
			? requestIdleCallback(() => do_highlight(css, node_type))
			: setTimeout(() => do_highlight(css, node_type), TIME_TO_WAIT)

	return {
		update({ css: updated_css, node_type: updated_node_type }: { css: string; node_type?: string }) {
			if (timer) {
				clearTimeout(timer)
			}

			// Clean up old ranges before applying new highlights
			cleanup()

			timer =
				'requestIdleCallback' in window
					? requestIdleCallback(() => do_highlight(updated_css, updated_node_type))
					: setTimeout(() => do_highlight(updated_css, updated_node_type), TIME_TO_WAIT)
		},
		destroy: () => {
			// Clear the timer to prevent memory leaks
			if (timer) {
				clearTimeout(timer)
			}

			if ('requestIdleCallback' in window) {
				requestIdleCallback(cleanup)
			} else {
				cleanup()
			}
		}
	}
}
