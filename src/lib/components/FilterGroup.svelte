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
	fieldset {
		display: inline-flex;
		flex-wrap: wrap;

		/* Gets used as a grid child a lot, so do not take up full width by default */
		justify-self: start;
		gap: var(--space-1) var(--space-3);
		border: 1px solid var(--gray-500);
		padding: var(--space-1) var(--space-2);
	}

	:global(label) {
		cursor: pointer;
	}
</style>
