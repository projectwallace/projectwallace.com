<script lang="ts">
	import type { Snippet } from 'svelte'
	import Container from '$lib/components/Container.svelte'
	import Icon from '$lib/components/Icon.svelte'

	interface Props {
		title: string
		github_link?: string
		children?: Snippet
	}

	let { title, children, github_link }: Props = $props()
</script>

<header class="hero">
	<Container>
		<h1
			class={[
				'font-heading',
				{
					'has-github-link': github_link
				}
			]}
		>
			{title}
		</h1>
		{#if github_link}
			<a href={github_link} rel="external" class="github-link">
				<Icon name="github" size={40} color="text-gray-300" />
				<span class="sr-only">View repository on GitHub</span>
			</a>
		{/if}
		<div class="hero-text">
			{@render children?.()}
		</div>
	</Container>
</header>

<style>
	.hero {
		background-color: var(--bg-0);
		margin-bottom: var(--space-8);
		padding-block: var(--space-8);
		text-align: center;
	}

	h1 {
		font-size: var(--size-6xl);
		color: var(--fg-0);
		display: inline;
		vertical-align: middle;
		text-wrap: balance;

		@media (min-width: 44rem) {
			font-size: var(--size-7xl);
		}
	}

	.github-link {
		display: inline-block;
		margin-inline-start: var(--space-4);
		color: var(--fg-300);
	}

	.hero-text {
		font-weight: var(--font-normal);
		font-size: var(--size-lg);
		margin-block: var(--space-4);
		margin-inline: auto;

		@media (min-width: 44rem) {
			font-size: var(--size-xl);
		}
	}

	.hero-text :global(a:not(.button)) {
		color: var(--fg-100);
	}

	.hero-text :global(> p:first-of-type) {
		font-size: 1.875rem;
		color: var(--fg-300);
	}
</style>
