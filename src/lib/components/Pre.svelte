<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import type { CssLocation } from '$lib/css-location'
	import { highlight_css } from './use-css-highlight'
	import Icon from '$components/Icon.svelte'
	import { last } from '@melt-ui/svelte/internal/helpers'

	type BaseProps = {
		css?: string
		selected_location?: CssLocation
		locations?: CssLocation[]
		line_coverage?: number[] | Uint8Array
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
		line_coverage = []
	}: Props = $props()

	// Keep track of whether the browser supports the Highlight API
	let supports_highlights = $state(false)
	let lines: Highlight | undefined
	// body element is used to scroll to the highlighted location
	// svelte-ignore non_reactive_update
	let body: HTMLElement | undefined
	// code_node is used to highlight the code (highlighting only works on TextNodes)
	// svelte-ignore non_reactive_update
	let code_node: HTMLElement | undefined
	// Line height is used to scroll to the highlighted location
	const LINE_HEIGHT = 20
	// CHAR_WIDTH is used to scroll to the highlighted location
	const CHAR_WIDTH = 7.9 // measured by the width of 100 monospace `a` characters

	let total_lines = $derived(css.split('\n').length)
	let line_number_width = $derived(total_lines.toString().length)
	let show_line_numbers = $derived(line_coverage || (line_numbers && total_lines > 1 && total_lines < 10_000))
	let show_coverage = $derived(line_coverage.length > 0)

	onMount(function () {
		supports_highlights = 'highlights' in window.CSS
		if (supports_highlights) {
			lines = window.CSS.highlights.get('lines') || new Highlight()
		}
	})

	onDestroy(function () {
		if (supports_highlights) {
			window.CSS.highlights.get('lines')?.clear()
			window.CSS.highlights.delete('lines')
		}
	})

	$effect(() => {
		// Scroll <pre> back to top when the CSS changes
		if (css && css.length > 0 && body !== undefined) {
			body.scrollTo({
				top: 0,
				left: 0
			})
		}
	})

	$effect(() => {
		// scroll to highlighted location
		let margin_top = 3 * LINE_HEIGHT
		let margin_left = 3 * CHAR_WIDTH

		if (selected_location !== undefined && body !== undefined) {
			body.scrollTo({
				// prettier-ignore
				top: (selected_location.line * LINE_HEIGHT) - margin_top,
				// Scroll right if CSS is minified (longer than 32 characters per line is usually an indicator of minification)
				// prettier-ignore
				left: selected_location.column < 50 ? 0 : (selected_location.column * CHAR_WIDTH) - margin_left
			})
		}

		// Highlight the selected location
		if (
			css.length > 0 &&
			code_node !== undefined &&
			code_node.firstChild &&
			supports_highlights &&
			lines !== undefined &&
			selected_location !== undefined
		) {
			// Ranges only work on TextNodes
			let node = code_node.firstChild

			// Clear previous highlights
			lines.clear()

			// Highlight the location
			let range = new StaticRange({
				startContainer: node,
				startOffset: selected_location.offset,
				endContainer: node,
				endOffset: selected_location.offset + selected_location.length
			})
			lines.add(range)

			window.CSS.highlights.set('lines', lines)
		}
	})

	// Split coverage line numbers into chunks so we can easily loop over them in our layout
	let line_number_chunks = $derived.by(() => {
		if (!show_coverage) return

		let chunks = [
			{
				start_line: 0,
				is_covered: line_coverage[0] === 1,
				end_line: 0,
				size: 0
			}
		]

		for (let index = 0; index < line_coverage.length; index++) {
			let is_covered = line_coverage[index]
			if (index > 0 && is_covered !== line_coverage[index - 1]) {
				let last_chunk = chunks.at(-1)!
				last_chunk.end_line = index
				last_chunk.size = index - last_chunk.start_line

				chunks.push({
					start_line: index,
					is_covered: is_covered === 1,
					end_line: index,
					size: 0
				})
			}
		}

		let last_chunk = chunks.at(-1)!
		last_chunk.size = line_coverage.length - last_chunk.start_line

		return chunks
	})

	function scroll_to_line(line: number) {
		body?.scrollTo({
			top: line * LINE_HEIGHT,
			behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
		})
	}

	function jump_to_next_uncovered() {
		if (!line_number_chunks) return
		if (!body) return

		let current_scroll_offset = body?.scrollTop || 0

		let next_uncovered_chunk = line_number_chunks.find((chunk) => {
			if (chunk.is_covered) return false
			let chunk_top = chunk.start_line * LINE_HEIGHT
			return chunk_top > current_scroll_offset
		})!
		let next_chunk = next_uncovered_chunk
		let first_uncovered_chunk = line_number_chunks.find((chunk) => !chunk.is_covered)!
		let is_scrolled_to_bottom = body.scrollTop === body.scrollHeight - body.clientHeight

		if (!next_uncovered_chunk || is_scrolled_to_bottom) {
			// If there are no more uncovered chunks below the current scroll position,
			// jump to the first uncovered chunk
			next_chunk = first_uncovered_chunk
		}

		scroll_to_line(next_chunk.start_line)
	}

	function jump_to_previous_uncovered() {
		if (!line_number_chunks) return
		if (!body) return

		let current_scroll_offset = body?.scrollTop || 0

		let previous_uncovered_chunk = line_number_chunks.findLast((chunk) => {
			if (chunk.is_covered) return false
			let chunk_top = chunk.start_line * LINE_HEIGHT
			return chunk_top < current_scroll_offset
		})!
		let last_uncovered_chunk = line_number_chunks.findLast((chunk) => !chunk.is_covered)!
		let next_chunk = previous_uncovered_chunk
		let is_scrolled_to_top = body.scrollTop === 0

		if (!previous_uncovered_chunk || is_scrolled_to_top) {
			// If there are no more uncovered chunks above the current scroll position,
			// jump to the last uncovered chunk
			next_chunk = last_uncovered_chunk
		}

		scroll_to_line(next_chunk.start_line)
	}
</script>

<!-- TODO: get rid of #key (only needed because of buggy use:highlight_css)
 but also throwing away this node and recreating it each time is *way* faster -->
{#key css}
	<div class="window">
		{#if show_coverage && line_number_chunks && line_number_chunks.length > 1}
			{@const uncovered_blocks_count = line_number_chunks.filter((c) => !c.is_covered).length}
			<div class="toolbar">
				<p>
					{uncovered_blocks_count} un-covered {uncovered_blocks_count === 1 ? 'block' : 'blocks'}
				</p>
				<button type="button" onclick={jump_to_previous_uncovered} title="Go to the previous un-covered block">
					<span class="sr-only">Go to the previous un-covered block</span>
					<Icon name="chevron-up" size={12} />
				</button>
				<button type="button" onclick={jump_to_next_uncovered} title="Go to the next un-covered block">
					<span class="sr-only">Go to the next un-covered block</span>
					<Icon name="chevron-down" size={12} />
				</button>
			</div>
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
					{#if show_coverage === true && line_number_chunks && line_number_chunks.length > 0}
						{#each line_number_chunks as chunk (chunk.start_line)}
							<div class={['line-number-range', { uncovered: !chunk.is_covered }]}>
								{Array.from({ length: chunk.size }, (_, i) => i + 1 + chunk.start_line)
									.join('\n')
									.trim()}
							</div>
						{/each}
					{:else}
						{Array.from({ length: total_lines }, (_, i) => i + 1)
							.join('\n')
							.trim()}
					{/if}
				</div>
			{/if}
			<pre dir="ltr" translate="no" class:wrap style:height="calc({total_lines + 1} * var(--pre-line-height))"><code
					class="language-css"
					bind:this={code_node}
					use:highlight_css={{ css }}
					data-testid="pre-css">{css}</code
				></pre>
		</div>
	</div>
{/key}

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

	/* We set --pre-line-height on the actual element */
	/* stylelint-disable csstools/value-no-unknown-custom-properties */
	.body {
		flex: 1 1 auto;
		position: relative;
		display: grid;
		grid-template-columns: auto;
		gap: var(--space-1);
		overflow-y: auto;
		max-height: 100%;
		--pre-ch-width: calc(1ch * var(--pre-line-number-width, 4));
		contain: strict;
		overscroll-behavior: contain;

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
			line-height: var(--pre-line-height);
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
		border-right: 0.3em solid transparent;
	}

	pre {
		padding-inline: var(--space-2);
		overflow: auto hidden;
		max-height: 100%;
		height: 100%;
		scroll-margin: var(--space-4);
		color: var(--fg-200);

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
		background-color: var(--highlight-bg, light-dark(var(--bg-200), var(--bg-400)));
	}
</style>
