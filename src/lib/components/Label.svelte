<script lang="ts">
	import type { HTMLLabelAttributes } from 'svelte/elements'

	interface LabelProps extends HTMLLabelAttributes {
		size?: 'md' | 'sm'
	}

	let { for: for_attr, size = 'md', children }: LabelProps = $props()
</script>

<label for={for_attr} class="label {size}">
	{@render children?.()}
</label>

<style>
	.label {
		color: var(--fg-100);
		font-weight: var(--font-bold);
		width: 100%; /* For use in Flex containers */
	}

	.md {
		font-size: var(--size-lg);
	}

	.sm {
		font-size: var(--size-base);
	}
</style>
