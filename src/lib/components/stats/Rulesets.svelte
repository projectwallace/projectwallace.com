<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'
	import type { CssLocation } from '$lib/css-location'
	import { format_number } from '$lib/format-number'
	import ScatterPlot from '$components/stats/ScatterPlot.svelte'
	import BarChart from '$components/stats/BarChart.svelte'
	import { Panel, Header } from '$components/Panel/index'
	import Heading from '$components/Heading.svelte'
	import Empty from '$components/Empty.svelte'
	import FilterGroup from '$components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import DefinitionList from './DefinitionList.svelte'
	import type { NodeType } from '$components/use-css-highlight'

	type Props = Pick<CssAnalysis, 'rules' | 'atrules' | 'selectors' | 'declarations'>

	type NestingStats =
		| CssAnalysis['atrules']['nesting']
		| CssAnalysis['rules']['nesting']
		| CssAnalysis['selectors']['nesting']
		| CssAnalysis['declarations']['nesting']
	type SizeSet =
		| CssAnalysis['rules']['sizes']
		| CssAnalysis['rules']['selectors']
		| CssAnalysis['rules']['declarations']

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

{#snippet nesting_stats({ label, node_type, nesting }: { label: string; node_type: NodeType; nesting: NestingStats })}
	<Header>
		<Heading element="h3">{label}</Heading>
		<DefinitionList
			stats={[
				{ name: 'Unique', value: format_number(nesting.totalUnique) },
				{ name: 'Average', value: format_number(nesting.mean) },
				{ name: 'Max', value: format_number(nesting.max || 0) },
				{ name: 'Mode', value: format_number(nesting.mode) }
			]}
		/>
	</Header>

	<figure>
		<ScatterPlot max={nesting.max || 0} items={nesting.items} />
		<figcaption>
			Nesting depth, showing the first {node_type} in the CSS on the left and the last item on the right.
		</figcaption>
	</figure>

	<BarChart
		context={`${node_type}-nesting`}
		class="mt-4"
		items={Object.entries(nesting.uniqueWithLocations as Record<string, CssLocation[]>).map(([value, locations]) => ({
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
	size_set: SizeSet
	node_name: string
})}
	<Header>
		<Heading element="h3">{label}</Heading>
		<DefinitionList
			stats={[
				{ name: 'Unique', value: format_number(size_set.totalUnique) },
				{ name: 'Average', value: format_number(size_set.mean) },
				{ name: 'Max', value: format_number(size_set.max || 0) },
				{ name: 'Mode', value: format_number(size_set.mode) }
			]}
		/>
	</Header>
	{#if total > 0}
		<figure>
			<ScatterPlot max={size_set.max || 0} items={size_set.items} />
			<figcaption>
				{label}, showing the first {node_type} in the CSS on the left and the last item on the right.
			</figcaption>
		</figure>

		<BarChart
			context={`${node_type}-per-ruleset`}
			items={Object.entries(size_set.uniqueWithLocations as Record<string, CssLocation[]>).map(
				([value, locations]) => ({
					value,
					locations,
					count: locations.length
				})
			)}
			column_headers={[node_name, 'Count']}
			{node_type}
		/>
	{:else}
		<Empty>No {node_type}s found.</Empty>
	{/if}
{/snippet}

<Panel id="rulesets">
	<Header>
		<Heading element="h2">Rulesets</Heading>
		<DefinitionList
			stats={[
				{ name: 'Total', value: format_number(rules.total) },
				{ name: 'Empty', value: format_number(rules.empty.total) }
			]}
		/>
	</Header>

	<div class="ui-group">
		<FilterGroup>
			<legend class="sr-only">Show rulesets</legend>
			<FilterOption bind:group={display} name="rulesets-display" value="sizes">Ruleset sizes</FilterOption>
			<FilterOption bind:group={display} name="rulesets-display" value="selectors">Selectors per ruleset</FilterOption>
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

{#if nesting.max !== undefined && nesting.max > 0}
	<Panel id="nesting">
		<Header>
			<Heading element="h3">Nesting</Heading>
		</Header>

		<div class="ui-group">
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

<style>
	.ui-group {
		display: grid;
		gap: var(--space-4);
	}

	figcaption {
		text-align: center;
		font-size: var(--size-sm);
		margin-top: var(--space-2);
	}
</style>
