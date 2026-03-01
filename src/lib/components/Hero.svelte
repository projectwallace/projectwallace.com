<script lang="ts">
	import type { Snippet } from 'svelte'
	import Container from '$lib/components/Container.svelte'

	interface Props {
		children?: Snippet
	}

	let { children }: Props = $props()
</script>

<header class="hero">
	<Container size="xl">
		{@render children?.()}
	</Container>
</header>

<style>
	.hero {
		padding-block-start: var(--space-8);
		padding-block-end: var(--space-4);
		border-block-end: var(--space-px) solid var(--bg-300);
		margin-block-end: var(--space-4);
	}
</style>
