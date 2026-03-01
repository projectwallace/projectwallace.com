<script lang="ts">
	import type { Snippet } from 'svelte'
	import Container from '$lib/components/Container.svelte'
	import Icon from '$lib/components/Icon.svelte'

	interface Props {
		title: string
		github_link?: string
		children?: Snippet
		header?: Snippet
	}

	let { title, children, github_link, header }: Props = $props()
</script>

<header class="hero">
	<Container size="xl">
		<div class="title-line">
			<h1 class={[{ 'has-github-link': github_link }]}>
				{title}
			</h1>
			{#if github_link}
				<a href={github_link} rel="external" class="github-link">
					<Icon name="github" size={36} />
					<span class="sr-only">View repository on GitHub</span>
				</a>
			{/if}
			{#if header}
				{@render header()}
			{/if}
		</div>
		<div class="hero-text">
			{@render children?.()}
		</div>
	</Container>
</header>

<style>
	.hero {
		padding-block-start: var(--space-8);
		padding-block-end: var(--space-4);
		border-block-end: var(--space-px) solid var(--bg-300);
		margin-block-end: var(--space-4);
	}

	h1 {
		font-size: var(--size-5xl);
		color: var(--fg-0);
		display: inline;
		vertical-align: middle;
		font-family: var(--font-serif);
		font-weight: var(--font-normal);
		line-height: var(--leading-none);
		text-wrap: balance;
		text-align: center;
		font-weight: var(--font-normal);
	}

	.github-link {
		display: inline-block;
		margin-inline-start: var(--space-4);
		color: var(--fg-300);
		position: relative;
		top: calc(-1 * var(--space-4));
	}

	.hero-text {
		margin-top: var(--space-8);
		margin-inline: auto;
	}

	.hero-text :global(a:not(.button)) {
		color: var(--fg-100);
	}
</style>
