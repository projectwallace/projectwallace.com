<script lang="ts">
	import type { Snippet } from 'svelte'
	import Container from '$lib/components/Container.svelte'

	interface Props {
		children?: Snippet
		title?: string
	}

	let { children, title }: Props = $props()
</script>

<header class="hero">
	<Container size="xl">
		{#if title}
			<div class="title">
				<h1 class="font-heading">{title}</h1>
			</div>
		{/if}
		{@render children?.()}
	</Container>
</header>

<style>
	.hero {
		padding-block-start: var(--space-8);
		padding-block-end: var(--space-6);
		border-block-end: var(--space-px) solid var(--bg-300);
		margin-block-end: var(--space-8);
		background-image:
			radial-gradient(circle at top right, rgb(from var(--accent-400) r g b / 0.07) 0%, transparent 90%),
			radial-gradient(circle at top left, rgb(from var(--purple-300) r g b / 0.1) 0%, transparent 70%);

		@media (min-height: 33rem) {
			padding-block-start: var(--space-16);
			padding-block-end: var(--space-12);
		}
	}

	.title {
		font-size: var(--size-4xl);

		@media (min-width: 66rem) {
			font-size: var(--size-5xl);
		}
	}
</style>
