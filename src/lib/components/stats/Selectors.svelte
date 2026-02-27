<script lang="ts">
	import { compareSpecificity, type Specificity } from '@projectwallace/css-analyzer'
	import type { CssAnalysis } from '$lib/analyze-css'
	import type { CssLocation } from '$lib/css-location'
	import { format_number } from '$lib/format-number'
	import { sort as sort_keyframes_selectors } from '$lib/sort-keyframes-selectors'
	import { Panel, Header } from '$lib/components/Panel/index'
	import ScatterPlot from '$lib/components/stats/ScatterPlot.svelte'
	import BarChart from '$lib/components/stats/BarChart.svelte'
	import ValueCountList from './ValueCountList.svelte'
	import Empty from '$lib/components/Empty.svelte'
	import Heading from '$lib/components/Heading.svelte'
	import DefinitionList from '$lib/components/stats/DefinitionList.svelte'
	import { StatsList, Item } from '$lib/components/stats-list/index'
	import { string_sort } from '$lib/string-sort'

	interface Props {
		selectors?: CssAnalysis['selectors']
	}

	let { selectors = Object.create(null) }: Props = $props()

	let {
		specificity,
		complexity,
		accessibility,
		prefixed,
		keyframes,
		combinators,
		pseudoClasses,
		pseudoElements,
		attributes,
		customElements
	} = $derived(selectors)

	let alphabetical_sorting = {
		label: 'Sort A-Z',
		fn: (a: [string, CssLocation[]], b: [string, CssLocation[]]) => {
			return string_sort(a[0], b[0])
		},
		id: 'alphabetical'
	}

	const COMBINATOR_NAMES = {
		' ': `Descendant ( )`,
		'>': 'Child (>)',
		'~': 'General sibling (~)',
		'+': 'Adjacent sibling (+)'
	}

	const SPECIFICITY_LENGTH = 3

	function parse_specificity(str: string) {
		let specificity = new Uint8ClampedArray(SPECIFICITY_LENGTH)
		let parts = str.split(',')

		for (let index = 0; index < SPECIFICITY_LENGTH; index++) {
			specificity[index] = parseInt(parts[index], 10)
		}

		return specificity as unknown as Specificity
	}

	let count_per_specificity = $derived(
		Object.entries(specificity.uniqueWithLocations as Record<string, CssLocation[]>)
			.map(([value, locations]) => ({
				value,
				locations,
				count: locations.length,
				specificity: parse_specificity(value)
			}))
			.sort((a, b) => compareSpecificity(b.specificity, a.specificity))
	)

	let sorted_combinators = $derived(
		Object.entries(combinators.uniqueWithLocations as Record<string, CssLocation[]>)
			.map(([value, locations]) => ({
				// @ts-expect-error TS does not know JS
				value: COMBINATOR_NAMES[value] || value,
				locations,
				count: locations.length
			}))
			.sort((a, b) => b.count - a.count)
	)

	let sorted_complexities = $derived(
		Object.entries(complexity.uniqueWithLocations as Record<string, CssLocation[]>)
			.map(([value, locations]) => ({ value, locations, count: locations.length }))
			.sort((a, b) => parseInt(a.value, 10) - parseInt(b.value, 10))
	)

	function sort_keyframes(a: [string, CssLocation[]], b: [string, CssLocation[]]) {
		return sort_keyframes_selectors(a[0], b[0])
	}
</script>

{#snippet value_count_panel({
	panel_id,
	title,
	data,
	list_id,
	empty_message,
	sort_options = [alphabetical_sorting]
}: {
	panel_id: string
	title: string
	data: {
		total: number
		totalUnique: number
		uniquenessRatio: number
		uniqueWithLocations: Record<string, CssLocation[]>
	}
	list_id: string
	empty_message: string
	sort_options?: (typeof alphabetical_sorting)[]
})}
	<Panel id={panel_id}>
		<Header>
			<Heading element="h3">{title}</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: data.total },
					{ name: 'Unique', value: data.totalUnique, ratio: data.uniquenessRatio }
				]}
			/>
		</Header>
		{#if data.total > 0}
			<ValueCountList
				id={list_id}
				unique={data.uniqueWithLocations}
				extra_sort_options={sort_options}
				node_type="selector"
			/>
		{:else}
			<Empty element="p">{empty_message}</Empty>
		{/if}
	</Panel>
{/snippet}

<div id="selectors">
	<Heading element="h2">Selectors</Heading>

	<div class="report-section">
		<Panel class="report-section-full-width">
			<Heading element="h3">Totals</Heading>
			<StatsList>
				<Item key="Total" value={format_number(selectors.total)} />
				<Item
					key="Unique"
					value={format_number(selectors.totalUnique)}
					secondary_value="{format_number(selectors.uniquenessRatio * 100, { decimals: 2 })}%"
				/>
			</StatsList>
		</Panel>

		<Panel id="specificity">
			<Header>
				<Heading element="h3">Specificity</Heading>
				<DefinitionList
					stats={[
						{ name: 'Unique', value: specificity.totalUnique },
						{
							name: 'Average',
							value: specificity.mean.map((i) => format_number(i, { decimals: 2 }))
						}
					]}
				/>
			</Header>
			{#if specificity.total > 0}
				<div class="group">
					<BarChart
						context="selector-specificity"
						column_headers={['Specificity', 'Count']}
						items={count_per_specificity}
						node_type="selector"
					/>

					<Heading element="h4">Specificity total</Heading>
					<DefinitionList
						stats={[
							{ name: 'Specificity A', value: specificity.sum[0] },
							{ name: 'Specificity B', value: specificity.sum[1] },
							{ name: 'Specificity C', value: specificity.sum[2] }
						]}
					/>
				</div>
			{:else}
				<Empty>No selectors found.</Empty>
			{/if}
		</Panel>

		<Panel id="complexity">
			<Header>
				<Heading element="h3">Complexity</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: complexity.sum },
						{ name: 'Unique', value: complexity.totalUnique },
						{ name: 'Average', value: complexity.mean }
					]}
				/>
			</Header>
			{#if complexity.total > 0}
				<p>
					Selector complexity is calculated as a sum of all types (id, element, class, pseudo-elements, etc.), but also
					universal selectors and combinators.
				</p>

				{#if complexity && complexity.max}
					<figure>
						<ScatterPlot max={complexity.max} items={complexity.items} />
						<figcaption>
							Complexity per selector, showing the first selector in the CSS on the left and the last selector on the
							right.
						</figcaption>
					</figure>
				{/if}

				<BarChart
					context="selector-complexity"
					class="mt-4"
					column_headers={['Complexity', 'Count']}
					items={sorted_complexities}
					node_type="selector"
				/>
			{:else}
				<Empty>No selectors found.</Empty>
			{/if}
		</Panel>

		{@render value_count_panel({
			panel_id: 'pseudo-classes',
			title: 'Pseudo classes',
			data: pseudoClasses,
			list_id: 'pseudo-classes-list',
			empty_message: 'No pseudo classes found.'
		})}
		{@render value_count_panel({
			panel_id: 'pseudo-elements',
			title: 'Pseudo elements',
			data: pseudoElements,
			list_id: 'pseudo-elements-list',
			empty_message: 'No pseudo elements found.'
		})}

		<Panel id="selector-combinators">
			<Header>
				<Heading element="h3">Selector Combinators</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: combinators.total },
						{ name: 'Unique', value: combinators.totalUnique, ratio: combinators.uniquenessRatio }
					]}
				/>
			</Header>
			{#if combinators.total > 0}
				<BarChart
					context="selector-combinators"
					class="mt-4"
					column_headers={['Combinator', 'Count']}
					items={sorted_combinators}
				/>
			{:else}
				<Empty element="p">No selector combinators found.</Empty>
			{/if}
		</Panel>

		{@render value_count_panel({
			panel_id: 'attribute-selectors',
			title: 'Attribute selectors',
			data: attributes,
			list_id: 'attribute-selectors-list',
			empty_message: 'No attribute selectors found.'
		})}
		{@render value_count_panel({
			panel_id: 'accessibility-selectors',
			title: 'Accessibility selectors',
			data: accessibility,
			list_id: 'accessibility-selectors-list',
			empty_message: 'No accessibility selectors found.'
		})}
		{@render value_count_panel({
			panel_id: 'keyframes-selectors',
			title: 'Keyframes selectors',
			data: keyframes,
			list_id: 'keyframes-selectors-list',
			empty_message: 'No keyframe selectors found.',
			sort_options: [{ label: 'Sort by %', fn: sort_keyframes, id: 'keyframes-selectors' }]
		})}
		{@render value_count_panel({
			panel_id: 'custom-element-selectors',
			title: 'Custom element selectors',
			data: customElements,
			list_id: 'custom-element-selectors-list',
			empty_message: 'No custom element selectors found.'
		})}
		{@render value_count_panel({
			panel_id: 'prefixed-selectors',
			title: 'Vendor-prefixed selectors',
			data: prefixed,
			list_id: 'prefixed-selectors-list',
			empty_message: 'No vendor prefixed selectors found.'
		})}
	</div>
</div>

<style>
	.group {
		display: grid;
		gap: var(--space-4);
	}

	figure {
		margin-block: var(--space-4);
	}

	figcaption {
		text-align: center;
		font-size: var(--size-sm);
		margin-top: var(--space-2);
	}
</style>
