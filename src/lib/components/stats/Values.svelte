<script lang="ts">
	import { with_css_params } from '#lib/css-url-params.ts'
	import ValueCountList from '#lib/components/stats/ValueCountList.svelte'
	import DefinitionList from '#lib/components/stats/DefinitionList.svelte'
	import { Panel, Header } from '#lib/components/Panel/index.ts'
	import Empty from '#lib/components/Empty.svelte'
	import Heading from '#lib/components/Heading.svelte'
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import type { CssLocation } from '#lib/css-location.ts'
	import { summarize } from '@projectwallace/css-analyzer'
	import { with_locations } from '#lib/analysis-locations.ts'
	import Units from '#lib/components/stats/Units.svelte'
	import Icon from '#lib/components/Icon.svelte'
	import { page } from '$app/state'
	import Markdown from '#lib/components/Markdown.svelte'
	import { alphabetical_sorting } from './sorting.ts'
	import { normalize_z_index, MAX, INVALID } from '#lib/sort-z-index.ts'

	let { result = Object.create(null) }: { result: CssAnalysis } = $props()

	// If the current page has a `url` search parameter, append it to the Design Tokens link.
	// Otherwise, link to the Design Tokens section.
	let design_tokens_url = $derived.by(() => {
		return with_css_params(new URL('/design-tokens', page.url.href), {
			url: page.url.searchParams.get('url') || undefined,
			prettify: page.url.searchParams.get('prettify') === '1'
		})
	})

	function is_valid_z_index(z_index: string) {
		// If it's a number, it should be a 2^32 integer:
		let index = normalize_z_index(z_index)
		if (index === INVALID) {
			return false
		}
		if (index === MAX) {
			return true
		}
		return index >= -2147483648 && index <= 2147483647
	}

	let {
		units,
		z_indexes: zindexes,
		value_prefixes: prefixes,
		value_browserhacks: browserhacks,
		resets,
		displays
	} = $derived(result)
	let zindex_locations = $derived(with_locations(zindexes))
	let z_index_warnings = $derived(Object.keys(zindex_locations).filter((zindex) => !is_valid_z_index(zindex)))
</script>

<div class="wrapper" id="values">
	<Heading element="h2">Values</Heading>

	<Units {units} />

	<Panel>
		<p class="design-tokens-warning">
			<Markdown>
				<Icon name="warning" size={24} />
				Looking for Design Tokens? They have moved to the
				<a href={design_tokens_url.toString()}>Design Tokens</a>
				section.
				<Icon name="chevron-right" size={16} />
			</Markdown>
		</p>
	</Panel>

	<Panel id="resets">
		<Header>
			<Heading element="h3">Spacing resets</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: resets.total },
					{ name: 'Unique', value: resets.total_unique }
				]}
			/>
		</Header>
		{#if resets.total > 0}
			<ValueCountList id="resets-list" unique={with_locations(resets)} extra_sort_options={[alphabetical_sorting]} />
		{:else}
			<Empty>No spacing resets found.</Empty>
		{/if}
	</Panel>

	<Panel id="displays">
		<Header>
			<Heading element="h3">Display values</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: displays.total },
					{ name: 'Unique', value: displays.total_unique }
				]}
			/>
		</Header>
		{#if displays.total > 0}
			<ValueCountList
				id="displays-list"
				unique={with_locations(displays)}
				extra_sort_options={[alphabetical_sorting]}
			/>
		{:else}
			<Empty>No spacing displays found.</Empty>
		{/if}
	</Panel>

	<Panel id="z-indexes">
		<Header>
			<Heading element="h3">Z-indexes</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: zindexes.total },
					{
						name: 'Unique',
						value: zindexes.total_unique,
						ratio: summarize(zindexes).uniqueness_ratio
					}
				]}
			/>
		</Header>
		{#if zindexes.total > 0}
			<ValueCountList
				id="z-indexes"
				unique={zindex_locations}
				extra_sort_options={[
					{
						label: 'Sort by number',
						fn: (a: [string, CssLocation[]], b: [string, CssLocation[]]) => {
							return normalize_z_index(a[0]) - normalize_z_index(b[0])
						},
						id: 'numeric'
					}
				]}
				warnings={z_index_warnings}
			/>
			{#if z_index_warnings.length > 0}
				<p>
					<dfn id="invalid-z-index" class="warning">
						🚫 :
						<a href="https://www.w3.org/TR/CSS21/syndata.html#numbers" rel="external" target="_blank">
							This value might not work because it is not a valid 32-bit integer.
						</a>
					</dfn>
				</p>
			{/if}
		{:else}
			<Empty>No z-indexes found.</Empty>
		{/if}
	</Panel>

	<Panel id="prefixed-values">
		<Header>
			<Heading element="h3">Vendor-prefixed values</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: prefixes.total },
					{
						name: 'Unique',
						value: prefixes.total_unique,
						ratio: summarize(prefixes).uniqueness_ratio
					}
				]}
			/>
		</Header>
		{#if prefixes.total > 0}
			<ValueCountList
				id="prefixed-values-list"
				unique={with_locations(prefixes)}
				extra_sort_options={[alphabetical_sorting]}
			/>
		{:else}
			<Empty>No vendor prefixed values found.</Empty>
		{/if}
	</Panel>

	<Panel id="value-browserhacks">
		<Header>
			<Heading element="h3">Value browserhacks</Heading>
			<DefinitionList
				stats={[
					{ name: 'Total', value: browserhacks.total },
					{
						name: 'Unique',
						value: browserhacks.total_unique,
						ratio: summarize(browserhacks).uniqueness_ratio
					}
				]}
			/>
		</Header>
		{#if browserhacks.total > 0}
			<ValueCountList
				id="value-hacks-list"
				unique={with_locations(browserhacks)}
				warnings={[...browserhacks.unique.keys()]}
				extra_sort_options={[alphabetical_sorting]}
			/>
		{:else}
			<Empty>No value browserhacks found.</Empty>
		{/if}
	</Panel>
</div>

<style>
	.wrapper {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: var(--space-4);
		margin-block-end: var(--space-8);

		@media (min-width: 66rem) {
			gap: var(--space-8);
		}
	}

	.design-tokens-warning {
		font-size: var(--size-lg);
		text-align: center;
		font-weight: var(--font-bold);
		color: var(--fg-0);

		:global(.icon:first-child) {
			fill: var(--yellow-400);
		}

		:global(.icon:last-child) {
			fill: var(--accent);
		}
	}

	dfn {
		font-style: normal;
	}
</style>
