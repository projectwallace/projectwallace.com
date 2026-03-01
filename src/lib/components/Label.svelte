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
		font-weight: var(--font-bold);
		justify-self: start;
	}

	.md {
		font-size: var(--size-base);
	}

	.sm {
		font-size: var(--size-base);
	}
</style>
