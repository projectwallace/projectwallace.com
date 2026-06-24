<script module lang="ts">
	export type CoverageChunk = {
		start_line: number
		end_line: number
		is_covered: boolean
		total_lines: number
	}
</script>

<script lang="ts">
	import { onMount, onDestroy, untrack } from 'svelte'
	import { browser } from '$app/environment'
	import type { CssLocation } from '$lib/css-location'
	import { highlight_css } from './use-css-highlight'
	import Icon from '$components/Icon.svelte'

	type BaseProps = {
		css?: string
		selected_location?: CssLocation
		locations?: CssLocation[]
		coverage_chunks?: CoverageChunk[]
	}

	type WrappingProps = BaseProps & {
		wrap?: true
		line_numbers?: false
	}

	type LineNumberProps = BaseProps & {
		wrap?: false
		line_numbers: true
	}

	type Props = WrappingProps | LineNumberProps

	let {
		css = '',
		selected_location = undefined,
		locations = [],
		// Used in MinifyCss
		wrap = false,
		// Used in MinifyCss
		line_numbers = false,
		coverage_chunks = undefined // FIX #1: was [], which made show_line_numbers always true
	}: Props = $props()

	// Keep track of whether the browser supports the Highlight API
	let supports_highlights = $state(false)
	let lines: Highlight | undefined
	let selected_line: Highlight | undefined
	// body element is used to scroll to the highlighted location
	// svelte-ignore non_reactive_update
	let body: HTMLElement | undefined = undefined
	// code_node is used to highlight the code (highlighting only works on TextNodes)
	// reactive so effects re-run after {#key css} rebuilds the DOM
	let code_node = $state<HTMLElement | undefined>(undefined)
	// pre_node is the horizontal scroll container; body only scrolls vertically
	let pre_node = $state<HTMLElement | undefined>(undefined)
	// Line height is used to scroll to the highlighted location
	const LINE_HEIGHT = 20
	const CHAR_WIDTH = 7.953580311708464 // measured by the width of tenthousands monospace characters
	// Lines of context to keep visible above the target line when scrolling.
	// scroll-margin/scroll-padding have no effect on our overflow container, so we subtract
	// this manually from every scrollTo() call and add it back when finding the "next" chunk.
	const SCROLL_MARGIN_LINES = 3

	let total_lines = $derived(css.split('\n').length)
	let line_number_width = $derived(total_lines.toString().length)
	// Only show when coverage data is actually present
	let has_coverage = $derived(coverage_chunks !== undefined && coverage_chunks.length > 0)
	let show_line_numbers = $derived(has_coverage || line_numbers)
	let show_coverage = $derived(has_coverage)
	let uncovered_blocks_count = $derived((coverage_chunks ?? []).filter((c) => !c.is_covered).length)
	let coverage_line_numbers = $derived(
		(coverage_chunks ?? []).map((chunk) =>
			Array.from({ length: chunk.total_lines }, (_, i) => i + chunk.start_line)
				.join('\n')
				.trim()
		)
	)
	let plain_line_numbers = $derived(
		Array.from({ length: total_lines }, (_, i) => i + 1)
			.join('\n')
			.trim()
	)

	onMount(function () {
		supports_highlights = browser && 'highlights' in window.CSS
		if (supports_highlights) {
			lines = window.CSS.highlights.get('lines') || new Highlight()
			selected_line = window.CSS.highlights.get('selected_line') || new Highlight()
		}
	})

	onDestroy(function () {
		if (supports_highlights) {
			window.CSS.highlights.get('lines')?.clear()
			window.CSS.highlights.delete('lines')
			window.CSS.highlights.delete('selected_line')
		}
	})

	// read selected_location without tracking it so this effect only fires on css changes,
	// and won't fight the scroll-to-selection effect when both fire in the same tick
	$effect(() => {
		if (css && css.length > 0 && body !== undefined && untrack(() => selected_location) === undefined) {
			body.scrollTo({ top: 0, left: 0 })
		}
	})

	$effect(() => {
		let margin_top = SCROLL_MARGIN_LINES * LINE_HEIGHT
		let margin_left = 3 * CHAR_WIDTH

		if (selected_location !== undefined && body !== undefined) {
			body.scrollTo({
				// oxfmt-ignore
				top: (selected_location.line * LINE_HEIGHT) - margin_top
			})
			pre_node?.scrollTo({
				// oxfmt-ignore
				left: selected_location.column < 50 ? 0 : (selected_location.column * CHAR_WIDTH) - margin_left
			})
		}
	})

	$effect(() => {
		if (css.length > 0 && code_node?.firstChild && supports_highlights && lines !== undefined) {
			let node = code_node.firstChild
			lines.clear()

			// Browsers have a bug where a contained range (one entirely inside another) in the same
			// Highlight causes painting to stop at the inner range's end rather than continuing to
			// the outer range's end. Merge overlapping ranges into their union as a workaround.
			const sorted = [...locations].sort((a, b) => a.offset - b.offset)
			const merged: { start: number; end: number }[] = []
			for (const loc of sorted) {
				const end = loc.offset + loc.length
				const last = merged.at(-1)
				if (!last || loc.offset > last.end) {
					merged.push({ start: loc.offset, end })
				} else {
					last.end = Math.max(last.end, end)
				}
			}

			// Subtract the selected_location span so its Highlight background doesn't mix with ours.
			const sel = selected_location
			const punched: { start: number; end: number }[] = []
			for (const { start, end } of merged) {
				if (!sel || sel.offset >= end || sel.offset + sel.length <= start) {
					punched.push({ start, end })
				} else {
					if (start < sel.offset) {
						punched.push({ start, end: sel.offset })
					}
					if (end > sel.offset + sel.length) {
						punched.push({ start: sel.offset + sel.length, end })
					}
				}
			}

			for (const { start, end } of punched) {
				lines.add(new StaticRange({ startContainer: node, startOffset: start, endContainer: node, endOffset: end }))
			}
			window.CSS.highlights.set('lines', lines)
		}
	})

	// separate effect so changing locations doesn't unnecessarily touch selected_line
	// tracks reactive code_node so this re-runs after {#key css} DOM rebuild
	$effect(() => {
		if (code_node?.firstChild && supports_highlights && selected_line !== undefined) {
			let node = code_node.firstChild
			selected_line.clear()
			if (selected_location !== undefined) {
				selected_line.add(
					new StaticRange({
						startContainer: node,
						startOffset: selected_location.offset,
						endContainer: node,
						endOffset: selected_location.offset + selected_location.length
					})
				)
			}
			window.CSS.highlights.set('selected_line', selected_line)
		}
	})

	function scroll_to_line(line: number) {
		body?.scrollTo({
			top: (line - SCROLL_MARGIN_LINES) * LINE_HEIGHT
		})
	}

	function jump_to_next_uncovered() {
		if (!coverage_chunks) return
		if (!body) return

		let current_scroll_offset = body?.scrollTop || 0

		let next_uncovered_chunk = coverage_chunks.find((chunk) => {
			if (chunk.is_covered) return false
			let chunk_top = chunk.start_line * LINE_HEIGHT
			return chunk_top > current_scroll_offset + SCROLL_MARGIN_LINES * LINE_HEIGHT
		})
		let next_chunk = next_uncovered_chunk
		let first_uncovered_chunk = coverage_chunks.find((chunk) => !chunk.is_covered)
		// subpixel rounding means scrollHeight - clientHeight may not be an integer
		let is_scrolled_to_bottom = body.scrollTop >= body.scrollHeight - body.clientHeight - 1

		if (!next_uncovered_chunk || is_scrolled_to_bottom) {
			next_chunk = first_uncovered_chunk
		}

		if (next_chunk) {
			scroll_to_line(next_chunk.start_line)
		}
	}

	function jump_to_previous_uncovered() {
		if (!coverage_chunks) return
		if (!body) return

		let current_scroll_offset = body?.scrollTop || 0

		let previous_uncovered_chunk = coverage_chunks.findLast((chunk) => {
			if (chunk.is_covered) return false
			let chunk_top = chunk.start_line * LINE_HEIGHT
			return chunk_top < current_scroll_offset
		})
		let last_uncovered_chunk = coverage_chunks.findLast((chunk) => !chunk.is_covered)
		let next_chunk = previous_uncovered_chunk
		let is_scrolled_to_top = body.scrollTop === 0

		if (!previous_uncovered_chunk || is_scrolled_to_top) {
			next_chunk = last_uncovered_chunk
		}

		if (next_chunk) {
			scroll_to_line(next_chunk.start_line)
		}
	}
</script>

<div class="window">
	{#if show_coverage}
		{#if uncovered_blocks_count > 0}
			<div class="toolbar">
				<p>
					{uncovered_blocks_count}
					{uncovered_blocks_count === 1 ? 'block' : 'blocks'}
				</p>
				<button type="button" onclick={jump_to_previous_uncovered} title="Go to the previous block">
					<span class="sr-only">Go to the previous block</span>
					<Icon name="chevron-up" size={12} />
				</button>
				<button type="button" onclick={jump_to_next_uncovered} title="Go to the next block">
					<span class="sr-only">Go to the next block</span>
					<Icon name="chevron-down" size={12} />
				</button>
			</div>
		{/if}
	{/if}
	<div
		bind:this={body}
		class="body scroll-container"
		class:with-line-numbers={show_line_numbers}
		class:with-coverage={show_coverage}
		style:--pre-line-height="{LINE_HEIGHT}px"
		style:--pre-line-number-width={line_number_width}
		style:height="calc({total_lines + 1} * var(--pre-line-height))"
	>
		{#if show_line_numbers}
			<div class="line-numbers" aria-hidden="true">
				{#if show_coverage === true}
					{#each coverage_chunks ?? [] as chunk, i (chunk.start_line)}
						<div class={['line-number-range', { uncovered: !chunk.is_covered }]}>
							{coverage_line_numbers[i]}
						</div>
					{/each}
				{:else}
					{plain_line_numbers}
				{/if}
			</div>
		{/if}
		<pre
			bind:this={pre_node}
			dir="ltr"
			translate="no"
			class:wrap
			style:height="calc({total_lines + 1} * var(--pre-line-height))"><code
				class="language-css"
				bind:this={code_node}
				use:highlight_css={{ css }}
				data-testid="pre-css">{css}</code
			></pre>
	</div>
</div>

<style>
	.window {
		display: flex;
		flex-direction: column;
		height: 100%; /* Needed to force scrollbar on .wrapper contents */
	}

	.toolbar {
		background-color: var(--bg-200);
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-2);
		padding-inline: var(--space-2);
		padding-block: var(--space-2);
		border-block-end: 1px solid var(--bg-300);

		p {
			margin-inline-end: auto;
			font-size: var(--size-sm);
		}

		button {
			padding-inline: var(--space-2);
			padding-block: var(--space-1);
			background-color: transparent;

			&:hover,
			&:focus {
				background-color: var(--bg-400);
			}
		}
	}

	.body {
		flex-shrink: 1;
		flex-grow: 1;
		flex-basis: auto;
		position: relative;
		display: grid;
		grid-template-columns: auto;
		gap: var(--space-1);
		overflow-y: auto;
		max-height: 100%;
		--pre-ch-width: calc(1ch * var(--pre-line-number-width, 4));
		contain: strict;
		overscroll-behavior: contain;

		@media (prefers-reduced-motion: no-preference) {
			scroll-behavior: smooth;
		}

		&.with-line-numbers {
			grid-template-columns: calc(var(--pre-ch-width) + 1ch) 1fr;
		}

		&.with-line-numbers.with-coverage {
			grid-template-columns: calc(var(--pre-ch-width) + 1.5ch) 1fr;
			gap: 0;

			.line-number-range {
				border-inline-end: 0.5ch solid transparent;
				padding-right: 0.5ch;
			}

			.uncovered {
				border-color: light-dark(var(--red-300), var(--red-400));
			}
		}

		& > * {
			padding-block: var(--space-2);
			line-height: var(--pre-line-height, 20px);
			font-family: var(--font-mono);
			font-size: var(--size-specimen);
			min-height: 100%; /* Push horizontal scrollbar to the bottom of container */
		}
	}

	.line-numbers {
		color: var(--fg-400);
		text-align: end;
		user-select: none;
		pointer-events: none;
		/* force newlines when not using thousands of <li>'s but plaintext instead */
		white-space: pre;
	}

	.line-number-range {
		border-inline-end: 0.3em solid transparent;
	}

	pre {
		padding-inline: var(--space-2);
		overflow-inline: auto;
		overflow-block: hidden;
		max-height: 100%;
		height: 100%;
		color: var(--fg-200);
		scrollbar-width: thin;

		/* Regular outline not visible because of scroll containers */
		&:focus-visible {
			box-shadow: inset 0 0 0 2px var(--accent);
		}

		&.wrap {
			white-space: pre-wrap;
			hyphens: none;
			overflow-x: clip;
		}
	}

	.language-css {
		contain: strict;
	}

	::highlight(lines) {
		background-color: var(--highlight-code);
	}

	::highlight(selected_line) {
		background-color: var(--highlight-code-selected);
	}
</style>
