<script lang="ts">
	import { compareSpecificity } from '@projectwallace/css-analyzer'
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

	type Specificity = [number, number, number]

	interface Props {
		selectors?: CssAnalysis['selectors']
	}

	let { selectors = Object.create(null) }: Props = $props()

	let { specificity, complexity, accessibility, prefixed, keyframes, combinators, pseudoClasses } = $derived(selectors)

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

		<Panel id="pseudo-classes">
			<Header>
				<Heading element="h3">Pseudo classes</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: pseudoClasses.total },
						{ name: 'Unique', value: pseudoClasses.totalUnique, ratio: pseudoClasses.uniquenessRatio }
					]}
				/>
			</Header>
			{#if pseudoClasses.total > 0}
				<ValueCountList
					id="pseudo-classes-list"
					unique={pseudoClasses.uniqueWithLocations}
					extra_sort_options={[alphabetical_sorting]}
					node_type="selector"
				/>
			{:else}
				<Empty element="p">No pseudo classes found.</Empty>
			{/if}
		</Panel>

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

		<Panel id="prefixed-selectors">
			<Header>
				<Heading element="h3">Vendor-prefixed selectors</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: prefixed.total },
						{ name: 'Unique', value: prefixed.totalUnique, ratio: prefixed.uniquenessRatio }
					]}
				/>
			</Header>
			{#if prefixed.total > 0}
				<ValueCountList
					id="prefixed-selectors-list"
					unique={prefixed.uniqueWithLocations}
					extra_sort_options={[alphabetical_sorting]}
					node_type="selector"
				/>
			{:else}
				<Empty element="p">No vendor prefixed selectors found.</Empty>
			{/if}
		</Panel>

		<Panel id="accessibility-selectors">
			<Header>
				<Heading element="h3">Accessibility selectors</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: accessibility.total },
						{
							name: 'Unique',
							value: accessibility.totalUnique,
							ratio: accessibility.uniquenessRatio
						}
					]}
				/>
			</Header>
			{#if accessibility.total > 0}
				<ValueCountList
					id="accessibility-selectors-list"
					unique={accessibility.uniqueWithLocations}
					extra_sort_options={[alphabetical_sorting]}
					node_type="selector"
				/>
			{:else}
				<Empty element="p">No accessibility selectors found.</Empty>
			{/if}
		</Panel>

		<Panel id="keyframes-selectors">
			<Header>
				<Heading element="h3">Keyframes selectors</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: keyframes.total },
						{ name: 'Unique', value: keyframes.totalUnique, ratio: keyframes.uniquenessRatio }
					]}
				/>
			</Header>
			{#if keyframes.total > 0}
				<ValueCountList
					id="keyframes-selectors-list"
					unique={keyframes.uniqueWithLocations}
					node_type="selector"
					extra_sort_options={[
						{
							label: 'Sort by %',
							fn: sort_keyframes,
							id: 'keyframes-selectors'
						}
					]}
				/>
			{:else}
				<Empty element="p">No keyframe selectors found.</Empty>
			{/if}
		</Panel>
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
