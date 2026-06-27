<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import Linter from '$components/Linter.svelte'
	import Container from '$components/Container.svelte'
	import Hero from '$components/Hero.svelte'
	import Form from '$components/css-form/Form.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Content from './content.md'

	let css_state = get_css_state()
	let lint_loading = $state(false)

	let effective_url = $derived(css_state.url)
</script>

<Seo
	title="CSS Linter"
	description="Lint your CSS for bugs, complexity, design token drift, and performance issues using 60+ specialized rules."
/>

<Hero>
	<Form on_url_submit={() => false} external_loading={lint_loading}>
		{#snippet title()}
			<h1 class="font-heading">Lint CSS</h1>
		{/snippet}
	</Form>
</Hero>

<Container>
	<Linter
		css={effective_url ? undefined : css_state.css || undefined}
		url={effective_url}
		prettify={css_state.should_prettify}
		onloading={(is_loading) => (lint_loading = is_loading)}
	/>
</Container>

<Container size="xl">
	<Markdown>
		<Content />
	</Markdown>
</Container>

<style>
	.font-heading {
		font-size: var(--size-5xl);
	}
</style>
