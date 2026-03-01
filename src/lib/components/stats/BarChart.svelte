<script lang="ts">
	import { format_number, format_percentage } from '$lib/format-number'
	import Meter from '$components/Meter.svelte'
	import type { CssLocation } from '$lib/css-location'
	import { create_keyboard_list, type OnChange } from '$components/use-keyboard-list.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import type { NodeType } from '$components/use-css-highlight'
	import Table from '$components/Table.svelte'

	let css_state = get_css_state()
	let selected_item = $derived(css_state?.selected_item)

	let {
		items,
		context,
		column_headers = [],
		row_limit = Infinity,
		warnings = [],
		class: className = '',
		enable_keyboard_navigation = true,
		node_type
	}: {
		items: { value: string; locations?: CssLocation[]; count: number }[]
		context: string
		column_headers?: string[]
		row_limit?: number
		warnings?: string[]
		class?: string
		enable_keyboard_navigation?: boolean
		node_type?: NodeType
	} = $props()

	let {
		elements: { root, item }
	} = create_keyboard_list({
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
			<th scope="col">
				<span class="sr-only">Relative count</span>
			</th>
		</tr>
	</thead>
	<tbody use:root={{ onchange }} style:--meter-bg="transparent" style:--meter-height="0.5em">
		{#each items.slice(0, row_limit) as { value, count } (value)}
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
				<td class="count">
					{Number.isInteger(count) ? format_number(count) : format_percentage(count)}
				</td>
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

		&.warning {
			text-decoration: var(--orange-400) wavy underline;
		}

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

	.count {
		font-variant-numeric: tabular-nums;
		letter-spacing: -0.1ch;
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

			&:where(:not([aria-selected='true']):hover) {
				outline: 1px solid var(--bg-400);
			}
		}

		&[aria-selected='true'] {
			background-color: var(--highlight);
		}
	}
</style>
