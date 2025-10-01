<script lang="ts">
	import Empty from '$components/Empty.svelte'
	import Icon from '$components/Icon.svelte'
	import { focusable_children, trap } from './actions.focus'
	import { shortcuts } from './shortcuts'

	let search_query = $state('')
	let normalized_search_query = $derived(search_query.toLowerCase().trim())

	let results = $derived.by(() => {
		if (normalized_search_query.length === 0) {
			return shortcuts
		}

		let new_results = structuredClone(shortcuts)
		new_results.forEach((section) => {
			section.items = section.items.filter((item) => {
				return item.title.toLowerCase().includes(normalized_search_query)
					|| item.keywords?.includes(normalized_search_query)
			})
		})
		return new_results
	})
	let no_results = $derived(results.every((section) => section.items.length === 0))

	function onkeydown(event: KeyboardEvent) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()

			let listbox = event.currentTarget as HTMLElement
			const group = focusable_children(listbox)

			// when using arrow keys (as opposed to tab), don't focus buttons
			const selector = 'a.shortcut, input'

			if (event.key === 'ArrowDown') {
				if (event.metaKey || event.ctrlKey) {
					group.last('a.shortcut')
				} else {
					group.next(selector)
				}
			} else {
				if (event.metaKey || event.ctrlKey) {
					group.first('a.shortcut')
				} else {
					group.prev(selector)
				}
			}
		}
	}
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div use:trap {onkeydown}>
	<header>
		<label for="cmdk-search" class="sr-only">Search page or tool</label>
		<!-- svelte-ignore a11y_autofocus -->
		<input
			autofocus
			class="input"
			id="cmdk-search"
			name="cmdk-search"
			type="search"
			bind:value={search_query}
			role="combobox"
			aria-expanded="true"
			aria-controls="combobox-body"
		/>
		<button class="sr-only" hidden>Search</button>
	</header>

	<div class="body scroll-container" id="combobox-body">
		{#if no_results}
			<div class="empty" data-testid="empty">
				<Empty>No results</Empty>
			</div>
		{:else}
			<ol class="sections">
				{#each results as section}
					{#if section.items.length > 0}
						<li class="section">
							<div class="section-title title">{section.title}</div>
							<ol class="items">
								{#each section.items as list_item}
									<li class="item">
										<a class="shortcut" href={list_item.href}>
											<span class="icon">
												{#if section.title.includes('Website')}
													<Icon name="code-window" size={15} />
												{:else if section.title.includes('One-off')}
													<Icon name="tools" size={15} />
												{:else}
													<Icon name="file" size={15} />
												{/if}
											</span>
											{list_item.title}
										</a>
									</li>
								{/each}
							</ol>
						</li>
					{/if}
				{/each}
			</ol>
		{/if}
	</div>
</div>

<style>
	header {
		margin-inline: var(--space-3);
		margin: var(--space-3);
	}

	input[type='search'] {
		width: 100%;
	}

	.body {
		max-height: 85vh;
		overflow-y: auto;
		scrollbar-gutter: stable;
		overscroll-behavior: contain;
	}

	.empty {
		margin-bottom: var(--space-3);
	}

	.section {
		padding-block: var(--space-3);

		&:not(:last-child) {
			border-bottom: 1px solid var(--fg-500);
		}
	}

	.section-title {
		color: var(--fg-300);
		font-size: var(--size-xs);
		margin-block: var(--space-3);
	}

	.section-title,
	.shortcut {
		padding-inline: var(--space-3);
		margin-inline: var(--space-3);
	}

	.shortcut {
		display: block;
		padding-block: var(--space-2);

		& .icon {
			color: var(--fg-300);
			margin-right: var(--space-3);
		}

		&:hover {
			background-color: var(--bg-300);
		}

		&:focus {
			outline: 1px solid light-dark(var(--accent-600), var(--accent));
			outline-offset: -1px;
			background-color: var(--highlight);
		}
	}
</style>
