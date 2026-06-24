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
	let { data } = $props()

	type Status = 'initial' | 'fetching' | 'analyzing' | 'done' | 'error'
	let status: Status = $state('initial')
	let error: Error | undefined
	let css_state = get_css_state()

	function on_success() {
		error = undefined
		status = 'analyzing'
	}

	function on_error() {
		status = 'error'
	}

	function on_render_error() {
		status = 'error'
	}
</script>

<Seo
	title="Online CSS Code Quality Analyzer"
	description="This online analyzer takes your CSS and tells you exactly which areas should be improved."
	image={Image}
/>

<Hero>
	<Form {on_success} {on_error}>
		{#snippet title()}
			<h1 class="font-heading">CSS Code Quality</h1>
		{/snippet}
	</Form>
</Hero>

{#if css_state.origins.length > 0 && status !== 'error'}
	<svelte:boundary onerror={on_render_error}>
		<CodeQuality docs={data.docs} css={css_state.css} />
	</svelte:boundary>
{/if}

<Container size="xl">
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
	.font-heading {
		font-size: var(--size-5xl);
	}
</style>
