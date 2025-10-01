<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'
	import { shorthands } from '$lib/css-property-shorthands'
	import { Panel, Header } from '$lib/components/Panel'
	import ShowMore from '$lib/components/ShowMore.svelte'
	import Empty from '$lib/components/Empty.svelte'
	import Heading from '$lib/components/Heading.svelte'
	import FilterGroup from '$lib/components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import BarChart from '$lib/components/stats/BarChart.svelte'
	import DefinitionList from '$lib/components/stats/DefinitionList.svelte'
	import type { CssLocation } from '$lib/css-location'

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
	const LOCATIONS_PROP_NAME = 'uniqueWithLocations'

	let { browserhacks, prefixed, custom, totalUnique, total, uniquenessRatio } = $derived(properties)
	let uniqueWithLocations = $derived(properties[LOCATIONS_PROP_NAME]!)

	function sort_n_slice(items: [string, CssLocation[]][]) {
		return items
			.map(([value, locations]) => ({ value, locations, count: locations.length }))
			.sort((a, b) => b.count - a.count)
	}

	let shorthand_properties = $derived(
		Object.entries(uniqueWithLocations).filter(([property]) => shorthands.has(property))
	)

	let visibility_filter: FilterType = $state(show_all)
	let filtered = $derived.by(() => {
		switch (visibility_filter) {
			case show_hacks:
				return Object.entries(browserhacks[LOCATIONS_PROP_NAME]!)
			case show_custom:
				return Object.entries(custom[LOCATIONS_PROP_NAME]!)
			case show_prefixed:
				return Object.entries(prefixed[LOCATIONS_PROP_NAME]!)
			case show_shorthands:
				return shorthand_properties
		}
		return Object.entries(uniqueWithLocations)
	})
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
						{ name: 'Unique', value: totalUnique, ratio: uniquenessRatio }
					]}
				/>
			</Header>
			<FilterGroup>
				<legend class="sr-only">Filter properties</legend>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_all}>
					Show all ({totalUnique})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_custom}>
					Custom properties ({custom.totalUnique})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_shorthands}>
					Shorthands ({shorthand_properties.length})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_prefixed}>
					Prefixed ({prefixed.totalUnique})
				</FilterOption>
				<FilterOption bind:group={visibility_filter} name={FILTER_NAME} value={show_hacks}>
					Browserhacks ({browserhacks.totalUnique})
				</FilterOption>
			</FilterGroup>

			{#if filtered.length > 0}
				{#key visibility_filter}
					<ShowMore initial_open={filtered.length <= 14} closable={filtered.length > 14}>
						{#snippet children({ status })}
							<BarChart
								context="property"
								column_headers={['Property', 'Count']}
								row_limit={status === 'closed' ? 14 : Infinity}
								warnings={browserhacks.total > 0 ? Object.keys(browserhacks.unique) : undefined}
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
