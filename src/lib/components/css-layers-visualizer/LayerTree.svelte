<script lang="ts">
	import LayerTree from './LayerTree.svelte'
	import type { TreeNode } from '@projectwallace/css-layer-tree'
	import { get_css_state } from '$lib/css-state.svelte'

	interface Props {
		tree?: TreeNode[]
		breadcrumb?: string[]
	}

	let { tree = [], breadcrumb = [] }: Props = $props()
	let css_state = get_css_state()

	function print_name(item: TreeNode) {
		if (item.is_anonymous) {
			return 'anonymous'
		}
		return item.name
	}

	function set_selected_item(item: TreeNode, item_id: string) {
		css_state.select_item({
			type: 'layer',
			node_type: 'atrule',
			value: item_id,
			locations: item.locations.map(({ start, end, line, column }) => ({
				line,
				column,
				offset: start,
				length: end - start
			}))
		})
	}
</script>

<ol class:children={tree.length > 0}>
	{#each tree as item}
		{@const item_id = [...breadcrumb, item.name].join('.')}
		<li class="shadow-inner">
			{#if item.children.length > 0}
				<button
					onclick={() => set_selected_item(item, item_id)}
					aria-current={item_id === css_state.selected_item?.value ? 'true' : 'false'}
					data-testid="layer"
				>
					<code>
						@layer
						<span class="layer-name">{print_name(item)}</span>
						{'{'}
					</code>
				</button>
				<LayerTree tree={item.children} breadcrumb={[...breadcrumb, item.name]} />
				<code class="close-bracket">{'}'}</code>
			{:else}
				<button
					onclick={() => set_selected_item(item, item_id)}
					aria-current={item_id === css_state.selected_item?.value ? 'true' : 'false'}
					data-testid="layer"
				>
					<code>
						@layer
						<span class="layer-name">{print_name(item)}</span>
						{'{'} &hellip; {'}'}
					</code>
				</button>
			{/if}
		</li>
	{/each}
</ol>

<style>
	ol {
		display: grid;
		gap: 0.33rem;
		position: relative;
	}

	ol :global(ol) {
		padding-left: 1rem;
		margin: 0.5rem 0rem 0.5rem 0.5rem;
	}

	:global(ol ol).children::before {
		content: '';
		position: absolute;
		top: 0.5rem;
		bottom: 0.5rem;
		left: 0.25rem;
		border-left: 1px dotted var(--fg-400);
	}

	li {
		list-style-type: none;
		font-size: var(--size-sm);
	}

	ol :global(li) {
		background: var(--uneven-tr-bg);
	}

	button {
		display: block;
		width: 100%;
		text-align: start;
		padding: 0.33rem 0.75rem;
		box-shadow: var(--shadow-inset);

		&[aria-current='true'] {
			outline: 1px solid var(--accent);
			outline-offset: -1px;
			background-color: var(--highlight);
		}
	}

	code {
		color: var(--fg-300);
	}

	code.close-bracket {
		padding-inline-start: 0.5rem;
	}

	.layer-name {
		color: var(--fg-100);
	}
</style>
