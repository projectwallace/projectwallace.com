<script lang="ts">
	import CssSlide from '$components/CssSlide.svelte'
	import { format_number } from '$lib/format-number'
	import Empty from '$components/Empty.svelte'
	import { create_keyboard_list } from './use-keyboard-list.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { highlight_css } from '$components/use-css-highlight'

	// svelte-ignore non_reactive_update
	let table_scroller: HTMLDivElement
	let css_state = get_css_state()
	let {
		elements: { root, item }
	} = create_keyboard_list()

	$effect(() => {
		if (css_state.selected_item !== undefined && table_scroller !== undefined) {
			// Scroll table back to top after changes
			table_scroller.scrollTo(0, 0)
		}
	})

	function onchange({ active_index }: { value: string; active_index: number }) {
		css_state.select_location_at(active_index)
	}
</script>

{#if css_state.selected_item !== undefined}
	<div class="panes" data-testid="inspector">
		<div class="table-scroller scroll-container" bind:this={table_scroller}>
			<table>
				<thead>
					<tr>
						<th scope="col">Value</th>
						<th scope="col" class="location" aria-sort="ascending">Line</th>
					</tr>
				</thead>
				{#key css_state.selected_item.locations}
					<tbody use:root={{ onchange }}>
						{#each css_state.selected_item.locations as location, index}
							{@const css = css_state.css.substring(location.offset, location.offset + location.length)}
							{@const selected = index === css_state.selected_location}
							<tr aria-selected={selected ? 'true' : 'false'} use:item={{ value: String(location.offset) }}>
								<td
									class="value specimen"
									use:highlight_css={{
										css,
										node_type: css_state.selected_item_node_type,
										enabled: css_state.selected_item_node_type !== undefined
									}}
								>
									<!-- Technically this should contain a <code> with the specimen, but the amount of DOM nodes is too damn high -->
									{css}
								</td>
								<td class="location" aria-label={`line ${location.line} column ${location.column}`}>
									{format_number(location.line)}:{format_number(location.column)}
								</td>
							</tr>
						{/each}
					</tbody>
				{/key}
			</table>
		</div>
		{#if css_state.selected_location !== undefined}
			<CssSlide
				css={css_state.css}
				highlight_location={css_state.selected_item.locations.at(css_state.selected_location)}
				allow_copy_highlighted
				on_close={() => css_state.unselect_location()}
			/>
		{/if}
	</div>
{:else}
	<div class="empty">
		<Empty>Click any value in the report to see it's location(s) in the source CSS.</Empty>
	</div>
{/if}

<style>
	.panes {
		display: grid;
		grid-template-columns: 1fr minmax(0, 50ch);
		height: 100%;
		max-height: 100%;
	}

	.table-scroller {
		height: 100%;
		overflow: auto;
		contain: strict;
	}

	.empty {
		margin: var(--space-4);
	}

	table {
		width: 100%;
		color: var(--fg-100);
		border-collapse: collapse;
		font-size: var(--size-specimen);
		--item-usage-location-width: 12ch;
	}

	thead {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		z-index: 2;
	}

	tbody tr {
		cursor: pointer;

		&:nth-child(even) {
			background-color: var(--uneven-tr-bg);
		}

		&[aria-selected='true'] {
			background-color: var(--highlight);
		}
	}

	td,
	th {
		text-align: left;
		padding: var(--space-1) var(--space-2);
		vertical-align: top;
		max-width: 50%;
	}

	td {
		border: 1px solid var(--fg-500);
		position: relative;
	}

	td.value {
		width: calc(100% - var(--item-usage-location-width));
		max-width: calc(40cqi - var(--item-usage-location-width));
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		color: inherit;
		letter-spacing: -0.05em;
		font-size: var(--size-specimen);
	}

	td.location {
		border-right-width: 0;
		width: var(--item-usage-location-width);
		font-variant-numeric: tabular-nums;
	}

	th {
		background-color: var(--bg-200);

		&:not(:last-of-type) {
			border-right: 1px solid var(--fg-500);
		}
	}

	.location {
		text-decoration: underline;
		white-space: nowrap;
	}
</style>
