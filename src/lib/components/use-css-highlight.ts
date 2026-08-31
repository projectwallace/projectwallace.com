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
	DECLARATION,
	type CSSNode
} from '@projectwallace/css-parser'
import {
	build_line_offsets,
	line_range_to_char_range,
	FULL_LINE_RANGE,
	VIRTUALIZE_THRESHOLD_CHARS,
	type LineRange,
	type CharRange,
	type ViewportWindowChangeEvent
} from './highlight-viewport'

const token_types = ['AtruleName', 'SelectorList', 'Property', 'Comment', 'Important']

type ParsedCss = {
	css: string
	node_type: string | undefined
	ast: CSSNode
	comments: CharRange[]
}

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
	// Reported by the track_viewport_window action (a separate `use:` directive on the same
	// node - see highlight-viewport.ts). Defaults to "everything" until the first event
	// arrives, or forever for files below the virtualization threshold.
	let visible_range: LineRange = FULL_LINE_RANGE
	// undefined means "not virtualizing" (small file) - every token is in view.
	let char_range: CharRange | undefined

	function in_view(start: number, end: number): boolean {
		return char_range === undefined || (start < char_range.end && end > char_range.start)
	}

	// Parsing the whole document is the one cost virtualization doesn't bound - the walk
	// below is cheap once pruned by in_view(), but re-parsing on every scroll-triggered
	// rehighlight would redo that work for content that hasn't changed. Cache the parse
	// result (and the line-offset table used to compute char_range) and only redo them
	// when `css`/`node_type` actually change, not when only the visible window moves.
	let parsed: ParsedCss | undefined
	let line_offsets: { css: string; offsets: Uint32Array } | undefined

	function get_line_offsets(css: string): Uint32Array {
		if (line_offsets?.css !== css) {
			line_offsets = { css, offsets: build_line_offsets(css) }
		}
		return line_offsets.offsets
	}

	function get_parsed(css: string, node_type?: string): ParsedCss {
		if (parsed?.css === css && parsed.node_type === node_type) {
			return parsed
		}

		let ast: CSSNode
		let comments: CharRange[] = []

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
					comments.push({ start: comment.start, end: comment.end })
				}
			})
		}

		parsed = { css, node_type, ast, comments }
		return parsed
	}

	function add_range(token_type: string, start: number, end: number) {
		if (!in_view(start, end)) return

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

		char_range =
			css.length > VIRTUALIZE_THRESHOLD_CHARS
				? line_range_to_char_range(get_line_offsets(css), visible_range.start_line, visible_range.end_line, css.length)
				: undefined

		try {
			for (let token_type of token_types) {
				if (!highlights.has(token_type)) {
					highlights.set(token_type, new Highlight())
				}
			}

			const { ast, comments } = get_parsed(css, node_type)

			for (const comment of comments) {
				add_range('Comment', comment.start, comment.end)
			}

			// Walk handles both single nodes and arrays
			walk(ast, (node) => {
				let start = node.start
				let end = node.end

				if (node.type === AT_RULE) {
					// An at-rule with a body (e.g. @media) is a container - skip its whole subtree
					// when it doesn't overlap the visible window, instead of only skipping the
					// range registration, so the walker doesn't pay to descend into off-screen rules.
					if (!in_view(start, end)) return SKIP
					let name = node.name!
					add_range('AtruleName', start, start + name.length + 1)
				} else if (node.type === STYLE_RULE) {
					if (!in_view(start, end)) return SKIP
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

	let current_css: string = css
	let current_node_type: string | undefined = node_type

	function rehighlight() {
		schedule(() => {
			cleanup()
			do_highlight(current_css, current_node_type)
		})
	}

	function on_viewport_window_change(event: Event) {
		visible_range = (event as ViewportWindowChangeEvent).detail
		rehighlight()
	}

	node.addEventListener('viewportwindowchange', on_viewport_window_change)
	rehighlight()

	return {
		update({ css: updated_css, node_type: updated_node_type }: { css: string; node_type?: string }) {
			current_css = updated_css
			current_node_type = updated_node_type
			rehighlight()
		},
		destroy: () => {
			if (idle_id !== undefined) {
				cancelIdleCallback(idle_id)
				idle_id = undefined
			}
			node.removeEventListener('viewportwindowchange', on_viewport_window_change)
			cleanup()
		}
	}
}
