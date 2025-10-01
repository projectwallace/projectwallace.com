<script lang="ts">
	import type { CssLocation } from '$lib/css-location'
	import FilterGroup from '$lib/components/FilterGroup.svelte'
	import FilterOption from '$components/FilterOption.svelte'
	import { create_keyboard_list, type OnChange } from '$components/use-keyboard-list.svelte'
	import Table from '$components/Table.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { type NodeType } from '$components/use-css-highlight'

	type UniqueWithLocations = Record<string, CssLocation[]>

	let css_state = get_css_state()
	let {
		elements: { root, item }
	} = create_keyboard_list()

	interface Props {
		id: string
		unique?: UniqueWithLocations
		warnings?: string[]
		extra_sort_options?: {
			label: string
			id: string
			fn: (a: [string, CssLocation[]], b: [string, CssLocation[]]) => number
		}[]
		node_type?: NodeType
	}

	let { id, unique = Object.create(null), warnings = [], extra_sort_options = [], node_type }: Props = $props()

	let default_sortings = [
		{
			label: 'Sort by source order',
			fn: () => -1,
			id: 'source-order'
		},
		{
			label: 'Sort by count',
			fn: (a: [string, CssLocation[]], b: [string, CssLocation[]]) => {
				return b[1].length - a[1].length
			},
			id: 'count'
		}
	]

	let sorting = $state(default_sortings[0].id)
	let sortings = $derived([...default_sortings, ...extra_sort_options])
	let sorted = $derived.by(() => {
		for (let sort of sortings) {
			if (sorting === sort.id) {
				return Object.entries(unique).sort(sort.fn)
			}
		}
		return []
	})

	function onchange({ value }: Parameters<OnChange>[0]) {
		css_state.select_item({
			type: id,
			value,
			locations: unique[value],
			node_type
		})
	}
</script>

<div class="layout">
	<FilterGroup>
		<legend class="sr-only">Sorting</legend>

		{#each [...default_sortings, ...extra_sort_options] as sort (sort.id)}
			<FilterOption bind:group={sorting} value={sort.id} id="sort-{id}-{sort.id}" name="{id}-sorting">
				{sort.label}
			</FilterOption>
		{/each}
	</FilterGroup>

	{#key sorting}
		<Table>
			<thead>
				<tr>
					<th scope="col" class="numeric" aria-sort={sorting === 'count' ? 'descending' : undefined}> Count </th>
					<th scope="col" aria-sort={sorting !== 'source-order' && sorting !== 'count' ? 'ascending' : undefined}>
						Value
					</th>
				</tr>
			</thead>
			<tbody use:root={{ onchange }}>
				{#each sorted as [value, locations_or_count] (value)}
					<tr
						use:item={{ value }}
						aria-selected={css_state.selected_item?.value === value && id === css_state.selected_item.type
							? 'true'
							: 'false'}
					>
						<td class="numeric specimen">{locations_or_count.length}</td>
						<td class="language-css specimen" class:warning={warnings.includes(value)}>
							<!-- Technically this should contain a <code> with the specimen, but the amount of DOM nodes is too damn high -->
							{value}
						</td>
					</tr>
				{/each}
			</tbody>
		</Table>
	{/key}
</div>

<style>
	.layout {
		display: grid;
		gap: var(--space-3);
	}

	tbody tr {
		cursor: pointer;
	}

	td {
		color: inherit;
	}

	[aria-selected='false']:hover {
		outline: 1px solid var(--fg-450);
		outline-offset: -1px;
	}

	[aria-selected='true'] {
		background-color: var(--highlight);
	}

	.warning {
		text-decoration: var(--orange-400) wavy underline;
	}

	td:last-child {
		width: 100%;
	}
</style>
