<script lang="ts">
	import { createTreeView } from '@melt-ui/svelte'
	import { setContext } from 'svelte'
	import Tree, { type TreeItem } from './Tree.svelte'
	import Icon from '$components/Icon.svelte'
	import CopyButton from '$components/CopyButton.svelte'
	import Pre from '$components/Pre.svelte'
	import { analyze } from './analyze-custom-properties'
	import type { CssLocation } from '$lib/css-location'
	import Empty from '$components/Empty.svelte'
	import DevTools from '$components/DevTools.svelte'
	import { network, properties, type TabId } from '$components/devtools/tabs'
	import JsonPanel from '$components/devtools/JsonPanel.svelte'
	import NetworkPanel from '$components/NetworkPanel.svelte'
	import { get_css_state } from '$lib/css-state.svelte'

	let css_state = get_css_state()
	let css = $derived(css_state.css)
	let result = $derived(analyze(css))
	let search_query: string = $state('')
	let filter_unused: boolean = $state(false)
	let filter_undefined: boolean = $state(false)
	let filter_with_fallback: boolean = $state(false)
	let search_results = $derived.by<Map<string, CssLocation[]>>(() => {
		let query = search_query.toLowerCase().trim()
		if (query === '' || query === '!') return result.all
		let filtered = new Map<string, CssLocation[]>()
		for (let [name, locations] of result.all) {
			let searchable_name = name.toLowerCase()
			// Allow searching with `!` to exclude results
			if (query.charAt(0) === '!' && !searchable_name.includes(query.slice(1))) {
				filtered.set(name, locations)
				continue
			}
			// Normal search
			if (searchable_name.includes(query)) {
				filtered.set(name, locations)
			}
		}
		return filtered
	})
	let filtered_results = $derived.by<Map<string, CssLocation[]> | undefined>(() => {
		if (result) {
			return filter_results(
				search_results,
				result.unused,
				result.undeclared,
				result.undeclared_with_fallback,
				filter_unused,
				filter_undefined,
				filter_with_fallback
			)
		}
	})

	$effect(() => {
		if (css) {
			// Reset expanded items when CSS changes to avoid null-pointers
			expanded.set([])
			// eslint-disable-next-line eslint-plugin-unicorn/no-null
			$selectedItem = null
			search_query = ''
		}
	})

	let tree_items = $derived.by<TreeItem[]>(() => {
		if (!filtered_results) return []
		return Array.from(filtered_results, ([property_name, locations]) => {
			let level = 0
			if (result.undeclared.has(property_name)) {
				level = 2
			} else if (result.unused.has(property_name)) {
				level = 1
			} else if (result.undeclared_with_fallback.has(property_name)) {
				level = 3
			}
			return {
				title: property_name,
				name: property_name.slice(2),
				count: locations.length,
				type: 'property',
				level,
				search_query,
				children: locations.map((location, index) => {
					let name = css.slice(location.offset, location.offset + location.length)
					return {
						title: name,
						name,
						index: index,
						type: 'location',
						parent: property_name,
						location,
						level
					}
				})
			}
		}) as TreeItem[]
	})

	function filter_results(
		items: Map<string, CssLocation[]>,
		unused_properties: Set<string>,
		undeclared_properties: Set<string>,
		undeclared_with_fallback: Set<string>,
		filter_unused: boolean,
		filter_undefined: boolean,
		filter_with_fallback: boolean
	) {
		if (filter_unused === false && filter_undefined === false && filter_with_fallback === false) {
			return items
		}

		let filtered = new Map<string, CssLocation[]>()

		for (let [name, locations] of items) {
			if (filter_unused === true && unused_properties.has(name)) {
				filtered.set(name, locations)
				continue
			}

			if (filter_undefined === true && undeclared_properties.has(name)) {
				filtered.set(name, locations)
				continue
			}

			if (filter_with_fallback === true && undeclared_with_fallback.has(name)) {
				filtered.set(name, locations)
				continue
			}
		}

		return filtered
	}

	let ctx = createTreeView({
		forceVisible: false
	})
	setContext('tree', ctx)

	let {
		elements: { tree },
		states: { selectedItem, expanded }
	} = ctx

	let selected_item = $derived.by(() => {
		if ($selectedItem) {
			const data = JSON.parse($selectedItem.dataset.item as string)
			let locations = result.all.get(data.title)!
			return {
				location: data.type === 'property' ? locations.at(0) : data.location,
				locations
			}
		}
	})

	function onsearch(event: SubmitEvent) {
		event.preventDefault()
	}

	function reset_filters() {
		filter_undefined = false
		filter_unused = false
		filter_with_fallback = false
	}
</script>

<div class="wrapper">
	<section class="editor">
		<header>
			<h2>Analyzed CSS</h2>
			<CopyButton variant="minimal" text={css}>Copy CSS</CopyButton>
		</header>
		<Pre
			{css}
			selected_location={selected_item && selected_item.location}
			locations={selected_item && selected_item.locations}
			line_numbers
		/>
	</section>
	<section class="list">
		<header>
			<h2>Properties</h2>
			<button type="button" onclick={() => expanded.set([])} class="collapse-all">
				<Icon name="fold" size={14} />
				<div class="sr-only">Collapse all</div>
			</button>
			<search>
				<form method="GET" onsubmit={onsearch}>
					<label for="search-property" class="sr-only">Search property name</label>
					<input
						type="search"
						placeholder={'search-my-property'}
						name="propery"
						id="search-property"
						bind:value={search_query}
						spellcheck="false"
						autocorrect="off"
						autocapitalize="off"
						autocomplete="off"
					/>
					<button type="submit" class="sr-only" tabindex="-1">Search</button>
					{#if filtered_results !== undefined && filtered_results.size > 0 && search_query.trim().length > 0}
						<p class="search-info" data-testid="search-info">
							{filtered_results.size}
							{filtered_results.size === 1 ? 'property' : 'properties'} shown,
							{result.all.size - filtered_results.size} hidden by search
						</p>
						<button type="reset">Clear search</button>
					{/if}
				</form>
			</search>
		</header>
		{#if result.all.size !== 0}
			{#if filtered_results !== undefined && filtered_results.size === 0}
				<div class="empty-wrapper">
					<Empty>
						No properties matching the search or filters.
						<button
							class="clear-search"
							onclick={() => {
								search_query = ''
								reset_filters()
							}}>Clear all</button
						>?
					</Empty>
				</div>
			{:else}
				<ul {...$tree} class="tree-root scroll-container">
					<Tree items={tree_items} {search_query} />
				</ul>
			{/if}
		{/if}

		{#if css.length !== 0 && result.all.size === 0}
			<div class="empty-wrapper" data-testid="empty">
				<Empty>No custom properties found in the CSS.</Empty>
			</div>
		{/if}
	</section>

	<div class="summary">
		{#if selected_item}
			<div class="current-location">
				Line {selected_item.location.line}, Column {selected_item.location.column}
			</div>
		{/if}
		<div class="filters">
			<button onclick={reset_filters}>
				Total: {result.all.size}
			</button>
			<button
				class:warning={result.unused.size > 0}
				onclick={() => (filter_unused = !filter_unused)}
				aria-pressed={filter_unused}
			>
				Unused: {result.unused.size}
			</button>
			<button
				class:error={result.undeclared.size > 0}
				onclick={() => (filter_undefined = !filter_undefined)}
				aria-pressed={filter_undefined}
			>
				Undefined: {result.undeclared.size}
			</button>
			<button
				class:alert={result.undeclared_with_fallback.size > 0}
				onclick={() => (filter_with_fallback = !filter_with_fallback)}
				aria-pressed={filter_with_fallback}
			>
				Undefined with fallback: {result.undeclared_with_fallback.size}
			</button>
		</div>
	</div>
</div>

<div class="devtools">
	<DevTools tabs={[network, properties]}>
		{#snippet children({ tab_id }: { tab_id: TabId })}
			{#if tab_id === 'network'}
				<NetworkPanel />
			{:else if tab_id === 'properties'}
				<JsonPanel
					json={{
						'All Properties': Array.from(result.all.keys()),
						'Unused Properties': Array.from(result.unused),
						'Undefined Properties': Array.from(result.undeclared),
						'Undefined with Fallback': Array.from(result.undeclared_with_fallback)
					}}
				/>
			{/if}
		{/snippet}
	</DevTools>
</div>

<style>
	.wrapper {
		--custom-property-inspector-bg: var(--bg-0);
		width: 100%;
		border: 1px solid var(--fg-450);
		background-color: var(--custom-property-inspector-bg);
		scroll-margin-block-start: var(--space-4);
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(16rem, 25%);
		grid-template-rows: 1fr auto;
		grid-template-areas: 'editor list' 'summary summary';

		& :is(.list, .editor) {
			position: relative;
			overflow: hidden;
			height: 80vh;
		}
	}

	.editor {
		grid-template-rows: auto minmax(0, 1fr);
		border-right: 1px solid var(--fg-450);
		grid-area: editor;
	}

	.list {
		grid-area: list;
		display: grid;
		grid-template-rows: auto minmax(0, 1fr);
	}

	/* Regular outline not visible because of scroll containers */
	.tree-root {
		overflow-y: auto;

		&:focus-visible {
			box-shadow: inset 0 0 0 2px var(--accent);
		}
	}

	header {
		position: sticky;
		top: 0;
		left: 0;
		right: 0;
		display: grid;
		justify-content: space-between;
		grid-template-columns: 1fr auto;
		align-items: center;
		padding: var(--space-1) var(--space-2);
		background-color: var(--custom-property-inspector-bg);
		font-size: var(--size-sm);

		& h2 {
			text-transform: uppercase;
			font-weight: var(--font-bold);
			font-size: var(--size-xs);
			color: var(--fg-100);
		}

		& search {
			grid-column: 1 / -1;
		}

		& input {
			background-color: transparent;
			border: 1px solid var(--fg-450);
			width: 100%;
			padding-inline: var(--space-2);
		}

		button[type='submit'] {
			position: absolute;
		}

		.search-info {
			line-height: var(--leading-snug);
			font-size: var(--size-sm);
			display: inline;
		}

		button[type='reset'] {
			text-decoration: underline;
		}
	}

	.collapse-all {
		background-color: transparent;
		padding-inline: var(--space-1);

		&:hover {
			background-color: var(--bg-200);
		}
	}

	.clear-search {
		text-decoration: underline;
	}

	.empty-wrapper {
		padding: var(--space-2);
	}

	.summary {
		grid-area: summary;
		border-top: 1px solid var(--fg-450);
		padding: 0 var(--space-2);
		font-size: var(--size-sm);
		color: var(--fg-200);
		display: flex;
		justify-content: space-between;
		background-color: var(--custom-property-inspector-bg);

		.filters {
			display: flex;
			justify-content: flex-end;
			margin-left: auto;
			gap: var(--space-1);
		}

		button {
			padding-inline: var(--space-2);

			&[aria-pressed='true'] {
				background-color: var(--bg-400);
			}
		}

		.warning {
			text-decoration: wavy underline var(--orange-400);
		}

		.error {
			text-decoration: wavy underline var(--red-400);
		}

		.alert {
			text-decoration: wavy underline var(--yellow-400);
		}
	}
</style>
