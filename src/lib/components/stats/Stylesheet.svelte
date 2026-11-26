<script lang="ts">
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import { with_locations } from '#lib/analysis-locations.ts'
	import { summarize, summarize_numbers } from '@projectwallace/css-analyzer'
	import { format_number } from '#lib/format-number.ts'
	import { format_filesize } from '#lib/format-filesize.ts'
	import BarChart from '#lib/components/stats/BarChart.svelte'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import Heading from '#lib/components/Heading.svelte'
	import DefinitionList from './DefinitionList.svelte'
	import Empty from '../Empty.svelte'
	import { StatsList, Item } from '#lib/components/stats-list/index.ts'

	let { result = Object.create(null) }: { result: CssAnalysis } = $props()

	let { stylesheet, rules, atrules, selectors, declarations, properties, value_complexity } = $derived(result)
	let { comments, embedded, size, source_lines_of_code, complexity } = $derived(stylesheet)
	let embedded_locations = $derived(with_locations(embedded))
	let complexity_sums = $derived({
		atrules: summarize_numbers(atrules.complexity).sum,
		selectors: summarize_numbers(selectors.complexity).sum,
		declarations: summarize_numbers(declarations.complexity).sum,
		properties: summarize_numbers(properties.complexity).sum,
		values: summarize_numbers(value_complexity).sum
	})
</script>

<div id="stylesheet">
	<Heading element="h2">Stylesheet</Heading>

	<div class="report-section">
		<div class="report-section-full-width">
			<Panel>
				<dl class="stylesheet-report-stats">
					<div>
						<dt>Lines of Code</dt>
						<dd>{format_number(source_lines_of_code)}</dd>
					</div>
					<div>
						<dt>Filesize</dt>
						<dd>{format_filesize(size)}</dd>
					</div>
					<div>
						<dt>Rules</dt>
						<dd>{format_number(rules.total)}</dd>
					</div>
					<div>
						<dt>Selectors</dt>
						<dd>{format_number(selectors.total)}</dd>
					</div>
					<div>
						<dt>Declarations</dt>
						<dd>{format_number(declarations.total)}</dd>
					</div>
				</dl>
			</Panel>
		</div>

		<Panel id="stylesheet-composition">
			<Header>
				<Heading element="h3">Composition</Heading>
				<DefinitionList stats={[{ name: 'Types', value: 6 }]} />
			</Header>
			<BarChart
				enable_keyboard_navigation={false}
				context="stylesheet-composition"
				class="mt-4"
				items={[
					{ value: 'AtRules', count: atrules.total },
					{ value: 'Rules', count: rules.total },
					{ value: 'Selectors', count: selectors.total },
					{ value: 'Declarations', count: declarations.total },
					{ value: 'Properties', count: properties.total },
					{ value: 'Values', count: declarations.total }
				]}
				column_headers={['Type', 'Total']}
				node_type="value"
			/>
		</Panel>

		<Panel id="stylesheet-complexity">
			<Header>
				<Heading element="h3">Complexity</Heading>
				<DefinitionList stats={[{ name: 'Total', value: complexity }]} />
			</Header>
			<BarChart
				enable_keyboard_navigation={false}
				context="stylesheet-complexity"
				class="mt-4"
				items={[
					{ value: 'AtRules', count: complexity_sums.atrules },
					{ value: 'Rules', count: rules.total },
					{ value: 'Selectors', count: complexity_sums.selectors },
					{ value: 'Declarations', count: complexity_sums.declarations },
					{ value: 'Properties', count: complexity_sums.properties },
					{ value: 'Values', count: complexity_sums.values }
				]}
				column_headers={['Type', 'Complexity']}
				node_type="value"
			/>
		</Panel>

		<Panel id="stylesheet-embedded-content">
			<Header>
				<Heading element="h3">Embed types</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: embedded.total },
						{
							name: 'Unique',
							value: embedded.total_unique,
							ratio: summarize(embedded).uniqueness_ratio
						}
					]}
				/>
			</Header>
			{#if embedded.total > 0}
				<BarChart
					context="embedded-content-size"
					class="mt-4"
					items={[...embedded.unique].map(([embed_type, item]) => ({
						value: embed_type,
						count: item.count,
						locations: embedded_locations[embed_type]
					}))}
					column_headers={['Embed type', 'Count']}
					node_type="value"
				/>
			{:else}
				<Empty>No embedded content</Empty>
			{/if}
		</Panel>

		{#if embedded.total > 0}
			<Panel>
				<Header>
					<Heading element="h3">Embed size</Heading>
					<DefinitionList
						stats={[
							{
								name: 'Total',
								value: format_filesize(embedded.size),
								ratio: size === 0 ? 0 : embedded.size / size
							}
						]}
					/>
				</Header>
			</Panel>
		{/if}

		<Panel id="stylesheet-comments">
			<Header>
				<Heading element="h3">Comments</Heading>
			</Header>
			{#if comments.size > 0}
				<StatsList>
					<Item key="Total" value={comments.total} />
					<Item
						key="Size"
						value={format_filesize(comments.size)}
						secondary_value="{format_number(comments.size === 0 ? 0 : (comments.size / size) * 100)}%"
					/>
				</StatsList>
			{:else}
				<Empty>No comments</Empty>
			{/if}
		</Panel>
	</div>
</div>

<style>
	.stylesheet-report-stats {
		column-gap: var(--space-8);
		row-gap: var(--space-4);
		display: flex;
		flex-direction: column;
		flex-wrap: nowrap;

		@media print, (min-width: 33rem) {
			flex-direction: row;
			flex-wrap: wrap;
			row-gap: var(--space-6);
		}

		@media (min-width: 66rem) {
			justify-content: space-between;
		}
	}

	dt {
		text-transform: uppercase;
		color: var(--fg-300);
		font-weight: var(--font-bold);
		font-size: var(--size-sm);
	}

	dd {
		font-size: var(--size-5xl);
		line-height: var(--leading-none);
		font-weight: var(--font-ultrabold);
		color: var(--fg-0);
		font-variant-numeric: tabular-nums;

		@media print {
			font-size: var(--size-3xl);
		}
	}
</style>
