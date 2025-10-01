<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'

	type Props = SvelteHTMLElements['dl'] & {
		element?: string
	}

	let props: Props = $props()
	let { element = 'section', class: className, children, ...rest } = $derived(props)
</script>

<svelte:element this={element} {...rest} class={[className, 'panel shadow-lg']}>
	{@render children?.()}
</svelte:element>

<style>
	.panel {
		contain: layout paint;
		background-color: light-dark(transparent, var(--bg-200));
		padding: var(--space-4) var(--space-2);
		border-width: 1px;
		border-style: solid;
		border-color: light-dark(var(--fg-800), transparent);

		@media (min-width: 44rem) {
			padding-right: var(--space-4);
			padding-left: var(--space-4);
		}

		@media print {
			border: 1px solid currentColor;
			break-inside: avoid-page;
		}
	}
</style>
