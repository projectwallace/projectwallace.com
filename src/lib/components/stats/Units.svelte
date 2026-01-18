<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'
	import type { CssLocation } from '$lib/css-location'
	import { Panel, Header } from '$components/Panel'
	import DefinitionList from '$components/stats/DefinitionList.svelte'
	import BarChart from '$components/stats/BarChart.svelte'
	import Empty from '$components/Empty.svelte'
	import Icon from '$components/Icon.svelte'
	import Heading from '$components/Heading.svelte'

	import { all as valid_units } from '$lib/css-units.js'

	let { units }: { units: CssAnalysis['values']['units'] } = $props()

	let sorted_units = $derived(
		Object.entries(units.uniqueWithLocations as Record<string, CssLocation[]>)
			.map(([value, locations]) => ({
				value,
				locations,
				count: locations.length
			}))
			.sort((a, b) => b.count - a.count)
	)

	let warnings = $derived(
		sorted_units.reduce((acc, { value }) => {
			if (!valid_units.includes(value.toLowerCase()) && value !== '%') {
				acc.push(value)
			}
			return acc
		}, new Array<string>())
	)
</script>

<Panel id="units">
	<Header>
		<Heading element="h3">CSS Units</Heading>
		<DefinitionList
			stats={[
				{ name: 'Total', value: units.total },
				{ name: 'Unique', value: units.totalUnique, ratio: units.uniquenessRatio }
			]}
		/>
	</Header>

	<div class="group">
		{#if units.total > 0}
			<BarChart context="unit" column_headers={['Unit', 'Count']} items={sorted_units} {warnings} node_type="value" />

			{#if warnings.length > 0}
				<p>
					<Icon name="warning" color="fill-yellow-400" size={16} /> This is an invalid CSS unit and it wil likely have no
					effect.
				</p>
			{/if}
		{:else}
			<Empty>No units found.</Empty>
		{/if}
	</div>
</Panel>

<style>
	.group {
		display: grid;
		gap: var(--space-4);
	}
</style>
