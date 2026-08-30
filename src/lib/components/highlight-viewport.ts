// Below this size, virtualization overhead (probes, listeners, filtering) isn't worth it -
// consumers should keep today's "highlight everything" behavior.
export const VIRTUALIZE_THRESHOLD_CHARS = 250_000

// Layer 1: pure geometry helpers, no knowledge of highlighting or of any
// particular consumer.

export function build_line_offsets(css: string): Uint32Array {
	const offsets: number[] = [0]
	let index = 0
	while ((index = css.indexOf('\n', index)) !== -1) {
		index++
		offsets.push(index)
	}
	return Uint32Array.from(offsets)
}

export function get_line_height(node: Element): number {
	const style = getComputedStyle(node)
	const line_height = parseFloat(style.lineHeight)
	if (Number.isFinite(line_height) && line_height > 0) {
		return line_height
	}
	// line-height: normal has no computed px value; approximate it the way browsers do.
	const font_size = parseFloat(style.fontSize)
	return Number.isFinite(font_size) && font_size > 0 ? font_size * 1.2 : 16
}

// Reads the visible block extent via CSS container query units instead of walking up
// to find a specific "scroll container" element. With no ancestor `container-type`,
// cqb resolves against the initial containing block (i.e. the viewport), so this works
// out of the box; a component can later scope it tighter by adding `container-type: size`
// (or `block-size`) to an ancestor, with no change here.
export function measure_visible_block_size(node: Element): number {
	const parent = node.parentElement ?? document.body
	const probe = document.createElement('div')
	probe.style.cssText = 'position:absolute;visibility:hidden;pointer-events:none;inline-size:0;block-size:100cqb;'
	parent.append(probe)
	const height = probe.getBoundingClientRect().height
	probe.remove()
	return height || window.innerHeight
}

export type ScrollPositionSource = {
	get_offset(): number
	subscribe(fn: () => void): () => void
}

function is_scroll_container(el: Element): boolean {
	const overflow_y = getComputedStyle(el).overflowY
	return (overflow_y === 'auto' || overflow_y === 'scroll') && el.scrollHeight > el.clientHeight
}

// Nearest-scrollable-ancestor walk, generic and structural (not tied to any class name
// convention). Falls back to the document scroll position, mirroring the viewport
// fallback used for block-size measurement above.
export function find_scroll_position_source(node: Element): ScrollPositionSource {
	let el = node.parentElement
	while (el) {
		if (is_scroll_container(el)) {
			const target = el
			return {
				get_offset: () => target.scrollTop,
				subscribe(fn) {
					target.addEventListener('scroll', fn, { passive: true })
					return () => target.removeEventListener('scroll', fn)
				}
			}
		}
		el = el.parentElement
	}
	return {
		get_offset: () => document.scrollingElement?.scrollTop ?? window.scrollY,
		subscribe(fn) {
			window.addEventListener('scroll', fn, { passive: true })
			return () => window.removeEventListener('scroll', fn)
		}
	}
}

export type LineRange = { start_line: number; end_line: number }

export function compute_visible_line_range({
	line_height,
	block_size,
	scroll_offset,
	overscan_lines
}: {
	line_height: number
	block_size: number
	scroll_offset: number
	overscan_lines: number
}): LineRange {
	if (line_height <= 0) {
		return { start_line: 0, end_line: Infinity }
	}
	const first_visible_line = Math.floor(scroll_offset / line_height)
	const visible_lines = Math.ceil(block_size / line_height)
	return {
		start_line: Math.max(0, first_visible_line - overscan_lines),
		end_line: first_visible_line + visible_lines + overscan_lines
	}
}

export type CharRange = { start: number; end: number }

// The only place line indices meet actual text - Layer 2 (the action below) never
// sees `css`, only line numbers.
export function line_range_to_char_range(
	line_offsets: Uint32Array,
	start_line: number,
	end_line: number,
	text_length: number
): CharRange {
	const clamped_start = Math.min(Math.max(start_line, 0), line_offsets.length - 1)
	const start = line_offsets[clamped_start] ?? 0
	const end = end_line + 1 < line_offsets.length ? line_offsets[end_line + 1] : text_length
	return { start, end }
}

// Layer 2: a standalone Svelte action that tracks the visible line range and reports it
// via a DOM CustomEvent, so any number of other `use:` actions or component effects on
// the same node can subscribe without any direct reference to this module or to each
// other - composability through the node, not through shared imports.

export const FULL_LINE_RANGE: LineRange = { start_line: 0, end_line: Infinity }

export type ViewportWindowChangeEvent = CustomEvent<LineRange>

export type TrackViewportWindowParams = {
	enabled?: boolean
	overscan_lines?: number
}

export function track_viewport_window(node: Element, params: TrackViewportWindowParams = {}) {
	let enabled = params.enabled ?? true
	let overscan_lines = params.overscan_lines ?? 50

	let unsubscribe: (() => void) | undefined
	let resize_observer: ResizeObserver | undefined
	let window_resize_handler: (() => void) | undefined
	let raf_id: number | undefined
	let last_range: LineRange | undefined

	function dispatch(range: LineRange) {
		last_range = range
		node.dispatchEvent(new CustomEvent('viewportwindowchange', { detail: range }))
	}

	function recompute(source: ScrollPositionSource) {
		const range = compute_visible_line_range({
			line_height: get_line_height(node),
			block_size: measure_visible_block_size(node),
			scroll_offset: source.get_offset(),
			overscan_lines
		})

		// Hysteresis: skip the (relatively costly, since it re-measures geometry and
		// triggers callers to rebuild highlight ranges) recompute unless the window
		// actually moved meaningfully, so we don't do work on every scroll pixel.
		if (last_range) {
			const hysteresis = Math.max(1, Math.floor(overscan_lines / 2))
			const moved =
				Math.abs(range.start_line - last_range.start_line) >= hysteresis ||
				Math.abs(range.end_line - last_range.end_line) >= hysteresis
			if (!moved) return
		}

		dispatch(range)
	}

	function schedule_recompute(source: ScrollPositionSource) {
		if (raf_id !== undefined) cancelAnimationFrame(raf_id)
		raf_id = requestAnimationFrame(() => {
			raf_id = undefined
			recompute(source)
		})
	}

	function setup() {
		// Defer the first dispatch to a microtask: `use:` directives on the same element run
		// synchronously in template order, so dispatching immediately here could fire before a
		// sibling `use:` action (e.g. the highlight action) has attached its listener. By the
		// next microtask every action on this node has run its synchronous setup, regardless
		// of directive order.
		if (!enabled) {
			queueMicrotask(() => dispatch(FULL_LINE_RANGE))
			return
		}

		const source = find_scroll_position_source(node)
		queueMicrotask(() => recompute(source))

		unsubscribe = source.subscribe(() => schedule_recompute(source))

		resize_observer = new ResizeObserver(() => schedule_recompute(source))
		if (node.parentElement) resize_observer.observe(node.parentElement)

		window_resize_handler = () => schedule_recompute(source)
		window.addEventListener('resize', window_resize_handler, { passive: true })
	}

	function teardown() {
		if (raf_id !== undefined) cancelAnimationFrame(raf_id)
		raf_id = undefined
		unsubscribe?.()
		unsubscribe = undefined
		resize_observer?.disconnect()
		resize_observer = undefined
		if (window_resize_handler) window.removeEventListener('resize', window_resize_handler)
		window_resize_handler = undefined
		last_range = undefined
	}

	setup()

	return {
		update(new_params: TrackViewportWindowParams) {
			const was_enabled = enabled
			enabled = new_params.enabled ?? true
			overscan_lines = new_params.overscan_lines ?? 50

			if (was_enabled !== enabled) {
				teardown()
				setup()
			}
		},
		destroy: teardown
	}
}
