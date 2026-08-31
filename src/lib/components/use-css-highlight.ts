import { browser } from '$app/env'
import {
	parse,
	parse_selector,
	parse_value,
	parse_declaration,
	walk,
	SKIP,
	AT_RULE,
	STYLE_RULE,
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
	let supports_highlights = browser && 'highlights' in window.CSS
	if (!supports_highlights) {
		console.warn('CSS highlights are not supported in this browser')
		return
	}

	if (window.matchMedia('(forced-colors: active)').matches) {
		// skip highlighting in forced colors mode because the results are usually quite unexpected
		return
	}

	if (node_type === 'selector' || node_type === 'selectorList' || node_type === 'value') {
		// Skip highlighting for some type
		return
	}

	let highlights = window.CSS.highlights
	// Own ranges, grouped by token type, so cleanup() can clear each type's set directly
	// instead of checking every range against every type's shared Highlight object.
	let ranges = new Map<string, Set<StaticRange>>(token_types.map((token_type) => [token_type, new Set()]))
	// Re-read on every do_highlight() call rather than captured once, since the text node
	// can be replaced (e.g. css toggling empty/non-empty) — a stale reference would silently
	// highlight a detached node while leaving old ranges registered until destroy.
	let text_node: Node | null = null

	function add_range(token_type: string, start: number, end: number) {
		let range = new StaticRange({
			startContainer: text_node!,
			startOffset: start,
			endContainer: text_node!,
			endOffset: end
		})

		ranges.get(token_type)!.add(range)
		window.CSS.highlights.get(token_type)?.add(range)
	}

	function do_highlight(css: string, node_type?: string) {
		text_node = node.firstChild
		if (!text_node) {
			return
		}

		try {
			let ast

			for (let token_type of token_types) {
				if (!highlights.has(token_type)) {
					highlights.set(token_type, new Highlight())
				}
			}

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

			// Walk handles both single nodes and arrays
			walk(ast, (node) => {
				let start = node.start
				let end = node.end

				if (node.type === AT_RULE) {
					let name = node.name!
					add_range('AtruleName', start, start + name.length + 1)
				} else if (node.type === STYLE_RULE) {
					// With parse_selectors disabled, node.prelude is an untyped RAW span rather
					// than a SELECTOR_LIST node, but it still gives us the exact selector range —
					// no need to pay for full selector parsing just to get a typed node here.
					if (node.has_prelude) {
						let prelude = node.prelude
						add_range('SelectorList', prelude.start, prelude.end)
					}
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
		for (let [token_type, own_ranges] of ranges) {
			let items = highlights.get(token_type)
			for (let range of own_ranges) {
				// Remove the range from the Highlight to prevent memory leaks
				items?.delete(range)
			}
			own_ranges.clear()
		}
	}

	let idle_id: number | undefined

	function schedule(fn: () => void) {
		if (idle_id !== undefined) {
			cancelIdleCallback(idle_id)
		}
		idle_id = requestIdleCallback(() => {
			idle_id = undefined
			fn()
		})
	}

	schedule(() => do_highlight(css, node_type))

	return {
		update({ css: updated_css, node_type: updated_node_type }: { css: string; node_type?: string }) {
			schedule(() => {
				cleanup()
				do_highlight(updated_css, updated_node_type)
			})
		},
		destroy: () => {
			if (idle_id !== undefined) {
				cancelIdleCallback(idle_id)
				idle_id = undefined
			}
			cleanup()
		}
	}
}
