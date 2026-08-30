<script lang="ts">
	import { onMount, onDestroy } from 'svelte'
	import { browser } from '$app/env'
	import type { CssLocation } from '#lib/css-location.js'
	import { highlight_css } from './use-css-highlight'

	type Props = {
		css?: string
		selected_location?: CssLocation
		locations?: CssLocation[]
		lines_highlight_name?: string
		selected_highlight_name?: string
	}

	let {
		css = '',
		selected_location = undefined,
		locations = [],
		lines_highlight_name = 'lines',
		selected_highlight_name = 'selected_line'
	}: Props = $props()

	// Keep track of whether the browser supports the Highlight API
	let supports_highlights = $state(false)
	let lines: Highlight | undefined
	let selected_line: Highlight | undefined
	// code_node is used to highlight the code (highlighting only works on TextNodes)
	let code_node = $state<HTMLElement | undefined>(undefined)

	// CSS.highlights is a single global registry keyed by name, so multiple mounted instances
	// using the same (default) name share one Highlight object. Track only the ranges *this*
	// instance added and remove exactly those on update/destroy, instead of clearing the whole
	// shared object — otherwise simultaneously-mounted instances clobber each other's ranges.
	let own_lines_ranges = new Set<StaticRange>()
	let own_selected_ranges = new Set<StaticRange>()

	onMount(function () {
		supports_highlights = browser && 'highlights' in window.CSS
		if (supports_highlights) {
			lines = window.CSS.highlights.get(lines_highlight_name) || new Highlight()
			selected_line = window.CSS.highlights.get(selected_highlight_name) || new Highlight()
		}
	})

	onDestroy(function () {
		if (supports_highlights) {
			for (const range of own_lines_ranges) {
				lines?.delete(range)
			}
			for (const range of own_selected_ranges) {
				selected_line?.delete(range)
			}
		}
	})

	// Only the locations-derived merge is expensive (sort + merge over the full list); cache it
	// so selecting/deselecting a location doesn't re-sort ranges that haven't changed.
	//
	// Browsers have a bug where a contained range (one entirely inside another) in the same
	// Highlight causes painting to stop at the inner range's end rather than continuing to
	// the outer range's end. Merge overlapping ranges into their union as a workaround.
	let merged_ranges = $derived.by(() => {
		const sorted = locations.toSorted((a, b) => a.offset - b.offset)
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
		return merged
	})

	$effect(() => {
		if (code_node?.firstChild && supports_highlights && lines !== undefined) {
			let node = code_node.firstChild

			for (const range of own_lines_ranges) {
				lines.delete(range)
			}
			own_lines_ranges.clear()

			if (css.length > 0) {
				// Subtract the selected_location span so its Highlight background doesn't mix with ours.
				const sel = selected_location
				const punched: { start: number; end: number }[] = []
				for (const { start, end } of merged_ranges) {
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
					let range = new StaticRange({
						startContainer: node,
						startOffset: start,
						endContainer: node,
						endOffset: end
					})
					lines.add(range)
					own_lines_ranges.add(range)
				}
			}
			window.CSS.highlights.set(lines_highlight_name, lines)
		}
	})

	// separate effect so changing locations doesn't unnecessarily touch selected_line
	// reading css.length establishes tracking so the effect re-runs when content changes in-place
	$effect(() => {
		if (code_node?.firstChild && supports_highlights && selected_line !== undefined) {
			let node = code_node.firstChild

			for (const range of own_selected_ranges) {
				selected_line.delete(range)
			}
			own_selected_ranges.clear()

			if (css.length > 0 && selected_location !== undefined) {
				let range = new StaticRange({
					startContainer: node,
					startOffset: selected_location.offset,
					endContainer: node,
					endOffset: selected_location.offset + selected_location.length
				})
				selected_line.add(range)
				own_selected_ranges.add(range)
			}
			window.CSS.highlights.set(selected_highlight_name, selected_line)
		}
	})
</script>

<code class="language-css" bind:this={code_node} use:highlight_css={{ css }} data-testid="pre-css">{css}</code>

<style>
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
