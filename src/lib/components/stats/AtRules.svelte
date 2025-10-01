<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'
	import AtRule from '$lib/components/stats/AtRule.svelte'
	import FontFaces from '$lib/components/stats/FontFaces.svelte'
	import Heading from '$lib/components/Heading.svelte'
	import LayerTree from '$components/css-layers-visualizer/LayerTree.svelte'
	import Empty from '$components/Empty.svelte'
	import { Panel, Header } from '$components/Panel'
	import BarChart from '$components/stats/BarChart.svelte'
	import DefinitionList from './DefinitionList.svelte'
	import { layer_tree } from '@projectwallace/css-layer-tree'
	import { get_css_state } from '$lib/css-state.svelte'

	interface Props {
		atrules?: CssAnalysis['atrules']
	}

	let { atrules = Object.create(null) }: Props = $props()

	let { media, fontface, import: imports, supports, container, keyframes, layer, property } = $derived(atrules)
	let css_state = get_css_state()

	let tree = $derived(layer_tree(css_state.css))
</script>

<section id="at-rules">
	<Heading element="h2">At-rules</Heading>

	<div class="report-section">
		<Panel id="atrules-composition" class="report-section-full-width">
			<Header>
				<Heading element="h3">Composition</Heading>
				<DefinitionList stats={[{ name: 'Atrule names', value: atrules.totalUnique }]} />
			</Header>
			<BarChart
				context="atrules-composition"
				class="mt-4"
				items={Object.entries(
					atrules.uniqueWithLocations as Record<
						string,
						{ line: number; column: number; offset: number; length: number }[]
					>
				)
					.map(([atrule_name, locations]) => ({
						value: `@${atrule_name}`,
						count: locations.length,
						locations
					}))
					.sort((a, b) => b.count - a.count)}
				column_headers={['Atrule name', 'Count']}
				node_type="atrule"
			/>
		</Panel>

		<FontFaces {...fontface} />
		<AtRule {...media} title="@media" id="media" warnings={Object.keys(media.browserhacks.unique)} />
		{#if media.features.total > 0}
			<AtRule {...media.features} title="@media features" id="media-features" />
		{/if}
		<AtRule {...keyframes} title="@keyframes" id="keyframes" />
		<AtRule {...supports} title="@supports" id="supports" warnings={Object.keys(supports.browserhacks.unique)} />
		<AtRule {...container} title="@container" id="container" />
		{#if container.names.total > 0}
			<AtRule {...container.names} title="@container names" id="container-names" />
		{/if}
		<Panel id="layer">
			<Header>
				<Heading element="h3">@layer</Heading>
				{#if layer.total > 0}
					<DefinitionList
						stats={[
							{ name: 'Total', value: layer.total },
							{ name: 'Unique', value: layer.totalUnique, ratio: layer.uniquenessRatio }
						]}
					/>
				{/if}
			</Header>
			{#if layer.total > 0}
				<LayerTree {tree} />
			{:else}
				<Empty>No @layer found.</Empty>
			{/if}
		</Panel>
		<AtRule {...property} title="@property" id="property" />
		<AtRule {...imports} title="@import" id="import" />
	</div>
</section>
