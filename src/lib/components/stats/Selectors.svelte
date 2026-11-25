<script lang="ts">
	import { summarize, summarize_numbers, type CountResult } from '@projectwallace/css-analyzer'
	import { summarize_specificity } from '@projectwallace/css-analyzer/collectors'
	import { compare_specificity, type Specificity } from '@projectwallace/css-analyzer/selectors'
	import { with_locations } from '#lib/analysis-locations.ts'
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import type { CssLocation } from '#lib/css-location.ts'
	import { format_number } from '#lib/format-number.ts'
	import { sort as sort_keyframes_selectors } from '#lib/sort-keyframes-selectors.ts'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import ScatterPlot from '#lib/components/stats/ScatterPlot.svelte'
	import BarChart from '#lib/components/stats/BarChart.svelte'
	import ValueCountList from './ValueCountList.svelte'
	import Empty from '#lib/components/Empty.svelte'
	import Heading from '#lib/components/Heading.svelte'
	import DefinitionList from '#lib/components/stats/DefinitionList.svelte'
	import { StatsList, Item } from '#lib/components/stats-list/index.ts'
	import { alphabetical_sorting, type SortOption } from './sorting.ts'

	interface Props {
		selectors?: CssAnalysis['selectors']
		specificity?: CssAnalysis['specificity']
	}

	interface ValueCountPanelProps {
		panel_id: string
		title: string
		data: CountResult
		list_id: string
		empty_message: string
		sort_options?: SortOption[]
	}

	let { selectors = Object.create(null), specificity = Object.create(null) }: Props = $props()

	let {
		complexity,
		accessibility,
		prefixed,
		keyframes,
		combinators,
		pseudo_classes,
		pseudo_elements,
		attributes,
		custom_elements
	} = $derived(selectors)
	let selector_summary = $derived(summarize(selectors))
	let specificity_summary = $derived(summarize_specificity(specificity))
	let complexity_summary = $derived(summarize_numbers(complexity))

	const COMBINATOR_NAMES = {
		' ': `Descendant ( )`,
		'>': 'Child (>)',
		'~': 'General sibling (~)',
		'+': 'Adjacent sibling (+)'
	}

	function parse_specificity(str: string) {
		return str.split(',').map((part) => parseInt(part, 10)) as Specificity
	}

	let count_per_specificity = $derived(
		Object.entries(with_locations(specificity))
			.map(([value, locations]) => ({
				value,
				locations,
				count: locations.length,
				specificity: parse_specificity(value)
			}))
			.sort((a, b) => compare_specificity(b.specificity, a.specificity))
	)

	let sorted_combinators = $derived(
		Object.entries(with_locations(combinators))
			.map(([value, locations]) => ({
				// @ts-expect-error TS does not know JS
				value: COMBINATOR_NAMES[value] || value,
				locations,
				count: locations.length
			}))
			.sort((a, b) => b.count - a.count)
	)

	let sorted_complexities = $derived(
		Object.entries(with_locations(complexity))
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
}: ValueCountPanelProps)}
	<Panel id={panel_id}>
		<Header>
			<Heading element="h3">{title}</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: data.total },
					{ name: 'Unique', value: data.total_unique, ratio: summarize(data).uniqueness_ratio }
				]}
			/>
		</Header>
		{#if data.total > 0}
			<ValueCountList
				id={list_id}
				unique={with_locations(data)}
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
					value={format_number(selectors.total_unique)}
					secondary_value="{format_number(selector_summary.uniqueness_ratio * 100, { decimals: 2 })}%"
				/>
			</StatsList>
		</Panel>

		<Panel id="specificity">
			<Header>
				<Heading element="h3">Specificity</Heading>
				<DefinitionList
					stats={[
						{ name: 'Unique', value: specificity.total_unique },
						{
							name: 'Average',
							value: specificity_summary.mean.map((i) => format_number(i, { decimals: 2 }))
						}
					]}
				/>
			</Header>
			{#if specificity.total > 0}
				<div class="stack stack-lg">
					<BarChart
						context="selector-specificity"
						column_headers={['Specificity', 'Count']}
						items={count_per_specificity}
						node_type="selector"
					/>

					<Heading element="h4">Specificity total</Heading>
					<DefinitionList
						stats={[
							{ name: 'Specificity A', value: specificity_summary.sum[0] },
							{ name: 'Specificity B', value: specificity_summary.sum[1] },
							{ name: 'Specificity C', value: specificity_summary.sum[2] }
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
						{ name: 'Total', value: complexity_summary.sum },
						{ name: 'Unique', value: complexity.total_unique },
						{ name: 'Average', value: complexity_summary.mean }
					]}
				/>
			</Header>
			{#if complexity.total > 0}
				<p>
					Selector complexity is calculated as a sum of all types (id, element, class, pseudo-elements, etc.), but also
					universal selectors and combinators.
				</p>

				{#if complexity_summary.max}
					<figure>
						<ScatterPlot max={complexity_summary.max} items={complexity.sequence ?? []} />
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
			data: pseudo_classes,
			list_id: 'pseudo-classes-list',
			empty_message: 'No pseudo classes found.'
		})}
		{@render value_count_panel({
			panel_id: 'pseudo-elements',
			title: 'Pseudo elements',
			data: pseudo_elements,
			list_id: 'pseudo-elements-list',
			empty_message: 'No pseudo elements found.'
		})}

		<Panel id="selector-combinators">
			<Header>
				<Heading element="h3">Selector Combinators</Heading>
				<DefinitionList
					stats={[
						{ name: 'Total', value: combinators.total },
						{ name: 'Unique', value: combinators.total_unique, ratio: summarize(combinators).uniqueness_ratio }
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
			data: custom_elements,
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
	figure {
		margin-block: var(--space-4);
	}

	figcaption {
		text-align: center;
		font-size: var(--size-sm);
		margin-block-start: var(--space-2);
	}
</style>
