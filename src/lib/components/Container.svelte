<script lang="ts">
	import type { SvelteComponent } from 'svelte'
	type Size = 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'auto'

	type Props = SvelteComponent & {
		size?: Size
		element?: string
	}

	let props = $props()
	let { size = 'auto', children, element = 'div' }: Props = $derived(props)
</script>

<svelte:element this={element} class={[`container size-${size}`, props.class]}>
	{@render children?.()}
</svelte:element>

<style>
	.container {
		margin-inline: auto;
		padding-inline: var(--space-2);
		min-inline-size: 0;
		inline-size: 100%;

		@media (min-width: 44rem) {
			padding-inline: var(--space-4);
		}

		@media (min-width: 66rem) {
			padding-inline: var(--space-8);
		}
	}

	.size-auto {
		max-inline-size: 120rem;
	}

	.size-md {
		max-inline-size: 32rem;
	}

	.size-lg {
		max-inline-size: 36rem;
	}

	.size-xl {
		max-inline-size: 48rem;
	}

	.size-2xl {
		max-inline-size: 64rem;
	}

	.size-3xl {
		max-inline-size: 80rem;
	}
</style>
