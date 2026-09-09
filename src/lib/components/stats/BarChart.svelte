<script lang="ts">
	import { format_number, format_percentage } from '#lib/format-number.js'
	import Meter from '#lib/components/Meter.svelte'
	import type { CssLocation } from '#lib/css-location.js'
	import { create_keyboard_list, type OnChange } from '#lib/components/use-keyboard-list.svelte.js'
	import { get_css_state } from '#lib/css-state.svelte.js'
	import type { NodeType } from '#lib/components/use-css-highlight.js'
	import Table from '#lib/components/Table.svelte'

	let css_state = get_css_state()
	let selected_item = $derived(css_state?.selected_item)

	type ExtraColumn = {
		header: string
		values: (string | number)[]
		formatter?: (value: ExtraColumn['values'][0]) => string
	}

	let {
		items,
		context,
		column_headers = [],
		row_limit = Infinity,
		warnings = [],
		class: className = '',
		enable_keyboard_navigation = true,
		node_type,
		extra_columns = []
	}: {
		items: { value: string; locations?: CssLocation[]; count: number }[]
		context: string
		column_headers?: string[]
		row_limit?: number
		warnings?: string[]
		class?: string
		enable_keyboard_navigation?: boolean
		node_type?: NodeType
		extra_columns?: ExtraColumn[]
	} = $props()

	let {
		elements: { root, item }
	} = create_keyboard_list({
		// svelte-ignore state_referenced_locally
		enabled: enable_keyboard_navigation
	})

	// Getting the max without creating an additional array using .map()
	let max = $derived.by(() => {
		let m = 0

		for (let item of items) {
			let count = item.count
			if (count > m) {
				m = count
			}
		}
		return m
	})

	function onchange({ value, active_index }: Parameters<OnChange>[0]) {
		let item = items[active_index]
		if (item && item.locations) {
			css_state.select_item({
				type: context,
				value,
				locations: item.locations,
				node_type
			})
		}
	}
</script>

<Table class={className}>
	<thead>
		<tr>
			<th scope="col">{column_headers[0] ?? 'Value'}</th>
			<th scope="col">
				{column_headers[1] ?? 'Count'}
			</th>
			{#each extra_columns as extra_column}
				<th scope="col">
					{extra_column.header}
				</th>
			{/each}
			<th scope="col">
				<span class="sr-only">Relative count</span>
			</th>
		</tr>
	</thead>
	<tbody use:root={{ onchange }} style:--meter-bg="transparent" style:--meter-height="0.5em">
		{#each items.slice(0, row_limit) as { value, count }, index (value)}
			{@const is_selected = selected_item?.value === value && selected_item.type === context}
			<tr
				use:item={{ value }}
				class:clickable={enable_keyboard_navigation}
				aria-selected={is_selected ? 'true' : 'false'}
			>
				<td class:warning={warnings.includes(value)}>
					<!-- Technically this should contain a <code> with the specimen, but the amount of DOM nodes is too damn high -->
					{value}
				</td>
				<td class="numeric">
					{Number.isInteger(count) ? format_number(count) : format_percentage(count)}
				</td>
				{#each extra_columns as extra_column}
					{@const value = extra_column.values.at(index) ?? 'N/A'}
					<td class="numeric">
						{Number.isInteger(value) ? format_number(value) : value}
					</td>
				{/each}
				<td>
					<Meter value={count} {max} />
				</td>
			</tr>
		{/each}
	</tbody>
</Table>

<style>
	td:first-child {
		text-align: end;
		font-weight: var(--font-normal);
		font-variant-numeric: tabular-nums;

		&,
		& + td {
			width: var(--space-16);
		}
	}

	th:not(:first-of-type),
	td {
		padding-inline-start: var(--space-4);
	}

	td {
		text-align: end;
		color: inherit;

		&:last-child {
			width: 100%;
		}
	}

	tbody tr {
		outline-offset: -1px;
		line-height: var(--leading-none);

		&:nth-child(even) {
			background-color: var(--uneven-tr-bg);
		}

		&:nth-child(2n + 1) {
			background-color: transparent;
		}

		&.clickable {
			cursor: pointer;
		}
	}
</style>
