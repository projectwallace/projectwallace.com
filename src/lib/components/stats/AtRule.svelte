<script lang="ts">
	import { summarize, type CountResult } from '@projectwallace/css-analyzer'
	import { with_locations } from '#lib/analysis-locations.ts'
	import Empty from '#lib/components/Empty.svelte'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import Heading from '#lib/components/Heading.svelte'
	import ValueCountList from '#lib/components/stats/ValueCountList.svelte'
	import DefinitionList from '#lib/components/stats/DefinitionList.svelte'
	import { alphabetical_sorting } from './sorting.ts'

	type Props = CountResult & {
		title: string
		id: string
		warnings?: string[]
	}

	let { total = 0, total_unique = 0, unique = new Map(), title, id, warnings = [] }: Props = $props()
	let uniqueness_ratio = $derived(summarize({ total, total_unique, unique }).uniqueness_ratio)
	let unique_with_locations = $derived(with_locations({ total, total_unique, unique }))
</script>

<Panel {id}>
	<Header>
		<Heading element="h3">{title}</Heading>
		{#if total > 0}
			<DefinitionList
				stats={[
					{ name: 'Total', value: total },
					{ name: 'Unique', value: total_unique, ratio: uniqueness_ratio }
				]}
			/>
		{/if}
	</Header>
	{#if total > 0}
		<ValueCountList {id} unique={unique_with_locations} {warnings} extra_sort_options={[alphabetical_sorting]} />
	{:else}
		<Empty>No {title} found.</Empty>
	{/if}
</Panel>
