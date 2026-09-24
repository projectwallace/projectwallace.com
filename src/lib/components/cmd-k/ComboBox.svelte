<script lang="ts">
	import type { ComponentProps } from 'svelte'
	import { afterNavigate } from '$app/navigation'
	import Empty from '#lib/components/Empty.svelte'
	import Icon, { type IconName } from '#lib/components/Icon.svelte'
	import { focusable_children, trap } from './actions.focus'
	import { shortcuts } from './shortcuts'

	let search_query = $state('')
	let normalized_search_query = $derived(search_query.toLowerCase().trim())

	let results = $derived.by(() => {
		if (normalized_search_query.length === 0) {
			return shortcuts
		}

		// no structuredClone: items can hold functions (`action`), which can't be cloned
		return shortcuts.map((section) => ({
			...section,
			items: section.items.filter((item) => {
				return (
					item.title.toLowerCase().includes(normalized_search_query) || item.keywords?.includes(normalized_search_query)
				)
			})
		}))
	})

	let no_results = $derived(results.every((section) => section.items.length === 0))

	function onkeydown(event: KeyboardEvent & { currentTarget: HTMLElement }) {
		if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
			event.preventDefault()

			let listbox = event.currentTarget
			const group = focusable_children(listbox)

			// when using arrow keys (as opposed to tab), don't focus buttons
			const selector = '.shortcut, input'

			if (event.key === 'ArrowDown') {
				if (event.metaKey || event.ctrlKey) {
					group.last('.shortcut')
				} else {
					group.next(selector)
				}
			} else {
				if (event.metaKey || event.ctrlKey) {
					group.first('.shortcut')
				} else {
					group.prev(selector)
				}
			}
		}
	}

	function get_icon(section_title: string): IconName {
		if (section_title.includes('Website')) {
			return 'code-window'
		}
		if (section_title.includes('One-off')) {
			return 'tools'
		}
		return 'file'
	}

	afterNavigate(({ shallow }) => {
		if (shallow) {
			return
		}

		search_query = ''
	})
</script>

{#snippet shortcut_content(icon_name: ComponentProps<typeof Icon>['name'], title: string)}
	<span class="icon">
		<Icon name={icon_name} size={15} />
	</span>
	{title}
{/snippet}

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
				{#each results as section (section.title)}
					{#if section.items.length > 0}
						<li class="section">
							<div class="section-title title">{section.title}</div>
							<ol class="items">
								{#each section.items as list_item (list_item.title)}
									<li class="item">
										{#if 'href' in list_item}
											{@const icon_name = get_icon(section.title)}
											<a class="shortcut" href={list_item.href}>
												{@render shortcut_content(icon_name, list_item.title)}
											</a>
										{:else}
											<button class="shortcut" onclick={list_item.action}>
												{@render shortcut_content('tools', list_item.title)}
											</button>
										{/if}
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
		margin: var(--space-3);
	}

	input[type='search'] {
		inline-size: 100%;
	}

	.body {
		max-block-size: 85vb;
		overflow-inline: auto;
		scrollbar-gutter: stable;
		overscroll-behavior: contain;
	}

	.empty {
		margin-block-end: var(--space-3);
	}

	.section {
		padding-block: var(--space-3);

		&:not(:last-child) {
			border-block-end: 1px solid var(--fg-500);
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
		flex-wrap: nowrap;
		padding-block: var(--space-2);
		color: var(--fg-200);

		/* buttons need more care than links: */
		inline-size: stretch;
		text-align: start;
		cursor: pointer;

		& .icon {
			color: var(--fg-300);
			margin-inline-end: var(--space-2);
		}

		&:hover {
			background-color: var(--bg-300);
		}

		&:focus {
			outline: 1px solid light-dark(var(--accent-600), var(--accent));
			outline-offset: -1px;
			background-color: var(--highlight-item);
		}
	}
</style>
