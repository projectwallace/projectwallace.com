<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'
	type HeadingElement = 'h1' | 'h2' | 'h3' | 'h4' | 'span' | 'div'
	type HeadingSize = undefined | 1 | 2 | 3 | 4 | 5 | 6

	const SIZE_MAP = {
		['h1' as HeadingElement]: 1,
		['h2' as HeadingElement]: 2,
		['h3' as HeadingElement]: 3,
		['h4' as HeadingElement]: 4,
		['span' as HeadingElement]: 6,
		['div' as HeadingElement]: 6
	}

	type Props = {
		element: HeadingElement
		size?: HeadingSize
	}

	let { element, size, children, class: className, ...rest }: SvelteHTMLElements['div'] & Props = $props()

	let calculated_size = $derived(size || SIZE_MAP[element])
</script>

<svelte:element this={element} class={[`heading heading-size-${calculated_size}`, className]} {...rest}>
	{@render children?.()}
</svelte:element>

<style>
	.heading {
		line-height: var(--leading-none);

		/* Progressive enhancement for text-wrap: pretty */
		/* stylelint-disable-next-line declaration-block-no-duplicate-properties */
		text-wrap: balance;
		text-wrap: pretty;
	}

	h1,
	.heading-size-1 {
		color: light-dark(var(--black), var(--white));
		font-weight: var(--font-ultrabold);
		font-size: var(--size-6xl);
	}

	h2,
	.heading-size-2 {
		color: light-dark(var(--black), var(--white));
		font-weight: var(--font-bold);
		font-size: var(--size-3xl);
	}

	h3,
	.heading-size-3 {
		color: var(--fg);
		font-weight: var(--font-medium);
		font-size: var(--size-xl);
	}

	h4,
	.heading-size-4 {
		color: var(--fg);
		font-weight: var(--font-medium);
		font-size: var(--size-lg);
	}

	.heading :global(em) {
		color: var(--teal-400);
	}
</style>
