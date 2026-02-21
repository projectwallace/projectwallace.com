<script lang="ts">
	import type { CssLocation } from '$lib/css-location'
	import type { CssAnalysis } from '$lib/analyze-css'
	import Empty from '$lib/components/Empty.svelte'
	import { Panel, Header } from '$lib/components/Panel/index'
	import Heading from '$lib/components/Heading.svelte'
	import ValueCountList from '$lib/components/stats/ValueCountList.svelte'
	import DefinitionList from '$lib/components/stats/DefinitionList.svelte'
	import { string_sort } from '$lib/string-sort'

	type AtRules = CssAnalysis['atrules']
	type AtRule =
		| AtRules['charset']
		| AtRules['container']
		| AtRules['import']
		| AtRules['keyframes']
		| AtRules['layer']
		| AtRules['media']
		| AtRules['property']
		| AtRules['supports']

	type Props = Pick<AtRule, 'total' | 'totalUnique' | 'uniquenessRatio' | 'uniqueWithLocations'> & {
		title: string
		id: string
		warnings?: string[]
	}

	let {
		total = 0,
		totalUnique = 0,
		uniquenessRatio = 0,
		uniqueWithLocations = Object.create(null),
		title,
		id,
		warnings = []
	}: Props = $props()

	function sort_alphabetical(a: [string, CssLocation[]], b: [string, CssLocation[]]) {
		return string_sort(a[0], b[0])
	}
</script>

<Panel {id}>
	<Header>
		<Heading element="h3">{title}</Heading>
		{#if total > 0}
			<DefinitionList
				stats={[
					{ name: 'Total', value: total },
					{ name: 'Unique', value: totalUnique, ratio: uniquenessRatio }
				]}
			/>
		{/if}
	</Header>
	{#if total > 0}
		<ValueCountList
			{id}
			unique={uniqueWithLocations}
			{warnings}
			extra_sort_options={[
				{
					label: 'Sort A-Z',
					fn: sort_alphabetical,
					id: 'alphabetical'
				}
			]}
		/>
	{:else}
		<Empty>No {title} found.</Empty>
	{/if}
</Panel>
