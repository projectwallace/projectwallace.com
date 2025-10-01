<script lang="ts">
	import type { Snippet } from 'svelte'

	let { color, children }: { color: string; children?: Snippet } = $props()
</script>

<span class="color-example" role="img" aria-roledescription="color example" aria-label={color}>
	<span class="foreground" style:background-color={color}>
		{@render children?.()}
	</span>
</span>

<style>
	.color-example {
		--color-example-pattern-size: 0.8rem;
		--color-example-pattern-color: var(--bg-300);
		display: flex;
		aspect-ratio: 1;
		align-items: center;
	}

	.foreground {
		display: block;
		width: 100%;
		height: 100%;
		text-align: center;
		font-size: var(--size-xs);
		forced-color-adjust: none;
	}
</style>
