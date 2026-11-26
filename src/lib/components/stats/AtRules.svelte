<script lang="ts">
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import { summarize } from '@projectwallace/css-analyzer'
	import { with_locations } from '#lib/analysis-locations.ts'
	import AtRule from '#lib/components/stats/AtRule.svelte'
	import FontFaces from '#lib/components/stats/FontFaces.svelte'
	import Heading from '#lib/components/Heading.svelte'
	import LayerTree from '#lib/components/css-layers-visualizer/LayerTree.svelte'
	import Empty from '#lib/components/Empty.svelte'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import BarChart from '#lib/components/stats/BarChart.svelte'
	import DefinitionList from './DefinitionList.svelte'
	import { layer_tree } from '@projectwallace/css-layer-tree'
	import { get_css_state } from '#lib/css-state.svelte.ts'

	interface Props {
		atrules?: CssAnalysis['atrules']
	}

	let { atrules = Object.create(null) }: Props = $props()

	let { media, font_faces, imports, supports, containers, keyframes, layers, properties, scopes } = $derived(atrules)
	let css_state = get_css_state()

	let tree = $derived(layer_tree(css_state.css))
</script>

<section id="at-rules">
	<Heading element="h2">At-rules</Heading>

	<div class="report-section">
		<Panel id="atrules-composition" class="report-section-full-width">
			<Header>
				<Heading element="h3">Composition</Heading>
				{#if atrules.total > 0}
					<DefinitionList stats={[{ name: 'Atrule names', value: atrules.total_unique }]} />
				{/if}
			</Header>
			{#if atrules.total > 0}
				<BarChart
					context="atrules-composition"
					class="mt-4"
					items={Object.entries(with_locations(atrules))
						.map(([atrule_name, locations]) => ({
							value: `@${atrule_name}`,
							count: locations.length,
							locations
						}))
						.sort((a, b) => b.count - a.count)}
					column_headers={['Atrule name', 'Count']}
					node_type="atrule"
				/>
			{:else}
				<Empty>No atrules found</Empty>
			{/if}
		</Panel>

		<FontFaces {...font_faces} />
		<AtRule {...media} title="@media" id="media" warnings={[...media.browserhacks.unique.keys()]} />
		{#if media.features.total > 0}
			<AtRule {...media.features} title="@media features" id="media-features" />
		{/if}
		<AtRule {...keyframes} title="@keyframes" id="keyframes" />
		<AtRule {...supports} title="@supports" id="supports" warnings={[...supports.browserhacks.unique.keys()]} />
		<AtRule {...containers} title="@container" id="container" />
		{#if containers.names.total > 0}
			<AtRule {...containers.names} title="@container names" id="container-names" />
		{/if}
		<Panel id="layer">
			<Header>
				<Heading element="h3">@layer</Heading>
				{#if layers.total > 0}
					<DefinitionList
						stats={[
							{ name: 'Total', value: layers.total },
							{ name: 'Unique', value: layers.total_unique, ratio: summarize(layers).uniqueness_ratio }
						]}
					/>
				{/if}
			</Header>
			{#if layers.total > 0}
				<LayerTree {tree} />
			{:else}
				<Empty>No @layer found.</Empty>
			{/if}
		</Panel>
		<AtRule {...properties} title="@property" id="property" />
		<AtRule {...scopes} title="@scope" id="scope" />
		<AtRule {...imports} title="@import" id="import" />
	</div>
</section>
