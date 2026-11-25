<script lang="ts">
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import ShowMore from '#lib/components/ShowMore.svelte'
	import Empty from '#lib/components/Empty.svelte'
	import Heading from '#lib/components/Heading.svelte'
	import FilterGroup from '#lib/components/FilterGroup.svelte'
	import FilterOption from '#lib/components/FilterOption.svelte'
	import BarChart from '#lib/components/stats/BarChart.svelte'
	import DefinitionList from '#lib/components/stats/DefinitionList.svelte'
	import type { CssLocation } from '#lib/css-location.ts'
	import { is_shorthand_property } from '@projectwallace/css-analyzer/properties'
	import { summarize } from '@projectwallace/css-analyzer'
	import { with_locations } from '#lib/analysis-locations.ts'

	interface Props {
		properties?: CssAnalysis['properties']
	}

	let { properties = Object.create(null) }: Props = $props()

	let show_all = '1' as const
	let show_custom = '2' as const
	let show_prefixed = '3' as const
	let show_hacks = '4' as const
	let show_shorthands = '5' as const
	type FilterType =
		| typeof show_all
		| typeof show_custom
		| typeof show_prefixed
		| typeof show_hacks
		| typeof show_shorthands

	const FILTER_NAME = 'property-filtering'

	let { browserhacks, prefixed, custom, total_unique, total } = $derived(properties)
	let { uniqueness_ratio } = $derived(summarize(properties))
	let unique_with_locations = $derived(with_locations(properties))

	function sort_n_slice(items: [string, CssLocation[]][]) {
		return items
			.map(([value, locations]) => ({ value, locations, count: locations.length }))
			.sort((a, b) => b.count - a.count)
	}

	let shorthand_properties = $derived(
		Object.entries(unique_with_locations).filter(([property]) => is_shorthand_property(property))
	)

	let visibility_filter: FilterType = $state(show_all)
	let filtered = $derived.by(() => {
		switch (visibility_filter) {
			case show_hacks:
				return Object.entries(with_locations(browserhacks))
			case show_custom:
				return Object.entries(with_locations(custom))
			case show_prefixed:
				return Object.entries(with_locations(prefixed))
			case show_shorthands:
				return shorthand_properties
		}
		return Object.entries(unique_with_locations)
	}) as [string, CssLocation[]][]
</script>

<div id="properties">
	<Heading element="h2">Properties</Heading>

	<div class="report-section">
		<Panel>
			<Header>
				<Heading element="h3">Unique properties</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: total },
						{ name: 'Unique', value: total_unique, ratio: uniqueness_ratio }
					]}
				/>
			</Header>
			<FilterGroup>
				<legend class="sr-only">Filter properties</legend>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_all}>
					Show all ({total_unique})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_custom}>
					Custom properties ({custom.total_unique})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_shorthands}>
					Shorthands ({shorthand_properties.length})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_prefixed}>
					Prefixed ({prefixed.total_unique})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_hacks}>
					Browserhacks ({browserhacks.total_unique})
				</FilterOption>
			</FilterGroup>

			{#if filtered.length > 0}
				{#key visibility_filter}
					<ShowMore collapsible={filtered.length > 14}>
						{#snippet children({ status })}
							<BarChart
								context="property"
								column_headers={['Property', 'Count']}
								row_limit={status === 'closed' ? 14 : Infinity}
								warnings={browserhacks.total > 0 ? [...browserhacks.unique.keys()] : undefined}
								items={sort_n_slice(filtered).slice(0, status === 'closed' ? 14 : Infinity)}
							/>
						{/snippet}
					</ShowMore>
				{/key}
			{:else}
				<Empty>No properties to show</Empty>
			{/if}
		</Panel>
	</div>
</div>
