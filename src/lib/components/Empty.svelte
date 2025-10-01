<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'

	type Props = SvelteHTMLElements['div'] & {
		element?: string
	}

	let { element = 'p', children, ...rest }: Props = $props()
</script>

<svelte:element this={element} {...rest} class="empty">
	{@render children?.()}
</svelte:element>

<style>
	.empty {
		padding: var(--space-4) var(--space-6);
		border: 3px dashed var(--fg-700);
		text-align: center;
		font-weight: var(--font-medium);
		color: light-dark(var(--fg-700), var(--fg-400));
		text-wrap: balance;
		display: flex;
		align-items: center;
		justify-content: center;
	}

	@media print {
		.empty {
			border-width: 1px;
		}
	}
</style>
