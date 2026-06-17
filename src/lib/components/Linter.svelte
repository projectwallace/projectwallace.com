<script lang="ts">
	import CopyButton from '$components/CopyButton.svelte'
	import Empty from './Empty.svelte'
	import Table from './Table.svelte'
	import Pre from './Pre.svelte'
	import { create_keyboard_list, type OnChange } from './use-keyboard-list.svelte'
	import type { Warning } from 'stylelint'
	import Button from './Button.svelte'
	import { page } from '$app/state'
	import { goto } from '$app/navigation'
	import { format_number } from '$lib/format-number'

	let {
		elements: { root, item }
	} = create_keyboard_list({
		scroll_selected_item_into_view: false
	})

	type Preset = 'recommended' | 'correctness' | 'performance' | 'maintainability'

	type LintResult = {
		result: {
			errored: boolean
			parse_error: Warning | null
			warnings: Warning[]
		}
		duration: number
		css?: string
		rules?: Record<string, unknown>
	}

	type Props = {
		css?: string
		url?: string
		prettify?: boolean
		onloading?: (loading: boolean) => void
	}

	let { css = '', url = undefined, prettify = true, onloading = undefined }: Props = $props()

	const PRESETS: Preset[] = ['recommended', 'correctness', 'performance', 'maintainability']
	const preset_param = page.url.searchParams.get('preset') as Preset | null
	let preset = $state<Preset>(preset_param && PRESETS.includes(preset_param) ? preset_param : PRESETS.at(0)!)
	let lint_result = $state<LintResult | null>(null)
	let api_css = $state<string | null>(null)
	let display_css = $derived(url && api_css ? api_css : css)
	let loading = $state(false)
	let active_item = $state<number | undefined>()

	// One O(n) scan per CSS change; all warning→offset lookups are then O(1)
	let line_offsets = $derived.by(() => {
		const offsets = [0]
		let idx = 0
		while ((idx = display_css.indexOf('\n', idx)) !== -1) {
			offsets.push(++idx)
		}
		return offsets
	})

	let css_line_count = $derived(line_offsets.length)

	let locations = $derived(
		lint_result?.result.warnings
			.filter((warning) => {
				// Guard against stale warnings whose line numbers exceed the current CSS —
				// css prop updates synchronously but lint_result clears in a later effect tick
				if (warning.line > css_line_count) {
					return false
				}
				if (warning.column === 1 && warning.line === 1 && typeof warning.endLine === 'number' && warning.endLine > 1) {
					return false
				}
				return true
			})
			.map((warning) => warning_to_css_location(warning)) ?? []
	)

	let coverage_chunks = $derived(
		lint_result?.result.warnings?.length
			? warnings_to_coverage_chunks(lint_result.result.warnings.filter((w) => w.line <= css_line_count))
			: undefined
	)

	let selected_location = $derived(
		active_item === undefined || !lint_result?.result.warnings.at(active_item)
			? undefined
			: warning_to_css_location(lint_result.result.warnings.at(active_item)!)
	)

	async function run_lint() {
		lint_result = null
		loading = true
		onloading?.(true)
		const body = url ? { url, preset, prettify } : { css, preset }
		const response = await fetch('/api/lint-css', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify(body)
		})
		if (response.ok) {
			lint_result = await response.json()
			if (lint_result?.css) {
				api_css = lint_result.css
			}
		}
		loading = false
		onloading?.(false)
	}

	$effect(() => {
		if (url || css.length > 0) {
			run_lint()
			active_item = undefined
		}
	})

	function warnings_to_coverage_chunks(warnings: Warning[]) {
		const total_lines = css_line_count
		const warning_lines = new Set<number>()

		for (const warning of warnings) {
			if (warning.column === 1 && warning.line === 1 && typeof warning.endLine === 'number' && warning.endLine > 1) {
				continue
			}
			const end = typeof warning.endLine === 'number' ? warning.endLine : warning.line
			for (let line = warning.line; line <= end; line++) {
				warning_lines.add(line)
			}
		}

		const chunks: { start_line: number; end_line: number; is_covered: boolean; total_lines: number }[] = []
		if (total_lines === 0) return chunks

		let chunk_start = 1
		let current_covered = !warning_lines.has(1)

		for (let line = 2; line <= total_lines; line++) {
			const is_covered = !warning_lines.has(line)
			if (is_covered !== current_covered) {
				chunks.push({
					start_line: chunk_start,
					end_line: line - 1,
					is_covered: current_covered,
					total_lines: line - chunk_start
				})
				chunk_start = line
				current_covered = is_covered
			}
		}
		chunks.push({
			start_line: chunk_start,
			end_line: total_lines,
			is_covered: current_covered,
			total_lines: total_lines - chunk_start + 1
		})

		return chunks
	}

	function warning_to_css_location(warning: Warning) {
		const start = line_offsets[warning.line - 1] + warning.column - 1
		let length = 1
		if (typeof warning.endLine === 'number' && typeof warning.endColumn === 'number') {
			length = line_offsets[warning.endLine - 1] + warning.endColumn - 1 - start
		}
		return { line: warning.line, column: warning.column, offset: start, length }
	}

	const on_change: OnChange = ({ active_index }) => {
		active_item = active_index
	}

	function on_preset_change() {
		const u = page.url
		u.searchParams.set('preset', preset)
		goto(u, { replaceState: true })
		run_lint()
		active_item = undefined
	}
</script>

<div class="ast-explorer">
	<div class="panes">
		<div class="pane options">
			<div class="pane-header">
				<div class="pane-title">Options</div>
			</div>
			<div class="pane-content">
				<fieldset onchange={on_preset_change}>
					<legend>Preset</legend>
					<div class="radio-field">
						<input type="radio" id="preset-recommended" name="preset" value="recommended" bind:group={preset} />
						<label for="preset-recommended">Recommended</label>
					</div>
					<div>
						<input type="radio" id="preset-correctness" name="preset" value="correctness" bind:group={preset} />
						<label for="preset-correctness">Correctness</label>
					</div>
					<div>
						<input type="radio" id="preset-performance" name="preset" value="performance" bind:group={preset} />
						<label for="preset-performance">Performance</label>
					</div>
					<div>
						<input type="radio" id="preset-maintainability" name="preset" value="maintainability" bind:group={preset} />
						<label for="preset-maintainability">Maintainability</label>
					</div>
				</fieldset>
			</div>
		</div>
		{#key lint_result}
			<div class="pane">
				<div class="pane-header">
					<div class="pane-title">CSS input</div>
					<Button
						element="a"
						variant="secondary"
						size="sm"
						icon="file"
						href={`data:text/css;charset=utf-8,${encodeURIComponent(display_css)}`}
						download="projectwallace-stylelint-css.css"
					>
						Download CSS
					</Button>
					<CopyButton variant="secondary" text={() => display_css}>Copy CSS</CopyButton>
				</div>
				<div class="pane-content">
					<Pre css={display_css} {selected_location} {locations} {coverage_chunks} line_numbers />
				</div>
			</div>
			<div class="pane">
				<div class="pane-header">
					<label for="ast-output" class="pane-title">Stylelint output</label>
					<Button
						element="a"
						variant="secondary"
						size="sm"
						icon="file"
						href={`data:application/json;charset=utf-8,${encodeURIComponent(JSON.stringify(lint_result?.result, null, 2))}`}
						download="projectwallace-stylelint-result.json"
					>
						Download JSON
					</Button>
					<CopyButton variant="secondary" text={() => JSON.stringify(lint_result?.result, null, 2)}>
						Copy JSON
					</CopyButton>
				</div>
				<div class="pane-content">
					<output>
						{#if loading}
							<Empty>Linting, please wait&hellip;</Empty>
						{:else if lint_result?.result.parse_error}
							<Empty
								>Could not lint CSS: {lint_result.result.parse_error.text} (line {format_number(
									lint_result.result.parse_error.line
								)})</Empty
							>
						{:else if Array.isArray(lint_result?.result.warnings)}
							{#if lint_result.result.warnings.length === 0}
								<Empty>No stylelint issues found! 🎉</Empty>
							{:else}
								<Table>
									<caption class="sr-only">Stylelint errors</caption>
									<thead>
										<tr>
											<th class="numeric">Location</th>
											<th>Message</th>
											<th>Rule</th>
										</tr>
									</thead>
									<tbody use:root={{ onchange: on_change }}>
										{#each lint_result?.result.warnings as issue, index}
											<tr use:item={{ value: index }} aria-selected={active_item === index}>
												<td class="numeric">{issue.line}:{issue.column}</td>
												<td>{issue.text.slice(0, issue.text.lastIndexOf('('))}</td>
												<td>{issue.rule}</td>
											</tr>
										{/each}
									</tbody>
								</Table>
							{/if}
						{/if}
					</output>
				</div>
			</div>
		{/key}
	</div>
</div>

<style>
	.ast-explorer {
		--wallace-pane-background-color: var(--bg-200);
		--wallace-ast-explorer-border-color: var(--bg-300);
		--wallace-ast-explorer-border-width: var(--space-px);
		--wallace-ast-explorer-pane-block-size: calc(100vb - 24rem);
		container-type: inline-size;
		container-name: --ast-explorer;
		border-width: var(--wallace-ast-explorer-border-width);
		border-color: var(--wallace-ast-explorer-border-color);
	}

	.panes {
		display: grid;
		align-items: stretch;

		@container --ast-explorer (min-width: 50rem) {
			grid-template-columns: max-content minmax(auto, 68ch) 1fr;
		}
	}

	.pane {
		background-color: light-dark(transparent, var(--wallace-pane-background-color));
		line-height: 2;
		block-size: 100%;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);

		&:not(:first-child) {
			border-inline-start-width: var(--wallace-ast-explorer-border-width);
			border-inline-start-color: var(--wallace-ast-explorer-border-color);
		}
	}

	.pane-header,
	.pane-content {
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
	}

	.pane-header {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--space-3);
		row-gap: var(--space-2);
		justify-content: space-between;
		border-block-end-width: var(--wallace-ast-explorer-border-width);
		border-color: var(--wallace-ast-explorer-border-color);

		&:not(.pane:first-child &) {
			@container --ast-explorer (max-width: 50rem) {
				border-block-start-width: var(--wallace-ast-explorer-border-width);
			}
		}
	}

	.pane-title {
		font-weight: var(--font-bold);
		margin-inline-end: auto;
	}

	.pane-content {
		overflow-x: auto;

		@container --ast-explorer (min-width: 50rem) {
			block-size: var(--wallace-ast-explorer-pane-block-size);
		}
	}

	@layer linter {
		th {
			background-color: var(--wallace-pane-background-color);
		}

		td {
			white-space: nowrap;
			font-family: var(--font-mono);
			font-size: var(--size-specimen);

			&:first-of-type {
				color: var(--fg-300);
			}
		}

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
	}
</style>
