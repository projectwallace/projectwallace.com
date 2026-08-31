<script module lang="ts">
	export type CoverageChunk = {
		start_line: number
		end_line: number
		is_covered: boolean
		total_lines: number
	}
</script>

<script lang="ts">
	import { untrack } from 'svelte'
	import type { CssLocation } from '#lib/css-location.js'
	import Icon from '#lib/components/Icon.svelte'
	import HighlightCssCode from '#lib/components/HighlightCssCode.svelte'

	type BaseProps = {
		css?: string
		selected_location?: CssLocation
		locations?: CssLocation[]
		coverage_chunks?: CoverageChunk[]
		lines_highlight_name?: string
		selected_highlight_name?: string
	}

	type WrappingProps = BaseProps & { wrap?: true; line_numbers?: false }
	type LineNumberProps = BaseProps & { wrap?: false; line_numbers: true }
	type Props = WrappingProps | LineNumberProps

	let {
		css = '',
		selected_location = undefined,
		locations = [],
		// Used in MinifyCss
		wrap = false,
		// Used in MinifyCss
		line_numbers = false,
		coverage_chunks = undefined,
		lines_highlight_name = 'lines',
		selected_highlight_name = 'selected_line'
	}: Props = $props()

	// body element is used to scroll to the highlighted location
	// svelte-ignore non_reactive_update
	let body: HTMLElement | undefined = undefined
	// pre_node is the horizontal scroll container; body only scrolls vertically
	let pre_node = $state<HTMLElement | undefined>(undefined)
	// Line height is used to scroll to the highlighted location
	const LINE_HEIGHT = 20
	const CHAR_WIDTH = 7.953580311708464 // measured by the width of tenthousands monospace characters
	// Lines of context to keep visible above the target line when scrolling.
	// scroll-margin/scroll-padding have no effect on our overflow container, so we subtract
	// this manually from every scrollTo() call and add it back when finding the "next" chunk.
	const SCROLL_MARGIN_LINES = 3

	let total_lines = $derived.by(() => {
		let count = 1
		let index = 0
		while ((index = css.indexOf('\n', index)) !== -1) {
			count++
			index++
		}
		return count
	})
	let line_number_width = $derived(total_lines.toString().length)
	// Only show when coverage data is actually present
	let has_coverage = $derived(coverage_chunks !== undefined && coverage_chunks.length > 0)

	let show_line_numbers = $derived(has_coverage || line_numbers)
	let show_coverage = $derived(has_coverage)
	let uncovered_blocks_count = $derived((coverage_chunks ?? []).reduce((n, c) => n + (c.is_covered ? 0 : 1), 0))
	let first_uncovered_chunk = $derived(coverage_chunks?.find((c) => !c.is_covered))
	let last_uncovered_chunk = $derived(coverage_chunks?.findLast((c) => !c.is_covered))
	let coverage_line_numbers = $derived(
		(coverage_chunks ?? []).map((chunk) =>
			Array.from({ length: chunk.total_lines }, (_, i) => i + chunk.start_line).join('\n')
		)
	)
	let plain_line_numbers = $derived(Array.from({ length: total_lines }, (_, i) => i + 1).join('\n'))

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
				top: selected_location.line * LINE_HEIGHT - margin_top
			})
			pre_node?.scrollTo({
				// oxfmt-ignore
				left: selected_location.column < 50
					? 0
					: selected_location.column * CHAR_WIDTH - margin_left
			})
		}
	})

	function scroll_to_line(line: number) {
		body?.scrollTo({
			top: (line - SCROLL_MARGIN_LINES) * LINE_HEIGHT
		})
	}

	function jump_to_next_uncovered() {
		if (!coverage_chunks) {
			return
		}
		if (!body) {
			return
		}

		let current_scroll_offset = body?.scrollTop || 0

		let next_uncovered_chunk = coverage_chunks.find((chunk) => {
			if (chunk.is_covered) {
				return false
			}
			let chunk_top = chunk.start_line * LINE_HEIGHT
			return chunk_top > current_scroll_offset + SCROLL_MARGIN_LINES * LINE_HEIGHT
		})
		let next_chunk = next_uncovered_chunk
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
		if (!coverage_chunks) {
			return
		}
		if (!body) {
			return
		}

		let current_scroll_offset = body?.scrollTop || 0

		let previous_uncovered_chunk = coverage_chunks.findLast((chunk) => {
			if (chunk.is_covered) {
				return false
			}

			let chunk_top = chunk.start_line * LINE_HEIGHT

			return chunk_top < current_scroll_offset
		})

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
			style:height="calc({total_lines + 1} * var(--pre-line-height))"><HighlightCssCode
				{css}
				{selected_location}
				{locations}
				{lines_highlight_name}
				{selected_highlight_name}
			/></pre>
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
			padding-block: var(--space-2);
			line-height: var(--leading-none);
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
			--pre-chunk-border-width: 0.5ch;
			grid-template-columns: calc(var(--pre-ch-width) + var(--pre-chunk-border-width)) 1fr;
			gap: 0;

			.line-number-range {
				border-inline-end: var(--pre-chunk-border-width) solid transparent;
				padding-right: var(--pre-chunk-border-width);
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
</style>
