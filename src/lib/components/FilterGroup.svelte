<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		children?: Snippet
	}

	let { children }: Props = $props()
</script>

<fieldset>
	{@render children?.()}
</fieldset>

<style>
	/* stylelint-disable projectwallace/max-average-declarations-per-rule -- a single rule holds the whole look of the fieldset */
	fieldset {
		display: inline-flex;
		flex-wrap: wrap;

		/* Gets used as a grid child a lot, so do not take up full width by default */
		justify-self: start;
		row-gap: var(--space-1);
		column-gap: var(--space-3);
		border-width: var(--border-width-1);
		border-style: var(--border-style-solid);
		border-color: var(--gray-500);
		padding-block: var(--space-1);
		padding-inline: var(--space-2);
	}
</style>
