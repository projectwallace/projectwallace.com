<script lang="ts">
	import Pre from './Pre.svelte'
	import type { CoverageChunk } from './Pre.svelte'
	import type { Warning } from 'stylelint'

	type Props = {
		css: string
		warnings: Warning[]
		selected_warning?: Warning
	}

	let { css, warnings, selected_warning = undefined }: Props = $props()

	// One O(n) scan per CSS change; all warning→offset lookups are then O(1)
	let line_offsets = $derived.by(() => {
		const offsets = [0]
		let idx = 0
		while ((idx = css.indexOf('\n', idx)) !== -1) {
			offsets.push(++idx)
		}
		return offsets
	})

	let css_line_count = $derived(line_offsets.length)

	function warning_to_css_location(warning: Warning) {
		const start = line_offsets[warning.line - 1] + warning.column - 1
		let length = 1
		if (typeof warning.endLine === 'number' && typeof warning.endColumn === 'number') {
			length = line_offsets[warning.endLine - 1] + warning.endColumn - 1 - start
		}
		return { line: warning.line, column: warning.column, offset: start, length }
	}

	function is_whole_file_warning(warning: Warning) {
		return warning.column === 1 && warning.line === 1 && typeof warning.endLine === 'number' && warning.endLine > 1
	}

	let locations = $derived(
		warnings
			.filter((warning) => warning.line <= css_line_count && !is_whole_file_warning(warning))
			.map((warning) => warning_to_css_location(warning))
	)

	let coverage_chunks = $derived.by(() => {
		if (!warnings.length) {
			return undefined
		}

		const intervals = warnings.reduce<[number, number][]>((acc, warning) => {
			if (!is_whole_file_warning(warning) && warning.line <= css_line_count) {
				acc.push([warning.line, warning.endLine ?? warning.line])
			}
			return acc
		}, [])

		const chunks: CoverageChunk[] = []
		let current_position = 1

		for (let i = 0; i < intervals.length; ) {
			let [interval_start, interval_end] = intervals[i]

			while (++i < intervals.length && intervals[i][0] <= interval_end + 1) {
				interval_end = Math.max(interval_end, intervals[i][1])
			}

			interval_end = Math.min(interval_end, css_line_count)

			if (interval_start > current_position) {
				chunks.push({
					start_line: current_position,
					end_line: interval_start - 1,
					is_covered: true,
					total_lines: interval_start - current_position
				})
			}

			chunks.push({
				start_line: interval_start,
				end_line: interval_end,
				is_covered: false,
				total_lines: interval_end - interval_start + 1
			})

			current_position = interval_end + 1
		}

		if (current_position <= css_line_count) {
			chunks.push({
				start_line: current_position,
				end_line: css_line_count,
				is_covered: true,
				total_lines: css_line_count - current_position + 1
			})
		}

		return chunks
	})

	let selected_location = $derived(selected_warning ? warning_to_css_location(selected_warning) : undefined)
</script>

<Pre {css} {selected_location} {locations} {coverage_chunks} line_numbers />

<style>
	:global(::highlight(lines), ::highlight(selected_line)) {
		text-decoration-color: var(--red-300);
		text-decoration-style: wavy;
		text-decoration-line: underline;
	}

	:global(::highlight(lines)) {
		background-color: transparent !important;
	}

	:global(::highlight(selected_line)) {
		background-color: var(--highlight-code) !important;
	}
</style>
