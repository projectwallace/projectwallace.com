<script lang="ts">
	import type { SvelteComponent } from 'svelte'
	type Size = 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'auto'

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

		@media (min-width: 44rem) {
			padding-inline: var(--space-4);
		}

		@media (min-width: 66rem) {
			padding-inline: var(--space-8);
		}
	}

	.size-auto {
		max-width: 120rem;
	}

	.size-sm {
		max-width: 28rem;
	}

	.size-md {
		max-width: 32rem;
	}

	.size-lg {
		max-width: 36rem;
	}

	.size-xl {
		max-width: 48rem;
	}

	.size-2xl {
		max-width: 64rem;
	}

	.size-3xl {
		max-width: 80rem;
	}
</style>
