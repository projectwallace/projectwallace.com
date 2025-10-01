<script lang="ts">
	import { PaneGroup, Pane, PaneResizer } from 'paneforge'
	import { format_filesize } from '$lib/format-filesize'
	import { format_number } from '$lib/format-number'
	import CssSlide from './CssSlide.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { string_sort } from '$lib/string-sort'

	let css_state = get_css_state()

	type OriginsSort = 'size' | 'type' | 'url' | 'rel' | 'media'
	type SortDirection = 'ascending' | 'descending'

	let sort_by = $state<OriginsSort | undefined>()
	let sort_direction = $state<SortDirection | undefined>()
	let enabled_origins = $state<number[]>(Array.from(css_state.enabled_origins))
	let checkbox_state = $derived({
		checked: enabled_origins.length === css_state.origins.length,
		indeterminate: enabled_origins.length > 0 && enabled_origins.length < css_state.origins.length
	})

	let sorted = $derived.by(() => {
		let items = Uint8Array.from({ length: css_state.origins.length }, (_, index) => index)
		return items.sort((_a, _b) => {
			let a = css_state.origins.at(_a)!
			let b = css_state.origins.at(_b)!

			switch (sort_by) {
				case 'size': {
					return sort_direction === 'descending' ? b.css.length - a.css.length : a.css.length - b.css.length
				}
				case 'type': {
					return sort_direction === 'descending' ? string_sort(a.type, b.type) : string_sort(b.type, a.type)
				}
				case 'url': {
					return sort_direction === 'descending'
						? // @ts-expect-error we provide a fallback value for url
							string_sort(a.href || '', b.href || '')
						: // @ts-expect-error we provide a fallback value for url
							string_sort(b.href || '', a.href || '')
				}
				case 'media': {
					return sort_direction === 'descending'
						? // @ts-expect-error we provide a fallback value for media
							string_sort(b.media || '', a.media || '')
						: // @ts-expect-error we provide a fallback value for media
							string_sort(a.media || '', b.media || '')
				}
				case 'rel': {
					return sort_direction === 'descending'
						? // @ts-expect-error we provide a fallback value for rel
							string_sort(a.rel || '', b.rel || '')
						: // @ts-expect-error we provide a fallback value for rel
							string_sort(b.rel || '', a.rel || '')
				}
				default: {
					return 0
				}
			}
		})
	})

	let total_size = $derived(
		css_state.origins.reduce((total, origin) => {
			return (total += origin.css.length)
		}, 0)
	)
	let disabled_size = $derived(
		css_state.origins.reduce((total, origin, index) => {
			if (!enabled_origins.includes(index)) {
				total += origin.css.length
			}
			return total
		}, 0)
	)

	function on_select_all_change(event: Event) {
		let input = event.target as HTMLInputElement

		if (input.checked) {
			css_state.enable_all_origins()
			enabled_origins = css_state.origins.map((_, index) => index)
		} else {
			css_state.disable_all_origins()
			enabled_origins = []
		}
	}

	function on_table_click(event: MouseEvent) {
		let target = event.target as HTMLElement

		// Clicking the checkbox should not open the slide
		if (target.tagName === 'INPUT') {
			event.stopPropagation()
			return
		}

		let tr = target.closest('tr')
		if (tr === null) return

		let index = tr.sectionRowIndex

		// Try to focus the first focusable element in the slide: <a> for any file or <button> for local files
		let first_focusable = tr.querySelector('a, button') as HTMLElement | null
		if (first_focusable !== null) {
			first_focusable.focus()
		}

		let mapped_index = sorted[index]
		if (mapped_index === undefined) return

		let origin = css_state.origins.at(mapped_index)
		if (origin === undefined) return

		if (event.metaKey || event.shiftKey || event.ctrlKey) {
			if (origin.type === 'local-file') {
				window.open(`data:text/json;charset=utf-8,${encodeURIComponent(css_state.get_css_at(mapped_index))}`)
			} else {
				return
			}
		}

		event.preventDefault()
		css_state.select_origin_at(mapped_index)
	}
</script>

{#snippet sorted_th(name: OriginsSort, label: string)}
	{@const sort_by_attr = sort_by === name ? (sort_direction === 'ascending' ? 'ascending' : 'descending') : undefined}
	<th scope="col" aria-sort={sort_by_attr}>
		<button
			class="sort-button"
			aria-pressed={sort_by === name}
			onclick={() => {
				sort_by = name
				sort_direction = sort_direction === 'ascending' ? 'descending' : 'ascending'
			}}
		>
			{label}
			<span class="sort-indicator" aria-hidden="true">
				{#if sort_by === name}
					{sort_direction === 'ascending' ? '▲' : '▼'}
				{/if}
			</span>
		</button>
	</th>
{/snippet}

<div class="network">
	<div class="network-body">
		<PaneGroup direction="horizontal" data-testid="network-panel" autoSaveId="network-panel">
			<Pane defaultSize={50} minSize={20}>
				<div class="table-scroller scroll-container">
					<table>
						<thead>
							<tr>
								<th scope="col">
									<label for="toggle-all-origins" class="sr-only">Toggle all sources</label>
									<input
										type="checkbox"
										id="toggle-all-origins"
										onchange={on_select_all_change}
										checked={checkbox_state.checked}
										indeterminate={checkbox_state.indeterminate}
									/>
								</th>
								{@render sorted_th('url', 'URL')}
								{@render sorted_th('type', 'Type')}
								{@render sorted_th('size', 'Size')}
								{@render sorted_th('rel', 'Rel')}
								{@render sorted_th('media', 'Media')}
							</tr>
						</thead>
						<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
						<!-- svelte-ignore a11y_click_events_have_key_events -->
						<tbody onclick={on_table_click}>
							{#each sorted as origin_index (origin_index)}
								{@const origin = css_state.origins.at(origin_index)!}
								{@const link =
									'url' in origin ? origin.url : 'href' in origin ? origin.href : 'name' in origin ? origin.name : ''}
								<tr aria-selected={origin_index === css_state.selected_origin ? 'true' : 'false'} data-testid="css-origin">
									<td class="select">
										<label for="css-origin-{origin_index}" class="sr-only">
											Enable source {origin.type} ({format_number(origin.css.length)} bytes)
										</label>
										<input
											type="checkbox"
											id="css-origin-{origin_index}"
											value={origin_index}
											name="enabled-origins"
											bind:group={enabled_origins}
										/>
									</td>
									<td class="url">
										{#if origin.type === 'raw'}
											{origin.css.substring(0, 64)}&hellip;
										{:else}
											<a href={link} target="_blank" rel="noreferrer" aria-label="Link to origin">
												{#if origin.type == 'link' && origin.href.startsWith('data:')}
													{origin.href.substring(0, 64)}&hellip;
												{/if}
												{link}
											</a>
										{/if}
									</td>
									<td aria-label="type">
										{origin.type}
									</td>
									<td aria-label="filesize" class="filesize">
										{format_filesize(origin.css.length)}
									</td>
									<td aria-label="rel">
										{#if 'rel' in origin}
											{origin.rel}
										{/if}
									</td>
									<td aria-label="media">
										{#if 'media' in origin && origin.media != null}
											{origin.media}
										{/if}
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</Pane>
			{#if css_state.selected_origin !== undefined}
				<PaneResizer>
					<div class="pane-resizer"></div>
				</PaneResizer>
				<Pane defaultSize={50} minSize={0}>
					<CssSlide
						css={css_state.get_css_at(css_state.selected_origin)}
						allow_copy
						allow_prettify
						on_close={() => css_state.unselect_origin()}
					/>
				</Pane>
			{/if}
		</PaneGroup>
	</div>

	<ul class="network-totals">
		<li data-testid="network-total-filesize">{format_filesize(total_size)} transferred</li>
		<li>
			<span data-testid="network-origins-count">
				{enabled_origins.length}
			</span>
			sources
			{#if enabled_origins.length !== css_state.origins.length}
				({css_state.origins.length - enabled_origins.length} hidden by filter)
			{/if}
		</li>
		{#if disabled_size !== 0}
			<li>
				<span data-testid="network-enabled-filesize">{format_filesize(disabled_size)}</span>
				hidden
			</li>
		{/if}
	</ul>
</div>

<style>
	:global {
		[data-pane-group] {
			height: 100%;
		}

		[data-pane] {
			will-change: flex;
			height: 100%;
			contain: strict;
		}

		[data-pane-resizer] {
			width: var(--space-1);
			display: flex;
			align-items: center;
			justify-content: center;

			&:is(:hover, :focus) .pane-resizer {
				opacity: 1;
			}
		}
	}

	.pane-resizer {
		height: 100%;
		width: 0.25rem;
		opacity: 0;
		background-color: var(--accent-600);
		transition: opacity 200ms;
	}

	.network {
		position: relative;
		height: 100%;
		display: grid;
		grid-template-rows: 1fr auto;
		max-height: 100%;
	}

	.network-totals {
		display: flex;
		position: sticky;
		bottom: 0;
		inset-inline: 0;
		z-index: 1;
		border-top: 1px solid var(--fg-450);
		padding-inline: var(--space-2);
		gap: var(--space-4);
		font-size: var(--size-sm);
		background-color: var(--bg-200);
	}

	.table-scroller {
		overflow: auto;
		height: 100%;
		max-height: 100%;
		position: relative;
	}

	table {
		width: 100%;
		color: var(--fg-0);
		border-collapse: collapse;
		font-size: var(--size-specimen);
		position: relative;
	}

	thead {
		position: sticky;
		top: 0;
		inset-inline: 0;
		z-index: 2;
	}

	th {
		background-color: var(--bg-200);
	}

	th:not(:last-of-type) {
		border-right: 1px solid var(--fg-450);
	}

	.sort-button {
		display: flex;
		width: 100%;
		justify-content: space-between;
		gap: var(--space-2);
	}

	.sort-indicator {
		font-size: var(--size-xs);
		color: var(--fg-400);
	}

	tbody tr {
		cursor: pointer;
	}

	:where(tbody tr:nth-child(odd)) {
		background-color: var(--uneven-tr-bg);
	}

	td,
	th {
		text-align: left;
		padding: var(--space-1) var(--space-2);
		white-space: nowrap;
	}

	td {
		border: 1px solid var(--fg-450);
		position: relative;
	}

	/* Expand the URL column to be as wide as possible */
	td:nth-of-type(2) {
		width: 100%;
	}

	tbody tr {
		position: relative;

		&[aria-selected='true'] {
			background-color: var(--highlight);
		}
	}

	tbody a::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	th button {
		display: block;
		white-space: nowrap;
		width: 100%;
		text-align: left;
	}

	.select {
		z-index: 1;
		position: relative;
	}
</style>
