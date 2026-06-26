<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import Linter from '$components/Linter.svelte'
	import Container from '$components/Container.svelte'
	import Hero from '$components/Hero.svelte'
	import Form from '$components/css-form/Form.svelte'
	import { get_css_state } from '$lib/css-state.svelte'
	import { page } from '$app/state'

	let css_state = get_css_state()
	let lint_loading = $state(false)

	let effective_url = $derived(css_state.url ?? page.url.searchParams.get('url') ?? undefined)
</script>

<Seo title="Lint CSS" description="Lint your entire CSS and spot quality issues hidden in plain sight." />

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
		onloading={(v) => (lint_loading = v)}
	/>

	TODO: add some markdown content here
</Container>

<style>
	.font-heading {
		font-size: var(--size-5xl);
	}
</style>
