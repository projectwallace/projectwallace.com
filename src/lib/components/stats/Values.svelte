<script lang="ts">
	import ValueCountList from '$components/stats/ValueCountList.svelte'
	import DefinitionList from '$components/stats/DefinitionList.svelte'
	import { Panel, Header } from '$components/Panel'
	import Empty from '$components/Empty.svelte'
	import Heading from '$components/Heading.svelte'
	import type { CssAnalysis } from '$lib/analyze-css'
	import type { CssLocation } from '$lib/css-location'
	import Units from '$lib/components/stats/Units.svelte'
	import Icon from '$components/Icon.svelte'
	import { page } from '$app/state'
	import Markdown from '$components/Markdown.svelte'
	import { string_sort } from '$lib/string-sort'
	import { normalize_z_index, MAX, INVALID } from '$lib/sort-z-index'

	let { values = Object.create(null) }: { values: CssAnalysis['values'] } = $props()

	// If the current page has a `url` search parameter, append it to the Design Tokens link.
	// Otherwise, link to the Design Tokens section.
	let design_tokens_url = $derived.by(() => {
		let url = new URL('/design-tokens', page.url)
		if (page.url.searchParams.get('url')) {
			// @ts-expect-error TS does not understant that searchParams.has() is a valid type guard
			url.searchParams.append('url', page.url.searchParams.get('url'))
		}
		url.searchParams.set('prettify', page.url.searchParams.get('prettify') === '1' ? '1' : '0')
		return url
	})

	function is_valid_z_index(z_index: string) {
		// If it's a number, it should be a 2^32 integer:
		let index = normalize_z_index(z_index)
		if (index === INVALID) return false
		if (index === MAX) return true
		return index >= -2147483648 && index <= 2147483647
	}

	let { units, zindexes, prefixes, browserhacks, resets } = $derived(values)
	let zindex_locations = $derived(zindexes.uniqueWithLocations) as Record<string, CssLocation[]>
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
					{ name: 'Unique', value: resets.totalUnique }
				]}
			/>
		</Header>
		{#if resets.total > 0}
			<ValueCountList id="resets-list" unique={resets.uniqueWithLocations} />
		{:else}
			<Empty>No spacing resets found.</Empty>
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
						value: zindexes.totalUnique,
						ratio: zindexes.uniquenessRatio
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
					<dfn id="invalid-z-index">
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
						value: prefixes.totalUnique,
						ratio: prefixes.uniquenessRatio
					}
				]}
			/>
		</Header>
		{#if prefixes.total > 0}
			<ValueCountList
				id="prefixed-values-list"
				unique={prefixes.uniqueWithLocations}
				extra_sort_options={[
					{
						label: 'Sort A-Z',
						fn: (a: [string, CssLocation[]], b: [string, CssLocation[]]) => {
							return string_sort(a[0], b[0])
						},
						id: 'alphabetical'
					}
				]}
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
						value: browserhacks.totalUnique,
						ratio: browserhacks.uniquenessRatio
					}
				]}
			/>
		</Header>
		{#if browserhacks.total > 0}
			<ValueCountList
				id="value-hacks-list"
				unique={browserhacks.uniqueWithLocations}
				warnings={Object.keys(browserhacks.unique)}
			/>
		{:else}
			<Empty>No value browserhacks found.</Empty>
		{/if}
	</Panel>
</div>

<style>
	.wrapper {
		display: grid;
		gap: var(--space-4);
		margin-bottom: var(--space-8);

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
		text-decoration: var(--orange-400) wavy underline;
	}
</style>
