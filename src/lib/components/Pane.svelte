<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		pane_header?: Snippet
		children: Snippet
		flush?: boolean
		fixed_height?: boolean
	}

	let { pane_header, children, flush = false, fixed_height = true }: Props = $props()
</script>

<div class="pane" class:flush class:fixed-height={fixed_height}>
	{#if pane_header}
		<div class="pane-header">
			{@render pane_header()}
		</div>
	{/if}
	<div class="pane-content">
		{@render children()}
	</div>
</div>

<style>
	.pane {
		background-color: light-dark(transparent, var(--bg-200));
		line-height: var(--leading-loose);
		block-size: 100%;
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		grid-template-rows: auto minmax(0, 1fr);
		border-color: var(--paned-layout-border-color, var(--bg-300));
		border-style: solid;

		&:not(:first-child) {
			border-inline-start-width: var(--paned-layout-border-width, var(--space-px));
		}
	}

	.pane-header {
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--space-3);
		row-gap: var(--space-2);
		justify-content: space-between;
		border-block-end-width: var(--paned-layout-border-width, var(--space-px));
		border-color: var(--paned-layout-border-color, var(--bg-300));

		.pane:not(:first-child) & {
			@container --paned-layout (max-width: 50rem) {
				border-block-start-width: var(--paned-layout-border-width, var(--space-px));
			}
		}
	}

	.pane-header :global(.pane-title) {
		font-weight: var(--font-bold);
		margin-inline-end: auto;
	}

	.pane-content {
		padding-block: var(--space-2);
		padding-inline: var(--space-3);
		overflow-x: auto;

		.flush & {
			padding-block: 0;
			padding-inline: 0;
		}

		.fixed-height & {
			@container --paned-layout (min-width: 50rem) {
				block-size: var(--paned-layout-block-size);
			}
		}
	}
</style>
