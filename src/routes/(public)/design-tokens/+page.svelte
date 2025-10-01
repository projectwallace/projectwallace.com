<script lang="ts">
	import type { CssLocation } from '$lib/css-location'
	import Container from '$components/Container.svelte'
	import Form from '$components/css-form/Form.svelte'
	import Devtools from '$components/DevTools.svelte'
	import Analysis from '$components/stats/Analysis.svelte'
	import Seo from '$components/Seo.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Colors from '$components/stats/Colors.svelte'
	import Nav from '$components/stats/Nav.svelte'
	import FontSizes from '$components/stats/FontSizes.svelte'
	import GradientList from '$components/stats/GradientList.svelte'
	import ValueCountList from '$components/stats/ValueCountList.svelte'
	import Radiuses from '$components/stats/Radiuses.svelte'
	import DefinitionList from '$components/stats/DefinitionList.svelte'
	import { Panel, Header } from '$components/Panel'
	import Empty from '$components/Empty.svelte'
	import Heading from '$components/Heading.svelte'
	import Hero from '$components/Hero.svelte'
	import Units from '$components/stats/Units.svelte'
	import { compare } from 'css-time-sort'
	import { validate as validate_duration } from '$lib/sort-time'
	import FontFaces from '$components/stats/FontFaces.svelte'
	import JsonPanel from '$components/devtools/JsonPanel.svelte'
	import CssPanel from '$components/devtools/CssPanel.svelte'
	import NetworkPanel from '$components/NetworkPanel.svelte'
	import ItemUsage from '$components/ItemUsage.svelte'
	import { design_token_tabs, type TabId } from '$components/devtools/tabs'
	import DesignTokensPanel from '$components/devtools/DesignTokensPanel.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { string_sort } from '$lib/string-sort'
	import { normalize_line_height } from '$lib/sort-line-height'
	import { nav as navigation } from './nav'

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
	description="Grab all Design Tokens from a page using it's CSS. Enter a URL of paste in your raw CSS and get instant analysis."
/>

<Hero title="CSS Design Tokens" github_link="https://github.com/projectwallace/css-design-tokens">
	<Container size="xl">
		<Form />
	</Container>
</Hero>

{#if css_state.origins.length > 0}
	<Analysis origins={css_state.origins} prettify_css_before_analyze={css_state.should_prettify}>
		{#snippet nav()}
			<Nav nav={navigation} />
		{/snippet}

		{#snippet children({ analysis, css })}
			{#key css}
				<div class="group">
					<Colors colors={analysis.values.colors} />

					<Panel id="gradients">
						<Header>
							<Heading element="h3">Gradients</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.values.gradients.total },
									{
										name: 'Unique',
										value: analysis.values.gradients.totalUnique,
										ratio: analysis.values.gradients.uniquenessRatio
									}
								]}
							/>
						</Header>

						{#if analysis.values.gradients.total > 0}
							<GradientList items={analysis.values.gradients.uniqueWithLocations} />
						{:else}
							<Empty>No gradients found.</Empty>
						{/if}
					</Panel>

					<Panel id="font-sizes">
						<Header>
							<Heading element="h3">Font-sizes</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.values.fontSizes.total },
									{
										name: 'Unique',
										value: analysis.values.fontSizes.totalUnique,
										ratio: analysis.values.fontSizes.uniquenessRatio
									}
								]}
							/>
						</Header>

						{#if analysis.values.fontSizes.total > 0}
							<FontSizes sizes={analysis.values.fontSizes.uniqueWithLocations} />
						{:else}
							<Empty>No font-sizes found.</Empty>
						{/if}
					</Panel>

					<Panel id="font-families">
						<Header>
							<Heading element="h3">Font-families</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.values.fontFamilies.total },
									{
										name: 'Unique',
										value: analysis.values.fontFamilies.totalUnique,
										ratio: analysis.values.fontFamilies.uniquenessRatio
									}
								]}
							/>
						</Header>
						{#if analysis.values.fontFamilies.total > 0}
							<ValueCountList
								id="font-family"
								unique={analysis.values.fontFamilies.uniqueWithLocations}
								extra_sort_options={[sort_az]}
								node_type="value"
							/>
						{:else}
							<Empty>No font-families found.</Empty>
						{/if}
					</Panel>

					<FontFaces {...analysis.atrules.fontface} />

					<Panel id="line-heights">
						<Header>
							<Heading element="h3">Line-heights</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.values.lineHeights.total },
									{
										name: 'Unique',
										value: analysis.values.lineHeights.totalUnique,
										ratio: analysis.values.lineHeights.uniquenessRatio
									}
								]}
							/>
						</Header>
						{#if analysis.values.lineHeights.total > 0}
							<ValueCountList
								id="line-height"
								node_type="value"
								unique={analysis.values.lineHeights.uniqueWithLocations}
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
									{ name: 'Total', value: analysis.values.textShadows.total },
									{
										name: 'Unique',
										value: analysis.values.textShadows.totalUnique,
										ratio: analysis.values.textShadows.uniquenessRatio
									}
								]}
							/>
						</Header>
						{#if analysis.values.textShadows.total > 0}
							<ValueCountList
								id="text-shadows"
								node_type="value"
								unique={analysis.values.textShadows.uniqueWithLocations}
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
									{ name: 'Total', value: analysis.values.boxShadows.total },
									{
										name: 'Unique',
										value: analysis.values.boxShadows.totalUnique,
										ratio: analysis.values.boxShadows.uniquenessRatio
									}
								]}
							/>
						</Header>
						{#if analysis.values.boxShadows.total > 0}
							<ValueCountList
								id="box-shadows"
								node_type="value"
								unique={analysis.values.boxShadows.uniqueWithLocations}
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
									{ name: 'Total', value: analysis.values.borderRadiuses.total },
									{
										name: 'Unique',
										value: analysis.values.borderRadiuses.totalUnique,
										ratio: analysis.values.borderRadiuses.uniquenessRatio
									}
								]}
							/>
						</Header>
						{#if analysis.values.borderRadiuses.total > 0}
							<Radiuses items={analysis.values.borderRadiuses} />
						{:else}
							<Empty>No border-radius found</Empty>
						{/if}
					</Panel>

					<Panel id="animation-durations">
						<Header>
							<Heading element="h3">Animation durations</Heading>
							<DefinitionList
								stats={[
									{ name: 'Total', value: analysis.values.animations.durations.total },
									{
										name: 'Unique',
										value: analysis.values.animations.durations.totalUnique,
										ratio: analysis.values.animations.durations.uniquenessRatio
									}
								]}
							/>
						</Header>
						{#if analysis.values.animations.durations.total}
							<ValueCountList
								id="animation-durations-list"
								node_type="value"
								unique={analysis.values.animations.durations.uniqueWithLocations}
								warnings={Object.keys(analysis.values.animations.durations.unique).filter(
									(duration) => !validate_duration(duration)
								)}
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
									{ name: 'Total', value: analysis.values.animations.timingFunctions.total },
									{
										name: 'Unique',
										value: analysis.values.animations.timingFunctions.totalUnique,
										ratio: analysis.values.animations.timingFunctions.uniquenessRatio
									}
								]}
							/>
						</Header>
						{#if analysis.values.animations.timingFunctions.total > 0}
							<ValueCountList
								id="animation-functions-list"
								node_type="value"
								unique={analysis.values.animations.timingFunctions.uniqueWithLocations}
								extra_sort_options={[sort_az]}
							/>
						{:else}
							<Empty>No durations found.</Empty>
						{/if}
					</Panel>

					<Units units={analysis.values.units} />
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
						{:else if tab_id === 'report'}
							<JsonPanel json={analysis} />
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
		gap: var(--space-8);

		@media (min-width: 66rem) {
			gap: var(--space-16);
		}
	}
</style>
