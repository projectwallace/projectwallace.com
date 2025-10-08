<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import { format_filesize } from '$lib/format-filesize'
	import { format_number, format_percentage } from '$lib/format-number'
	import { create_keyboard_list } from '$components/use-keyboard-list.svelte'
	import Panel from '$components/Panel.svelte'
	import Meter from '$components/Meter.svelte'
	import Pre from '$components/Pre.svelte'
	import { calculate_coverage } from './calculate-coverage'
	import type { Coverage } from './types'
	import Empty from '$components/Empty.svelte'
	import Table from '$components/Table.svelte'
	import { string_sort } from '$lib/string-sort'

	let {
		browser_coverage
	}: {
		browser_coverage: Coverage[]
	} = $props()

	let {
		elements: { root, item }
	} = create_keyboard_list()
	let selected_index = $state(0)

	function parse_html(html: string) {
		let parser = new DOMParser()
		return parser.parseFromString(html, 'text/html')
	}

	let calculated = $derived(calculate_coverage(browser_coverage, parse_html))

	let max_lines = $derived.by(() => {
		let max = 0
		for (let sheet of calculated.coverage_per_stylesheet) {
			if (sheet.total_lines > max) {
				max = sheet.total_lines
			}
		}
		return max
	})

	function onchange({ active_index }: { active_index: number }) {
		selected_index = active_index
	}

	let sort_by = $state<'bytes' | 'coverage' | 'name' | 'lines' | undefined>(undefined)
	let sort_direction = $state<'asc' | 'desc'>('asc')

	let sorted_items = $derived.by(() => {
		let item_indexes = Uint8Array.from({ length: calculated.coverage_per_stylesheet.length }, (_, i) => i)
		if (sort_by === undefined) {
			return item_indexes
		}
		return item_indexes.sort((_a, _b) => {
			let a = calculated.coverage_per_stylesheet[_a]
			let b = calculated.coverage_per_stylesheet[_b]

			if (sort_by === 'bytes') {
				return sort_direction === 'asc' ? a.total_bytes - b.total_bytes : b.total_bytes - a.total_bytes
			}
			if (sort_by === 'coverage') {
				return sort_direction === 'asc'
					? a.line_coverage_ratio - b.line_coverage_ratio
					: b.line_coverage_ratio - a.line_coverage_ratio
			}
			if (sort_by === 'name') {
				return sort_direction === 'asc' ? string_sort(a.url, b.url) : string_sort(b.url, a.url)
			}
			if (sort_by === 'lines') {
				return sort_direction === 'asc' ? a.covered_lines - b.covered_lines : b.covered_lines - a.covered_lines
			}
			return 0
		})
	})

	// Reset the selected index when the coverage input or sorting changes
	$effect(() => {
		if (calculated) {
			selected_index = 0
		}
	})

	let mapped_selected_index = $derived.by(() => {
		return sorted_items[selected_index]
	})
</script>

{#snippet sorted_th(name: 'bytes' | 'coverage' | 'name' | 'lines', label: string)}
	{@const sort_by_attr = sort_by === name ? (sort_direction === 'asc' ? 'ascending' : 'descending') : undefined}
	<th scope="col" aria-sort={sort_by_attr}>
		<button
			class="sort-button"
			aria-pressed={sort_by === name}
			onclick={() => {
				sort_by = name
				sort_direction = sort_direction === 'asc' ? 'desc' : 'asc'
			}}
		>
			{label}
			<span class="sort-indicator" aria-hidden="true">
				{#if sort_by === name}
					{sort_direction === 'asc' ? '▲' : '▼'}
				{/if}
			</span>
		</button>
	</th>
{/snippet}

<header data-testid="coverage-summary">
	<Panel element="dl" aria-label="Coverage summary">
		<div class="coverage-summary">
			<div>
				<dt>Coverage</dt>
				<dd>{format_percentage(calculated.byte_coverage_ratio)}</dd>
				<dd>{format_percentage(calculated.line_coverage_ratio)} of lines</dd>
			</div>
			<div>
				<dt>Total</dt>
				<dd>{format_filesize(calculated.total_bytes)}</dd>
				<dd>{format_number(calculated.total_lines)} lines</dd>
			</div>
			<div>
				<dt>Used</dt>
				<dd>{format_filesize(calculated.used_bytes)}</dd>
				<dd>{format_number(calculated.covered_lines)} lines</dd>
			</div>
			<div>
				<dt>Unused</dt>
				<dd>{format_filesize(calculated.unused_bytes)}</dd>
				<dd>{format_number(calculated.uncovered_lines)} lines</dd>
			</div>
		</div>
	</Panel>
</header>

<h2 class="sr-only">Coverage per stylesheet</h2>
<div class="devtools" data-empty={calculated.coverage_per_stylesheet.length === 0 ? 'true' : 'false'}>
	{#if calculated.coverage_per_stylesheet.length > 0}
		<PaneGroup direction="horizontal" autoSaveId="css-coverage">
			<Pane defaultSize={50} minSize={20}>
				<Table>
					<caption class="sr-only">Coverage per origin</caption>
					<thead>
						<tr>
							{@render sorted_th('name', 'URL')}
							{@render sorted_th('bytes', 'Total size')}
							{@render sorted_th('lines', 'Lines')}
							{@render sorted_th('coverage', 'Coverage')}
							<th scope="col">Coverage visualized</th>
						</tr>
					</thead>
					{#key browser_coverage && sort_by && sort_direction}
						<tbody use:root={{ onchange }} style:--meter-height="0.5rem">
							{#each sorted_items as item_index, index}
								{@const stylesheet = calculated.coverage_per_stylesheet[item_index]}
								{@const { url, total_bytes, total_lines, line_coverage_ratio, covered_lines } = stylesheet}
								<tr use:item={{ value: index.toString() }} aria-selected={selected_index === index ? 'true' : 'false'}>
									<td class="url">
										{url}
									</td>
									<td class="numeric">{format_filesize(total_bytes)}</td>
									<td class="numeric">{format_number(total_lines)}</td>
									<td class="numeric">{format_percentage(line_coverage_ratio)}</td>
									<td>
										<div style:width={(stylesheet.total_lines / max_lines) * 100 + '%'}>
											<Meter max={1} value={line_coverage_ratio} />
										</div>
									</td>
								</tr>
							{/each}
						</tbody>
					{/key}
				</Table>
			</Pane>
			<PaneResizer>
				<div class="pane-resizer"></div>
			</PaneResizer>
			<Pane defaultSize={50} minSize={20}>
				<div class="css-slide">
					{#if selected_index !== -1}
						{@const coverage = calculated.coverage_per_stylesheet.at(mapped_selected_index)!}
						<Pre line_numbers line_coverage={coverage.line_coverage} css={coverage.text} />
					{/if}
				</div>
			</Pane>
		</PaneGroup>
	{:else}
		<Empty>
			Analyzed {calculated.files_found}
			{calculated.files_found > 1 ? 'entries' : 'entry'} but no CSS coverage found.
		</Empty>
	{/if}
</div>

<style>
	:global {
		[data-pane-group] {
			--coverage-pane-height: calc(100vh - 24rem);
			min-height: var(--coverage-pane-height);
			max-height: var(--coverage-pane-height);
		}

		[data-pane] {
			will-change: flex;
			height: 100%;
		}

		[data-pane-resizer] {
			width: var(--space-1);
			display: flex;
			align-items: center;
			justify-content: center;

			&:is(:hover, :focus) .pane-resizer {
				opacity: 1;
			}
		}
	}

	.pane-resizer {
		height: 100%;
		width: 0.25rem;
		opacity: 0;
		background-color: var(--accent-600);
		transition: opacity 200ms;
	}

	.devtools[data-empty='false'] {
		border: 1px solid var(--fg-450);
	}

	.coverage-summary {
		display: flex;
		flex-direction: column;
		gap: var(--space-4);

		@media (min-width: 44rem) {
			flex-direction: row;
			justify-content: space-between;
		}

		& > div {
			display: grid;
			row-gap: var(--space-2);
		}
	}

	.css-slide {
		height: 100%;
		overflow: hidden;
		border-inline-start: 1px solid var(--fg-450);
	}

	dt,
	dd:last-of-type {
		text-transform: uppercase;
		color: var(--fg-300);
		font-weight: var(--font-bold);
		font-size: var(--size-sm);
	}

	dd:first-of-type {
		font-size: var(--size-4xl);
		line-height: var(--leading-none);
		font-weight: var(--font-ultrabold);
		color: var(--fg-0);
		font-variant-numeric: tabular-nums;

		@media print {
			font-size: var(--size-3xl);
		}
	}

	th {
		background-color: var(--bg-100);
	}

	tbody tr {
		cursor: pointer;
	}

	tr[aria-selected='true'] {
		background-color: var(--highlight);
	}

	tr {
		--meter-bg: repeating-linear-gradient(
			-45deg,
			var(--error-400),
			var(--error-400) 3px,
			var(--error-200) 3px,
			var(--error-200) 6px
		);
	}

	.sort-button {
		display: flex;
		width: 100%;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.sort-indicator {
		font-size: var(--size-xs);
		color: var(--fg-400);
	}

	.url {
		white-space: nowrap;
	}
</style>
