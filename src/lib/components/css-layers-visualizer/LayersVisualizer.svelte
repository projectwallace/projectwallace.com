<script lang="ts">
	import { layer_tree, type TreeNode } from '@projectwallace/css-layer-tree'
	import Empty from '$components/Empty.svelte'
	import LayerTree from './LayerTree.svelte'
	import type { CSSOrigin } from '$lib/css-origins'
	import DevTools from '$components/DevTools.svelte'
	import ItemUsage from '$components/ItemUsage.svelte'
	import Container from '$components/Container.svelte'
	import NetworkPanel from '$components/NetworkPanel.svelte'
	import CssPanel from '$components/devtools/CssPanel.svelte'
	import JsonPanel from '$components/devtools/JsonPanel.svelte'
	import { layers_tabs, type TabId } from '$components/devtools/tabs'
	import { get_css_state } from '$lib/css-state.svelte'

	interface Props {
		origins?: CSSOrigin[]
		prettify_css_before_analyze?: boolean
	}

	let { origins = [], prettify_css_before_analyze = true }: Props = $props()
	let css_state = get_css_state()
	let tree: TreeNode[] = $derived(layer_tree(css_state.css))

	css_state.set_origins(origins)
	css_state.should_prettify = prettify_css_before_analyze
</script>

{#if css_state.origins.length > 0}
	<Container size="2xl">
		{#if tree.length > 0}
			<output data-testid="layer-tree">
				<LayerTree {tree} />
			</output>
		{:else}
			<Empty data-testid="no-layers-found">No <code>@layer {'{ }'}</code> found.</Empty>
		{/if}
	</Container>
	<div class="devtools">
		<DevTools tabs={layers_tabs}>
			{#snippet children({ tab_id }: { tab_id: TabId })}
				{#if tab_id === 'inspector'}
					<ItemUsage />
				{:else if tab_id === 'network'}
					<NetworkPanel />
				{:else if tab_id === 'css'}
					<CssPanel css={css_state.css} />
				{:else if tab_id === 'layers'}
					<JsonPanel json={tree} />
				{/if}
			{/snippet}
		</DevTools>
	</div>
{/if}

<style>
	output {
		background-color: var(--white);
	}

	.devtools {
		margin-block-start: var(--space-2);
		position: sticky;
		right: 0;
		bottom: 0%;
		left: 0;
	}
</style>
