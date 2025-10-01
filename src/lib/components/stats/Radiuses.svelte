<script lang="ts">
	import type { CssAnalysis } from '$lib/analyze-css'
	import type { CssLocation } from '$lib/css-location'
	import FilterGroup from '$lib/components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { string_sort } from '$lib/string-sort'
	import ShowMore from '$components/ShowMore.svelte'

	let css_state = get_css_state()
	let selected_item = $derived(css_state.selected_item)

	interface Props {
		items?: CssAnalysis['values']['borderRadiuses']
	}

	let { items = Object.create(null) }: Props = $props()

	let as_authored = '1' as const
	let by_count = '2' as const
	let alphabetically = '3' as const
	type Sorting = typeof as_authored | typeof by_count | typeof alphabetically
	let sorting: Sorting = $state(as_authored)

	let { itemsPerContext } = $derived(items)
	let flattened = $derived(
		Object.entries(itemsPerContext).flatMap(([property, data]) => {
			// @ts-expect-error Incorrect type from analyze-css
			let uniqueWithLocations = data.uniqueWithLocations as Record<string, CssLocation[]>
			return Object.entries(uniqueWithLocations).map(([value, locations]) => {
				return {
					property,
					value,
					locations
				}
			})
		})
	)
	let radiuses = $derived.by(() => {
		if (sorting === as_authored) {
			return flattened
		}
		return flattened.slice().sort((a, b) => {
			if (sorting === by_count) {
				return b.locations.length - a.locations.length
			}

			return string_sort(a.value, b.value)
		})
	})
</script>

<div class="group">
	<FilterGroup>
		<legend class="sr-only">Sorting border radiuses</legend>
		<FilterOption bind:group={sorting} name="border-radius-sorting" value={as_authored}>
			Sort by source order
		</FilterOption>
		<FilterOption bind:group={sorting} name="border-radius-sorting" value={by_count}>Sort by count</FilterOption>
		<FilterOption bind:group={sorting} name="border-radius-sorting" value={alphabetically}>Sort by A-Z</FilterOption>
	</FilterGroup>

	<ShowMore initial_open={radiuses.length <= 15} closable={radiuses.length > 15}>
		{#snippet children({ status })}
			<ul class="radiuses">
				{#each radiuses.slice(0, status === 'open' ? Infinity : 15) as { property, value, locations }, index}
					<li
						class="radius"
						class:active={selected_item?.type === 'border-radius' && selected_item.value === `${property}: ${value}`}
					>
						<div class="example" style="{property}: {value}"></div>
						<code class="specimen">{property}: {value}</code>
						<span class="count">{locations.length} &times;</span>
						<button
							onclick={() => {
								css_state.select_item({
									type: 'border-radius',
									node_type: 'value',
									value: `${property}: ${value}`,
									locations
								})
							}}
						>
							<span class="sr-only">View usage details</span>
						</button>
					</li>
				{/each}
			</ul>
		{/snippet}
	</ShowMore>
</div>

<style>
	.group {
		display: grid;
		gap: var(--space-4);
	}

	.radiuses {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
	}

	.radius {
		position: relative;
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: var(--space-2);
		padding: var(--space-2);
		border: 1px solid var(--fg-500);

		&:focus-within {
			border-color: var(--fg-200);
		}
	}

	.active {
		&,
		&:focus-within {
			border-color: var(--accent);
		}
	}

	.example {
		width: var(--space-12);
		height: var(--space-12);
		background-color: var(--bg-700);
	}

	button {
		font-size: 0.1px;
		line-height: 0.1px;
		color: rgb(0 0 0 / 0);
		padding: 0;
		border: 0;
		outline: none;
		position: absolute;
		inset: 0;
		height: 100%;
		width: 100%;
		cursor: pointer;
	}

	code {
		color: var(--fg-300);
	}

	.count {
		line-height: var(--leading-none);
	}
</style>
