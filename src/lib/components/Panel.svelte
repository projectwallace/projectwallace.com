<script lang="ts">
	import type { HTMLAttributes } from 'svelte/elements'

	type Props = HTMLAttributes<HTMLElement> & {
		element?: string
	}

	let { element = 'section', class: className, children, ...rest }: Props = $props()
</script>

<svelte:element this={element} {...rest} class={[className, 'panel shadow-lg']}>
	{@render children?.()}
</svelte:element>

<style>
	.panel {
		contain: layout paint;
		min-inline-size: 0;
		background-color: light-dark(transparent, var(--bg-200));
		padding-block: var(--space-4);
		padding-inline: var(--space-2);
		border-width: var(--border-width-sm);
		border-style: var(--border-style-solid);
		border-color: light-dark(var(--fg-800), transparent);

		@media (min-width: 44rem) {
			padding-inline-end: var(--space-4);
			padding-inline-start: var(--space-4);
		}

		@media print {
			border-color: currentColor;
			break-inside: avoid-page;
		}
	}
</style>
