<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'

	type Props = SvelteHTMLElements['div']

	let { children, class: classname, ...rest }: Props = $props()
</script>

<!-- svelte-ignore a11y_no_noninteractive_tabindex -->
<div class={['scroller scroll-container', classname]} tabindex="0" {...rest}>
	<table class="pw-table">
		{#if children}
			{@render children()}
		{/if}
	</table>
</div>

<style>
	/* stylelint-disable projectwallace/max-average-selector-complexity -- the :global() pseudos make this more complex */
	.scroller {
		overflow-x: auto;
		block-size: 100%;
		max-block-size: 100%;
		max-inline-size: 100%;
		container-type: inline-size;
	}

	@layer components.table {
		:where(.pw-table) {
			inline-size: 100%;
			border-collapse: collapse;
			--pw-table-font-size: 0.925rem;
			--pw-table-padding-block: 0.33rem;
			font-size: var(--pw-table-font-size);

			& :global(thead tr) {
				position: sticky;
				inset-block-start: 0;
				z-index: 2;
				inset-inline: 0;
				/* Double border-width because it otherwise doesn't show */
				border-block-end-width: var(--border-width-md);
				border-block-end-style: var(--border-style-solid);
				border-block-end-color: var(--fg-500);
			}

			& :global(th:not([scope='row' i])) {
				font-weight: var(--font-bold);
			}

			& :global(th[scope='row' i]) {
				font-weight: var(--font-normal);
			}

			& :global(:is(th, td)) {
				text-align: start;
				padding-block: var(--pw-table-padding-block);
				padding-inline: var(--space-2);
			}

			& :global(td:not(:first-child)) {
				border-inline-start-width: var(--border-width-sm);
				border-inline-start-style: var(--border-style-solid);
				border-inline-start-color: var(--fg-500);
			}

			& :global(th),
			& :global(td:first-child) {
				white-space: nowrap;
			}

			& :global(:where(tr:nth-child(even))) {
				background-color: var(--uneven-tr-bg);
			}

			& :global(td) {
				line-height: var(--leading-snug);
				vertical-align: baseline;
			}

			& :global(.numeric) {
				text-align: end;
				white-space: nowrap;
				font-variant-numeric: tabular-nums;
				/* "Looks about right" */
				letter-spacing: -0.1ch;
			}
		}
	}
</style>
