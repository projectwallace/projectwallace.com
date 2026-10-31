<script lang="ts">
	import type { Snippet } from 'svelte'

	interface Props {
		children?: Snippet
	}

	let { children }: Props = $props()
</script>

<svg viewBox="0 0 100 100" preserveAspectRatio="none">
	{@render children?.()}
</svg>

<style>
	svg {
		position: absolute;
		inline-size: 100%;
		block-size: 100%;
		overflow: visible;
	}

	svg :global(*) {
		vector-effect: non-scaling-stroke;
	}
</style>
