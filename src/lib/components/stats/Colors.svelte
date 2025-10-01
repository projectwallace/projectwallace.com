<script lang="ts">
	import type { CssLocation } from '$lib/css-location'
	import type { CssAnalysis } from '$lib/analyze-css'
	import { Panel, Header } from '$components/Panel/index'
	import Empty from '$components/Empty.svelte'
	import BarChart from '$components/stats/BarChart.svelte'
	import ColorBar from './ColorBar.svelte'
	import type { Sizing } from './ColorBar'
	import ColorTable from './ColorTable.svelte'
	import ColorGroups from './ColorGroups.svelte'
	import DefinitionList from './DefinitionList.svelte'
	import Heading from '$components/Heading.svelte'
	import FilterGroup from '$components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import { convert, compare } from 'color-sorter'

	type Colors = CssAnalysis['values']['colors']

	interface Props {
		colors?: Colors
	}

	let { colors = Object.create(null) }: Props = $props()

	let { total, totalUnique, itemsPerContext, formats, uniquenessRatio, uniqueWithLocations } = $derived(colors)

	const COLOR_FORMATS = {
		hex3: '#rgb',
		hex4: '#rgba',
		hex6: '#rrggbb',
		hex8: '#rrggbbaa',
		hsl: 'hsl()',
		hsla: 'hsla()',
		color: 'color()',
		hwb: 'hwb()',
		currentcolor: 'currentColor',
		named: 'namedColor',
		rgb: 'rgb()',
		rgba: 'rgba()',
		system: 'system',
		transparent: 'transparent',
		lab: 'lab()',
		oklab: 'oklab()'
	}

	let sizing: Sizing = $state('relative')
	let sorting: 'as-authored' | 'by-color' | 'by-count' = $state('as-authored')

	let sortedFormats = $derived(
		Object.entries(formats.uniqueWithLocations! as Record<string, CssLocation[]>)
			.map(([value, locations]) => ({
				// @ts-expect-error TS does not understand JS
				value: COLOR_FORMATS[value] || value,
				locations,
				count: locations.length
			}))
			.sort((a, b) => b.locations.length - a.locations.length)
	)

	let converted = $derived.by(() => {
		let _converted = Object.entries(uniqueWithLocations as Record<string, CssLocation[]>).map(([value, locations]) => ({
			converted: convert(value),
			locations
		}))

		if (sorting === 'as-authored') {
			return _converted
		}
		if (sorting === 'by-color') {
			return _converted.sort((a, b) => compare(a.converted, b.converted))
		}
		if (sorting === 'by-count') {
			return _converted.sort((a, b) => b.locations.length - a.locations.length)
		}

		return _converted
	})
</script>

<Panel id="colors">
	<Header>
		<Heading element="h3">Colors</Heading>
		<DefinitionList
			stats={[
				{ name: 'Total', value: total },
				{ name: 'Unique', value: totalUnique, ratio: uniquenessRatio }
			]}
		/>
	</Header>
	{#if colors.total > 0}
		<div class="group">
			<p>
				Colors are sorted by default in the order they're discovered in the CSS, but you can <a
					href="https://github.com/projectwallace/color-sorter"
				>
					sort by color
				</a>
				as well.
				<br />
				A wider bar means the color is used more often.
			</p>

			<div>
				<FilterGroup>
					<legend class="sr-only">Sorting colors</legend>
					<FilterOption name="color-sorting" value="as-authored" bind:group={sorting}>
						Sort by source order
					</FilterOption>
					<FilterOption name="color-sorting" value="by-count" bind:group={sorting}>Sort by count</FilterOption>
					<FilterOption name="color-sorting" value="by-color" bind:group={sorting}>Sort by color</FilterOption>
				</FilterGroup>

				<FilterGroup>
					<legend class="sr-only">Sizing colors</legend>
					<FilterOption name="color-sizing" value="relative" bind:group={sizing}>Size by usage</FilterOption>
					<FilterOption name="color-sizing" value="evenly" bind:group={sizing}>Size evenly</FilterOption>
				</FilterGroup>
			</div>

			{#key sorting}
				<div class="group">
					<ColorBar {sizing} {total} {totalUnique} colors={converted} />
					<ColorGroups {colors} />
				</div>
			{/key}

			<section class="group" id="color-usage">
				<Heading element="h4">Color usage per CSS property</Heading>
				<p>
					Discover which colors are used for backgrounds, text colors, borders and all other possible options. A wider
					bar means the color is used more often.
				</p>

				<ColorTable items={itemsPerContext} {sizing} />
			</section>

			<section class="group" id="color-formats">
				<Heading element="h4">Color formats</Heading>
				<BarChart node_type="value" context="color" column_headers={['Format', 'Count']} items={sortedFormats} />
			</section>
		</div>
	{:else}
		<Empty>No colors found.</Empty>
	{/if}
</Panel>

<style>
	.group {
		display: grid;
		gap: var(--space-4);
	}
</style>
