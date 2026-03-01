<script lang="ts">
	import Analysis from '$components/stats/Analysis.svelte'
	import Container from '$components/Container.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Form from '$components/css-form/Form.svelte'
	import Heading from '$components/Heading.svelte'
	import Button from '$components/Button.svelte'
	import Seo from '$components/Seo.svelte'
	import Hero from '$components/Hero.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	// @ts-expect-error No type definitions for importing images
	import Image from './og-image.png?w=1200'

	let css_state = get_css_state()
	let status: 'idle' | 'done' | 'error' = $state(css_state.origins.length > 0 ? 'done' : 'idle')
	let error: Error | undefined = $state(undefined)

	function on_error(original_error: Error) {
		error = original_error
		status = 'error'
	}

	function on_success() {
		status = 'done'
		error = undefined
	}

	function on_render_error() {
		status = 'error'
	}
</script>

<Seo
	title="Online CSS Analyzer"
	description="Analyze your website's CSS in this fast, detailed analyzer. Enter a URL of paste in your raw CSS and get near-instant analysis."
	image={Image}
/>

<Hero title="Analyze CSS" github_link="https://github.com/projectwallace/css-analyzer">
	<Form {on_success} {on_error} />
</Hero>

{#if status === 'done' && css_state.origins.length > 0}
	<svelte:boundary onerror={on_render_error}>
		<Analysis origins={css_state.origins} prettify_css_before_analyze={css_state.should_prettify} />
	</svelte:boundary>
{:else if status === 'error'}
	<Container>
		<div class="error">
			{#await import('./Error.svelte') then Err}
				<Err.default {error} />
			{/await}
		</div>
	</Container>
{:else}
	<Container size="xl">
		<aside>
			<Heading element="h2" size={4}>🎨 Looking for design tokens?</Heading>
			<p>
				We have a separate tool for that! Our Design Tokens analyzer will help you find all your colors, font-sizes, and
				other design tokens in your CSS.
			</p>
			<Button element="a" href="/design-tokens" variant="secondary" size="md">Go to Design Tokens</Button>
		</aside>
	</Container>
{/if}

<div class="content">
	<Container size="md">
		<Markdown>
			<p>
				This analyzer will show you everything you want to know about your code and a whole lot more. Think Source Lines
				of Code, selector complexity and specificity or which CSS units are used the most. Anyone who audits CSS can't
				do without these metrics. Here are some of the questions this analyzer will answer:
			</p>
			<ul>
				<li>How many Source Lines of Code is my CSS?</li>
				<li>What is the average Rule size of my CSS?</li>
				<li>How many selectors are there in my largest Rule?</li>
				<li>What is the highest selector specificity in my CSS?</li>
				<li>How high is my total selector complexity?</li>
				<li>Which CSS units are used?</li>
				<li>What color formats are used the most?</li>
				<li>How many unique colors are there in my CSS?</li>
				<li>How many unique font-sizes are there in my CSS?</li>
				<li>How many unique font-families are there in my CSS?</li>
			</ul>
		</Markdown>
	</Container>
</div>

<style>
	aside {
		border: 2px solid var(--teal-500);
		padding: var(--space-12);
		display: grid;
		gap: var(--space-4);
		margin-block: var(--space-4);
	}

	.content {
		margin-block: var(--space-16);
	}

	.error {
		padding-block: var(--space-4);
		padding-inline: var(--space-2);
		display: grid;
		gap: var(--space-8);
		margin-block: var(--space-16);
	}
</style>
