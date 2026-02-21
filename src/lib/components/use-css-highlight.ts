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
	DECLARATION
} from '@projectwallace/css-parser'

const token_types = ['AtruleName', 'SelectorList', 'Property', 'Comment', 'Important']

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

	if (node_type === 'selector' || node_type === 'selectorList' || node_type === 'value') {
		// Skip highlighting for some type
		return
	}

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
		window.CSS.highlights.get(token_type)?.add(range)
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
					parse_atrule_preludes: false,
					parse_values: false,
					parse_selectors: false,
					on_comment: (comment) => {
						add_range('Comment', comment.start, comment.end)
					}
				})
			}

			for (let token_type of token_types) {
				if (!highlights.has(token_type)) {
					highlights.set(token_type, new Highlight())
				}
			}

			// Walk handles both single nodes and arrays
			walk(ast, (node: CSSNode) => {
				let start = node.start
				let end = node.end

				if (node.type === AT_RULE) {
					let name = node.name!
					add_range('AtruleName', start, start + name.length + 1)
				} else if (node.type === SELECTOR_LIST) {
					add_range('SelectorList', start, end)
					return SKIP
				} else if (node.type === DECLARATION) {
					add_range('Property', start, start + node.property!.length)

					if (node.is_important) {
						add_range('Important', end - 11, end - 1)
					}

					return SKIP
				}
			})
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

	requestIdleCallback(() => do_highlight(css, node_type))

	return {
		update({ css: updated_css, node_type: updated_node_type }: { css: string; node_type?: string }) {
			// Clean up old ranges before applying new highlights
			requestIdleCallback(cleanup)
			// Then apply the new ones
			requestIdleCallback(() => do_highlight(updated_css, updated_node_type))
		},
		destroy: () => {
			requestIdleCallback(cleanup)
		}
	}
}
