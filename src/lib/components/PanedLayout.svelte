<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		columns?: string
		pane_block_size?: string
		children: Snippet
		footer?: Snippet
	}

	let { columns = 'max-content 1fr 1fr', pane_block_size = 'calc(100vb - 20rem)', children, footer }: Props = $props()
</script>

<div class="paned-layout" style:--paned-layout-columns={columns} style:--paned-layout-block-size={pane_block_size}>
	<div class="panes">
		{@render children()}
	</div>
	{#if footer}
		<div class="paned-layout-footer">
			{@render footer()}
		</div>
	{/if}
</div>

<style>
	.paned-layout {
		--paned-layout-border-color: var(--bg-300);
		--paned-layout-border-width: var(--space-px);
		container-type: inline-size;
		container-name: --paned-layout;
		border-width: var(--paned-layout-border-width);
		border-color: var(--paned-layout-border-color);
	}

	.panes {
		display: grid;
		align-items: stretch;

		@container --paned-layout (min-inline-size: 50rem) {
			grid-template-columns: var(--paned-layout-columns, max-content 1fr 1fr);
		}
	}

	.paned-layout-footer {
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
		border-block-start-width: var(--paned-layout-border-width);
		border-color: var(--paned-layout-border-color);
		color: var(--fg-300);
	}
</style>
