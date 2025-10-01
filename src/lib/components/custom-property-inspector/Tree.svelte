<script lang="ts">
	import { melt, type TreeView } from '@melt-ui/svelte'
	import { getContext } from 'svelte'
	import { format_number } from '$lib/format-number'
	import type { TreeItem, Location } from './types'
	import Tree from './Tree.svelte'

	let {
		items,
		search_query
	}: {
		items: TreeItem[] | Location[]
		search_query: string
	} = $props()

	const {
		elements: { item, group },
		helpers: { isExpanded, isSelected }
	} = getContext<TreeView>('tree')
</script>

{#each items as { title, count, index, type, children, parent, location, level, name }}
	{@const item_id = type === 'property' ? title : `${title}-${index}`}
	{@const has_children = type == 'property'}
	{@const matches = search_query === '' ? [name] : name.split(search_query)}

	<li class:is-expanded={$isExpanded(item_id)}>
		<button
			use:melt={$item({
				id: item_id,
				hasChildren: has_children
			})}
			data-item={JSON.stringify({
				type,
				title: parent || title,
				location
			})}
			data-testid={type === 'property' ? 'property-name' : 'property-location'}
		>
			{#if type === 'property'}
				<span class="indicator">
					{$isExpanded(item_id) ? '▼' : '▶'}
				</span>
				<code
					class="[ language-css ] property-name"
					class:warning={level === 1}
					class:error={level === 2}
					class:alert={level === 3}
				>
					{#if matches.length > 1}
						<!-- All inline to collapse whitespaces -->
						{matches[0]}<mark class="match">{search_query}</mark>{matches[1]}
					{:else}
						{name}
					{/if}
				</code>
				<span class="count">
					{format_number(count)}
				</span>
			{:else}
				<code class="language-css property-use" class:warning={level === 1} class:error={level === 2}>
					{title}
				</code>
				<span class="location">
					line {location && format_number(location.line)}
				</span>
			{/if}
		</button>

		{#if has_children && children}
			<ul use:melt={$group({ id: item_id })}>
				<Tree items={children} {search_query} />
			</ul>
		{/if}
	</li>
{/each}

<style>
	button[role='treeitem'] {
		content-visibility: auto;
		contain-intrinsic-size: auto 28.8px;
		text-align: start;
		padding-inline: var(--space-2);
		padding-block: 0.25rem;
		line-height: 1.4;
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: var(--space-1);
		background-color: transparent;
		cursor: default;

		&:hover {
			background-color: var(--bg-200);
		}

		&:focus {
			outline: 1px solid var(--accent);
		}

		&[aria-selected='true'] {
			background-color: var(--bg-200);
		}
	}

	/* ▸ ▾ */
	.indicator {
		color: var(--fg-400);
		font-size: var(--size-xs);
		width: var(--space-3);
	}

	.language-css {
		font-size: var(--size-sm);
		font-family: var(--font-body);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.property-name {
		color: var(--fg-100);
		font-weight: var(--font-medium);
		display: inline-block;
		max-width: 100%;
		margin-right: auto;
	}

	.property-use {
		display: block;
		border-left: 1px solid var(--fg-450);
		padding-left: var(--space-3);
		line-height: var(--leading-relaxed);
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

	.count {
		background-color: var(--bg-400);
		color: var(--fg-300);
		padding-inline: var(--space-1);
		padding-block: var(--space-1);
		font-size: var(--size-xs);
		text-align: center;
	}

	.location {
		font-size: var(--size-xs);
		white-space: nowrap;
		color: var(--fg-300);
	}

	.match {
		background-color: transparent;
		border: 1px solid var(--blue-300);
		color: inherit;
	}
</style>
