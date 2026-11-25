<script lang="ts">
	import type { CssLocation } from '#lib/css-location.ts'
	import Container from '#lib/components/Container.svelte'
	import Form from '#lib/components/css-form/Form.svelte'
	import Devtools from '#lib/components/DevTools.svelte'
	import Analysis from '#lib/components/stats/Analysis.svelte'
	import Seo from '#lib/components/Seo.svelte'
	import Markdown from '#lib/components/Markdown.svelte'
	import Colors from '#lib/components/stats/Colors.svelte'
	import Nav from '#lib/components/stats/Nav.svelte'
	import FontSizes from '#lib/components/stats/FontSizes.svelte'
	import GradientList from '#lib/components/stats/GradientList.svelte'
	import ValueCountList from '#lib/components/stats/ValueCountList.svelte'
	import Radiuses from '#lib/components/stats/Radiuses.svelte'
	import DefinitionList from '#lib/components/stats/DefinitionList.svelte'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import Empty from '#lib/components/Empty.svelte'
	import Heading from '#lib/components/Heading.svelte'
	import Hero from '#lib/components/Hero.svelte'
	import Units from '#lib/components/stats/Units.svelte'
	import { compare } from '@projectwallace/css-time-sort'
	import { validate as validate_duration } from '#lib/sort-time.ts'
	import FontFaces from '#lib/components/stats/FontFaces.svelte'
	import CssPanel from '#lib/components/devtools/CssPanel.svelte'
	import NetworkPanel from '#lib/components/NetworkPanel.svelte'
	import ItemUsage from '#lib/components/ItemUsage.svelte'
	import { design_token_tabs, type TabId } from '#lib/components/devtools/tabs.ts'
	import DesignTokensPanel from '#lib/components/devtools/DesignTokensPanel.svelte'
	import { get_css_state } from '#lib/css-state.svelte.ts'
	import { summarize } from '@projectwallace/css-analyzer'
	import { with_locations } from '#lib/analysis-locations.ts'
	import { string_sort } from '#lib/string-sort.ts'
	import { normalize_line_height } from '#lib/sort-line-height.ts'
	import { nav as navigation } from './nav.ts'

	let css_state = get_css_state()

	function sort_font_sizes(a: [string, CssLocation[]], b: [string, CssLocation[]]) {
		return normalize_line_height(a[0]) - normalize_line_height(b[0])
	}

	function sort_by_duration(a: [string, CssLocation[]], b: [string, CssLocation[]]) {
		return compare(a[0], b[0])
	}

	let sort_az = {
		label: 'Sort A-Z',
		fn: (a: [string, CssLocation[]], b: [string, CssLocation[]]) => {
			return string_sort(a[0], b[0])
		},
		id: 'alphabetical'
	}
</script>

<Seo
	title="CSS Design Tokens Analyzer"
	description="Grab all Design Tokens from a page using its CSS. Enter a URL or paste in your raw CSS and get instant analysis."
/>

<Hero>
	<Form title="CSS Design Tokens" />
</Hero>

{#if css_state.origins.length > 0}
	<Analysis origins={css_state.origins} prettify_css_before_analyze={css_state.should_prettify}>
		{#snippet nav()}
			<Nav nav={navigation} />
		{/snippet}

		{#snippet children({ analysis, css })}
			{#key css}
				<div class="group">
					<Colors colors={analysis.colors} />

					<Panel id="gradients">
						<Header>
							<Heading element="h3">Gradients</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.gradients.total },
									{
										name: 'Unique',
										value: analysis.gradients.total_unique,
										ratio: summarize(analysis.gradients).uniqueness_ratio
									}
								]}
							/>
						</Header>

						{#if analysis.gradients.total > 0}
							<GradientList items={with_locations(analysis.gradients)} />
						{:else}
							<Empty>No gradients found.</Empty>
						{/if}
					</Panel>

					<Panel id="font-sizes">
						<Header>
							<Heading element="h3">Font-sizes</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.font_sizes.total },
									{
										name: 'Unique',
										value: analysis.font_sizes.total_unique,
										ratio: summarize(analysis.font_sizes).uniqueness_ratio
									}
								]}
							/>
						</Header>

						{#if analysis.font_sizes.total > 0}
							<FontSizes sizes={with_locations(analysis.font_sizes)} />
						{:else}
							<Empty>No font-sizes found.</Empty>
						{/if}
					</Panel>

					<Panel id="font-families">
						<Header>
							<Heading element="h3">Font-families</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.font_families.total },
									{
										name: 'Unique',
										value: analysis.font_families.total_unique,
										ratio: summarize(analysis.font_families).uniqueness_ratio
									}
								]}
							/>
						</Header>
						{#if analysis.font_families.total > 0}
							<ValueCountList
								id="font-family"
								unique={with_locations(analysis.font_families)}
								extra_sort_options={[sort_az]}
								node_type="value"
							/>
						{:else}
							<Empty>No font-families found.</Empty>
						{/if}
					</Panel>

					<FontFaces {...analysis.atrules.font_faces} />

					<Panel id="line-heights">
						<Header>
							<Heading element="h3">Line-heights</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.line_heights.total },
									{
										name: 'Unique',
										value: analysis.line_heights.total_unique,
										ratio: summarize(analysis.line_heights).uniqueness_ratio
									}
								]}
							/>
						</Header>
						{#if analysis.line_heights.total > 0}
							<ValueCountList
								id="line-height"
								node_type="value"
								unique={with_locations(analysis.line_heights)}
								extra_sort_options={[
									{
										id: 'size',
										label: 'Sort by size',
										fn: sort_font_sizes
									}
								]}
							/>
						{:else}
							<Empty>No line-heights found.</Empty>
						{/if}
					</Panel>

					<Panel id="text-shadows">
						<Header>
							<Heading element="h3">Text-shadows</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.text_shadows.total },
									{
										name: 'Unique',
										value: analysis.text_shadows.total_unique,
										ratio: summarize(analysis.text_shadows).uniqueness_ratio
									}
								]}
							/>
						</Header>
						{#if analysis.text_shadows.total > 0}
							<ValueCountList
								id="text-shadows"
								node_type="value"
								unique={with_locations(analysis.text_shadows)}
								extra_sort_options={[sort_az]}
							/>
						{:else}
							<Empty>No text-shadows found.</Empty>
						{/if}
					</Panel>

					<Panel id="box-shadows">
						<Header>
							<Heading element="h3">Box-shadows</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.box_shadows.total },
									{
										name: 'Unique',
										value: analysis.box_shadows.total_unique,
										ratio: summarize(analysis.box_shadows).uniqueness_ratio
									}
								]}
							/>
						</Header>
						{#if analysis.box_shadows.total > 0}
							<ValueCountList
								id="box-shadows"
								node_type="value"
								unique={with_locations(analysis.box_shadows)}
								extra_sort_options={[sort_az]}
							/>
						{:else}
							<Empty>No box-shadows found</Empty>
						{/if}
					</Panel>

					<Panel id="border-radiuses">
						<Header>
							<Heading element="h3">Border radius</Heading>
							<DefinitionList
								stats={[
									{
										name: 'Total',
										value: analysis.border_radiuses.total
									},
									{
										name: 'Unique',
										value: analysis.border_radiuses.total_unique,
										ratio: summarize(analysis.border_radiuses).uniqueness_ratio
									}
								]}
							/>
						</Header>
						{#if analysis.border_radiuses.total > 0}
							<Radiuses items={analysis.border_radiuses} />
						{:else}
							<Empty>No border-radius found</Empty>
						{/if}
					</Panel>

					<Panel id="animation-durations">
						<Header>
							<Heading element="h3">Animation durations</Heading>
							<DefinitionList
								stats={[
									{
										name: 'Total',
										value: analysis.durations.total
									},
									{
										name: 'Unique',
										value: analysis.durations.total_unique,
										ratio: summarize(analysis.durations).uniqueness_ratio
									}
								]}
							/>
						</Header>
						{#if analysis.durations.total}
							<ValueCountList
								id="animation-durations-list"
								node_type="value"
								unique={with_locations(analysis.durations)}
								warnings={[...analysis.durations.unique.keys()].filter((duration) => !validate_duration(duration))}
								extra_sort_options={[
									{
										id: 'duration',
										label: 'Sort by duration',
										fn: sort_by_duration
									}
								]}
							/>
						{:else}
							<Empty>No animation/transition durations found.</Empty>
						{/if}
					</Panel>

					<Panel id="animation-functions">
						<Header>
							<Heading element="h3">Animation functions</Heading>
							<DefinitionList
								stats={[
									{
										name: 'Total',
										value: analysis.timing_functions.total
									},
									{
										name: 'Unique',
										value: analysis.timing_functions.total_unique,
										ratio: summarize(analysis.timing_functions).uniqueness_ratio
									}
								]}
							/>
						</Header>
						{#if analysis.timing_functions.total > 0}
							<ValueCountList
								id="animation-functions-list"
								node_type="value"
								unique={with_locations(analysis.timing_functions)}
								extra_sort_options={[sort_az]}
							/>
						{:else}
							<Empty>No durations found.</Empty>
						{/if}
					</Panel>

					<Units units={analysis.units} />
				</div>
			{/key}
		{/snippet}
		{#snippet devtools({ analysis, css })}
			<div>
				<Devtools tabs={design_token_tabs}>
					{#snippet children({ tab_id }: { tab_id: TabId })}
						{#if tab_id === 'network'}
							<NetworkPanel />
						{:else if tab_id === 'inspector'}
							<ItemUsage />
						{:else if tab_id === 'css'}
							<CssPanel {css} />
						{:else if tab_id === 'design_tokens'}
							<DesignTokensPanel {analysis} />
						{/if}
					{/snippet}
				</Devtools>
			</div>
		{/snippet}
	</Analysis>
{/if}

<Container size="lg">
	<Markdown>
		<p>
			This analyzer statically analyzes your CSS and extracts all possible or potential design tokens out of it. This
			analyzer focuses on the following token types:
		</p>
		<ul>
			<li>Colors</li>
			<li>Font sizes</li>
			<li>Font families</li>
			<li>Line heights</li>
			<li>Gradients</li>
			<li>Text shadows</li>
			<li>Box shadows</li>
			<li>Border radiuses</li>
			<li>Animation durations</li>
			<li>Animation timing functions</li>
			<li>CSS Units used</li>
		</ul>
	</Markdown>
</Container>

<style>
	.group {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-8);

		@media (min-width: 66rem) {
			gap: var(--space-16);
		}
	}
</style>
