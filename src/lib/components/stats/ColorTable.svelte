<script lang="ts">
	import ColorBar from './ColorBar.svelte'
	import type { Sizing } from './ColorBar'
	import type { CssAnalysis } from '$lib/analyze-css'
	import Table from '$components/Table.svelte'
	import type { NormalizedColorWithAuthored } from 'color-sorter'
	import type { CssLocation } from '$lib/css-location'
	import ShowMore from '$components/ShowMore.svelte'
	import type { UniqueWithLocations } from '@projectwallace/css-analyzer'

	let {
		items = Object.create(null),
		sizing = 'relative'
	}: {
		items?: CssAnalysis['values']['colors']['itemsPerContext']
		sizing?: Sizing
	} = $props()

	type Item = {
		unique: { converted: NormalizedColorWithAuthored; locations: CssLocation[] }[]
		total: number
		totalUnique: number
		uniqueWithLocations: UniqueWithLocations
	}

	let max_colors = $derived.by(() => {
		let _max = 0
		for (let key in items) {
			let total = items[key].total
			if (total > _max) {
				_max = total
			}
		}
		return _max
	})

	let items_to_render = $derived<
		[
			string,
			{
				total: number
				totalUnique: number
				unique: {
					converted: {
						authored: string
					}
					locations: ArrayLike<unknown>
				}[]
			}
		][]
	>(
		Object.entries(items)
			.sort((a, b) => b[1].total - a[1].total)
			.map(([property, item]: [string, Item]) => {
				let unique = [] as { converted: { authored: string }; locations: ArrayLike<unknown> }[]
				for (let [value, locations] of Object.entries(item.uniqueWithLocations)) {
					unique.push({
						converted: { authored: value },
						locations: new Uint8Array((locations as {}[]).length)
					})
				}
				return [
					property,
					{
						unique,
						total: item.total,
						totalUnique: item.totalUnique
					}
				]
			})
	)
</script>

<Table>
	<thead>
		<tr>
			<th scope="col">Property</th>
			<th scope="col">Colors</th>
		</tr>
	</thead>
	<tbody style:--color-bar-height="1em">
		<ShowMore initial_open={items_to_render.length <= 11} closable={items_to_render.length > 11}>
			{#snippet children({ status })}
				{#each items_to_render.slice(0, status === 'open' ? Infinity : 11) as [property, item] (property)}
					<tr>
						<th scope="row">
							<code class="specimen">
								{property}
							</code>
						</th>
						<td>
							<div style:width="{(100 * item.total) / max_colors}%">
								<ColorBar colors={item.unique} total={item.total} totalUnique={item.totalUnique} {sizing} />
							</div>
						</td>
					</tr>
				{/each}
			{/snippet}
		</ShowMore>
	</tbody>
</Table>

<style>
	code {
		@media (min-width: 33rem) {
			white-space: nowrap;
		}
	}

	td {
		width: 100%;
	}
</style>
