<script lang="ts">
	import ColorBar from './ColorBar.svelte'
	import type { Sizing } from './ColorBar.ts'
	import type { CssAnalysis } from '#lib/analyze-css.ts'
	import Table from '#lib/components/Table.svelte'
	import type { NormalizedColorWithAuthored } from '@projectwallace/color-sorter'
	import ShowMore from '#lib/components/ShowMore.svelte'

	let {
		items = Object.create(null),
		sizing = 'relative'
	}: {
		items?: CssAnalysis['colors']['by_context']
		sizing?: Sizing
	} = $props()

	let max_colors = $derived.by(() => {
		let _max = 0
		for (let item of items.values()) {
			let total = item.total
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
				total_unique: number
				unique: {
					converted: {
						authored: string
					}
					locations: ArrayLike<unknown>
				}[]
			}
		][]
	>(
		[...items]
			.sort((a, b) => b[1].total - a[1].total)
			.map(([property, item]) => {
				let unique = [] as { converted: { authored: string }; locations: ArrayLike<unknown> }[]
				for (let [value, { count }] of item.unique) {
					unique.push({
						converted: { authored: value },
						locations: new Uint8Array(count)
					})
				}
				return [
					property,
					{
						unique,
						total: item.total,
						total_unique: item.total_unique
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
		<ShowMore collapsible={items_to_render.length > 11}>
			{#snippet children({ status })}
				{#each items_to_render.slice(0, status === 'open' ? Infinity : 11) as [property, item] (property)}
					<tr>
						<th scope="row">
							<code class="specimen">
								{property}
							</code>
						</th>
						<td>
							<div style:inline-size="{(100 * item.total) / max_colors}%">
								<ColorBar colors={item.unique} total={item.total} total_unique={item.total_unique} {sizing} />
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
		inline-size: 100%;
	}
</style>
