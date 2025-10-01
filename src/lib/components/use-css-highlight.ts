import { walk, parse, type CssNode } from 'css-tree'

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

/** @see https://github.com/csstree/csstree/blob/master/docs/parsing.md#context */
export type NodeType =
	'stylesheet' |
	'atrule' |
	'atrulePrelude' |
	'mediaQueryList' |
	'mediaQuery' |
	'rule' |
	'selectorList' |
	'selector' |
	'block' |
	'declarationList' |
	'declaration' |
	'value'

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

export function highlight_css(node: HTMLElement, {
	css,
	node_type,
	enabled = true
}: { css: string, node_type?: NodeType, enabled?: boolean }) {
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
		highlights
			.get(token_type)
			?.add(range)
	}

	function do_highlight(css: string, node_type?: NodeType) {
		try {
			let ast = parse(css, {
				context: node_type,
				positions: true,
				parseAtrulePrelude: true,
				parseCustomProperty: true,
				parseRulePrelude: true,
				onComment(_, location) {
					add_range('Comment', location.start.offset, location.end.offset)
				}
			})

			for (let token_type of token_types) {
				if (!highlights.has(token_type)) {
					highlights.set(token_type, new Highlight())
				}
			}

			walk(ast, function (node: CssNode) {
				if (!node.loc) return

				let start = node.loc.start.offset
				let end = node.loc.end.offset

				if (node.type === 'Atrule') {
					add_range('AtruleName', start, start + node.name.length + 1)

					if (node.prelude !== null) {
						add_range('AtrulePrelude', node.prelude.loc?.start.offset!, node.prelude.loc!.end.offset)
					}
				} else if (node.type === 'SelectorList' && (highlight_level === HIGHLIGHT_LEVEL_PARTIAL || highlight_level === HIGHLIGHT_LEVEL_MINIMAL)) {
					add_range('SelectorList', start, end)
					return this.skip
				} else if (node.type === 'Selector' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('Selector', start, end)
				} else if (node.type === 'Declaration' && (highlight_level === HIGHLIGHT_LEVEL_PARTIAL || highlight_level === HIGHLIGHT_LEVEL_FULL)) {
					add_range('Property', start, start + node.property.length)

					if (node.important === true) {
						add_range('Important', end - 10, end)
					}
					else if (typeof node.important === 'string') {
						add_range('Important', end - node.important.length - 1, end)
					}

					if (highlight_level === HIGHLIGHT_LEVEL_PARTIAL) {
						return this.skip
					}
				} else if (node.type === 'Value' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('Value', start, end)
				} else if (node.type === 'Number' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('Number', start, end)
				} else if (node.type === 'Dimension' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('Number', start, end - node.unit.length)
					add_range('Unit', end - node.unit.length, end)
				} else if (node.type === 'Percentage' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('Number', start, end - 1)
				} else if (node.type === 'Function' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('Function', start, start + node.name.length)
				} else if (node.type === 'String' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('String', start, end)
				} else if (node.type === 'Url' && highlight_level === HIGHLIGHT_LEVEL_FULL) {
					add_range('Function', start, start + 3)
					add_range('String', start + 4, end - 1)
				}
			})
		} catch (error) {
			import('@sentry/sveltekit').then(({ captureException }) => {
				captureException(error, {
					fingerprint: ['use-css-highlight-error'],
					tags: {
						user_agent: navigator.userAgent
					},
				})
			})
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

	let timer = ('requestIdleCallback' in window)
		? requestIdleCallback(() => do_highlight(css, node_type))
		: setTimeout(() => do_highlight(css, node_type), TIME_TO_WAIT)

	return {
		update({ css: updated_css, node_type }: { css: string, node_type?: NodeType }) {
			if (timer) {
				clearTimeout(timer)
			}

			timer = ('requestIdleCallback' in window)
				? requestIdleCallback(() => do_highlight(updated_css, node_type))
				: setTimeout(() => do_highlight(updated_css, node_type), TIME_TO_WAIT)
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
