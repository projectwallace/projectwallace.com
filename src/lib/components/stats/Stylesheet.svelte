<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'
	import { format_number } from '$lib/format-number'
	import { format_filesize } from '$lib/format-filesize'
	import BarChart from '$lib/components/stats/BarChart.svelte'
	import { Panel, Header } from '$lib/components/Panel/index'
	import Heading from '$lib/components/Heading.svelte'
	import DefinitionList from './DefinitionList.svelte'
	import Empty from '../Empty.svelte'
	import { StatsList, Item } from '$lib/components/stats-list/index'

	let { result = Object.create(null) }: { result: CssAnalysis } = $props()

	let { stylesheet, rules, atrules, selectors, declarations, properties, values } = $derived(result)
	let { comments, embeddedContent, size, sourceLinesOfCode, complexity } = $derived(stylesheet)
</script>

<div id="stylesheet">
	<Heading element="h2">Stylesheet</Heading>

	<div class="report-section">
		<div class="report-section-full-width">
			<Panel element="dl">
				<div class="stylesheet-report-stats">
					<div>
						<dt>Lines of Code</dt>
						<dd>{format_number(sourceLinesOfCode)}</dd>
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
				</div>
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
					{ value: 'AtRules', count: atrules.complexity.sum },
					{ value: 'Rules', count: rules.total },
					{ value: 'Selectors', count: selectors.complexity.sum },
					{ value: 'Declarations', count: declarations.complexity.sum },
					{ value: 'Properties', count: properties.complexity.sum },
					{ value: 'Values', count: values.complexity.sum }
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
						{ name: 'Total', value: embeddedContent.types.total },
						{
							name: 'Unique',
							value: embeddedContent.types.totalUnique,
							ratio: embeddedContent.types.uniquenessRatio
						}
					]}
				/>
			</Header>
			{#if embeddedContent.types.total > 0}
				<BarChart
					context="embedded-content-size"
					class="mt-4"
					items={Object.entries(embeddedContent.types.unique).map(([embedType, item]) => ({
						value: embedType,
						count: item.count,
						locations: item.uniqueWithLocations
					}))}
					column_headers={['Embed type', 'Count']}
					node_type="value"
				/>
			{:else}
				<Empty>No embedded content</Empty>
			{/if}
		</Panel>

		{#if embeddedContent.types.total > 0}
			<Panel>
				<Header>
					<Heading element="h3">Embed size per type</Heading>
					<DefinitionList
						stats={[
							{
								name: 'Total',
								value: format_filesize(embeddedContent.size.total),
								ratio: embeddedContent.size.ratio
							}
						]}
					/>
				</Header>
				<BarChart
					context="embedded-content-type"
					class="mt-4"
					items={Object.entries(embeddedContent.types.unique).map(([embedType, item]) => ({
						value: embedType,
						count: item.size,
						locations: item.uniqueWithLocations
					}))}
					column_headers={['Embed type', 'Size']}
					node_type="value"
				/>
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
		gap: var(--space-4);

		@media print, (min-width: 33rem) {
			display: flex;
			flex-wrap: wrap;
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
