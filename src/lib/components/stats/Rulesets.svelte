<script lang="ts">
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import { with_locations } from '#lib/analysis-locations.ts'
	import { summarize_numbers, type CountResult } from '@projectwallace/css-analyzer'
	import { format_number } from '#lib/format-number.ts'
	import ScatterPlot from '#lib/components/stats/ScatterPlot.svelte'
	import BarChart from '#lib/components/stats/BarChart.svelte'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import Heading from '#lib/components/Heading.svelte'
	import Empty from '#lib/components/Empty.svelte'
	import FilterGroup from '#lib/components/FilterGroup.svelte'
	import FilterOption from '#lib/components/FilterOption.svelte'
	import DefinitionList from './DefinitionList.svelte'
	import type { NodeType } from '#lib/components/use-css-highlight.ts'

	type Props = Pick<CssAnalysis, 'rules' | 'atrules' | 'selectors' | 'declarations'>

	let {
		rules = Object.create(null),
		atrules = Object.create(null),
		selectors = Object.create(null),
		declarations = Object.create(null)
	}: Props = $props()

	let { selectors: rule_selectors, declarations: rule_declarations, sizes, nesting, total } = $derived(rules)

	let display: 'selectors' | 'declarations' | 'sizes' = $state('sizes')
	let nesting_display: 'atrules' | 'rules' | 'selectors' | 'declarations' = $state('rules')
</script>

{#snippet nesting_stats({
	label,
	node_type,
	nesting
}: {
	label: string
	node_type: NodeType
	nesting: CountResult<number>
})}
	{@const summary = summarize_numbers(nesting)}
	<Header>
		<Heading element="h3">{label}</Heading>
		<DefinitionList
			stats={[
				{ name: 'Unique', value: format_number(nesting.total_unique) },
				{ name: 'Average', value: format_number(summary.mean) },
				{ name: 'Max', value: format_number(summary.max) },
				{ name: 'Mode', value: format_number(summary.mode) }
			]}
		/>
	</Header>

	<figure>
		<ScatterPlot max={summary.max} items={nesting.sequence ?? []} />
		<figcaption>
			Nesting depth, showing the first {node_type} in the CSS on the left and the last item on the right.
		</figcaption>
	</figure>

	<BarChart
		context={`${node_type}-nesting`}
		class="mt-4"
		items={Object.entries(with_locations(nesting)).map(([value, locations]) => ({
			value,
			locations,
			count: locations.length
		}))}
		column_headers={['Depth', 'Count']}
		{node_type}
	/>
{/snippet}

{#snippet ruleset_stats({
	label,
	node_type,
	size_set,
	node_name
}: {
	label: string
	node_type: NodeType
	size_set: CountResult<number>
	node_name: string
})}
	{@const summary = summarize_numbers(size_set)}
	<Header>
		<Heading element="h3">{label}</Heading>
		<DefinitionList
			stats={[
				{ name: 'Unique', value: format_number(size_set.total_unique) },
				{ name: 'Average', value: format_number(summary.mean) },
				{ name: 'Max', value: format_number(summary.max) },
				{ name: 'Mode', value: format_number(summary.mode) }
			]}
		/>
	</Header>
	{#if total > 0}
		<figure>
			<ScatterPlot max={summary.max} items={size_set.sequence ?? []} />
			<figcaption>
				{label}, showing the first {node_type} in the CSS on the left and the last item on the right.
			</figcaption>
		</figure>

		<BarChart
			context={`${node_type}-per-ruleset`}
			items={Object.entries(with_locations(size_set)).map(([value, locations]) => ({
				value,
				locations,
				count: locations.length
			}))}
			column_headers={[node_name, 'Count']}
			{node_type}
		/>
	{:else}
		<Empty>No {node_type}s found.</Empty>
	{/if}
{/snippet}

<div class="report-section">
	<Panel id="rulesets">
		<Header>
			<Heading element="h2">Rulesets</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: format_number(rules.total) },
					{ name: 'Empty', value: format_number(rules.empty) }
				]}
			/>
		</Header>

		<div class="stack stack-lg">
			<FilterGroup>
				<legend class="sr-only">Show rulesets</legend>
				<FilterOption bind:group={display} name="rulesets-display" value="sizes">Ruleset sizes</FilterOption>
				<FilterOption bind:group={display} name="rulesets-display" value="selectors">Selectors per ruleset</FilterOption
				>
				<FilterOption bind:group={display} name="rulesets-display" value="declarations">
					Declarations per ruleset
				</FilterOption>
			</FilterGroup>

			{#if display === 'sizes'}
				{@render ruleset_stats({
					label: 'Sizes per ruleset',
					node_type: 'rule',
					size_set: sizes,
					node_name: 'Rule'
				})}
			{/if}

			{#if display === 'selectors'}
				{@render ruleset_stats({
					label: 'Selectors per ruleset',
					node_type: 'selectorList',
					size_set: rule_selectors,
					node_name: 'Selector'
				})}
			{/if}

			{#if display === 'declarations'}
				{@render ruleset_stats({
					label: 'Declarations per ruleset',
					node_type: 'declaration',
					size_set: rule_declarations,
					node_name: 'Declaration'
				})}
			{/if}
		</div>
	</Panel>

	{#if summarize_numbers(nesting).max > 0}
		<Panel id="nesting">
			<Header>
				<Heading element="h3">Nesting</Heading>
			</Header>

			<div class="stack stack-lg">
				<FilterGroup>
					<legend class="sr-only">Show nesting</legend>
					<FilterOption bind:group={nesting_display} name="nesting-display" value="atrules">Atrules</FilterOption>
					<FilterOption bind:group={nesting_display} name="nesting-display" value="rules">Rules</FilterOption>
					<FilterOption bind:group={nesting_display} name="nesting-display" value="selectors">Selectors</FilterOption>
					<FilterOption bind:group={nesting_display} name="nesting-display" value="declarations">
						Declarations
					</FilterOption>
				</FilterGroup>

				{#if nesting_display === 'atrules'}
					{@render nesting_stats({
						label: 'Atrule nesting depth',
						node_type: 'atrule',
						nesting: atrules.nesting
					})}
				{/if}

				{#if nesting_display === 'rules'}
					{@render nesting_stats({
						label: 'Rule nesting depth',
						node_type: 'rule',
						nesting: rules.nesting
					})}
				{/if}

				{#if nesting_display === 'selectors'}
					{@render nesting_stats({
						label: 'Selector nesting depth',
						node_type: 'selector',
						nesting: selectors.nesting
					})}
				{/if}

				{#if nesting_display === 'declarations'}
					{@render nesting_stats({
						label: 'Declaration nesting depth',
						node_type: 'declaration',
						nesting: declarations.nesting
					})}
				{/if}
			</div>
		</Panel>
	{/if}
</div>

<style>
	figcaption {
		text-align: center;
		font-size: var(--size-sm);
		margin-block-start: var(--space-2);
	}
</style>
