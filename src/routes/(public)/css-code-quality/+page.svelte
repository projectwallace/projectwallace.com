<script lang="ts">
	import Container from '$lib/components/Container.svelte'
	import Form from '$components/css-form/Form.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import CodeQuality from '$lib/components/code-quality/CodeQuality.svelte'
	// @ts-expect-error No type definitions for importing images
	import Image from './og-image.png?w=1200'
	import { get_css_state } from '$lib/css-state.svelte'
	import Hero from '$components/Hero.svelte'
	import { captureException } from '@sentry/sveltekit'
	let { data } = $props()

	type Status = 'initial' | 'fetching' | 'analyzing' | 'done' | 'error'
	let status: Status = $state('initial')
	let error: Error | undefined
	let css_state = get_css_state()

	function on_success() {
		error = undefined
		status = 'analyzing'
	}

	function on_error(original_error: Error) {
		status = 'error'
	}

	function on_render_error(original_error: Error | unknown) {
		status = 'error'
		captureException(original_error)
	}
</script>

<Seo
	title="Online CSS Code Quality Analyzer"
	description="This online analyzer takes your CSS and tells you exactly which areas should be improved."
	image={Image}
/>

<Hero title="CSS Code Quality" github_link="https://github.com/projectwallace/css-code-quality">
	<Container size="xl">
		<Form {on_success} {on_error} />
	</Container>
</Hero>

{#if css_state.origins.length > 0 && status !== 'error'}
	<svelte:boundary onerror={on_render_error}><CodeQuality docs={data.docs} css={css_state.css} /></svelte:boundary>
{/if}

<Container size="xl">
	{#if status === 'error'}
		<div class="error">
			<p>An error happened. Here is what you should do:</p>
			<ol>
				<li>Check that your URL is correct (if using the url input)</li>
				<li>Check that the URL you are pointing to is publicly accessible</li>
				<li>Try again</li>
				<li>
					<a href="https://bsky.app/profile/projectwallace.com" target="_blank" rel="noreferrer">
						Send me a friendly ping on Bluesky @projectwallace
					</a>
				</li>
			</ol>
		</div>
	{/if}

	<Markdown>
		<p>
			The best way to analyze your CSS is to use the <a href="/analyze-css">CSS analyzer</a>, but if you're in a hurry
			or if you want an opinionated tool, then you can use this CSS Code Quality analyzer. It will use the output of the
			CSS analyzer to run a couple of checks and turn that into a set of recommendations for your CSS. It will focus on
			Performance, Maintainability and Complexity and score each one of them between 0 and 100 points. Think of it like
			<a href="https://pagespeed.web.dev/" rel="external">PageSpeed Insights</a>, but for CSS.
		</p>
	</Markdown>
</Container>

<style>
	.error {
		background-color: var(--red-700);
		color: var(--white);
		padding: var(--space-8);
		display: grid;
		gap: var(--space-8);

		& ol {
			padding-left: var(--space-6);
			list-style-type: disc;
			display: grid;
			gap: var(--space-2);
		}

		& a {
			text-decoration: underline;
		}
	}
</style>
