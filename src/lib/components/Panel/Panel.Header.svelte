<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		children?: Snippet
	}

	let { children }: Props = $props()
</script>

<div class="header">
	{@render children?.()}
</div>

<style>
	.header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: var(--space-4);
		margin-block-end: var(--space-4);
	}
</style>
