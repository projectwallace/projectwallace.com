<script lang="ts">
	import Seo from '$components/Seo.svelte'
	import Linter from '$components/Linter.svelte'
	import Container from '$components/Container.svelte'
	import Hero from '$components/Hero.svelte'
	import Form from '$components/css-form/Form.svelte'
	import { get_css_state } from '$lib/css-state.svelte'

	let css_state = get_css_state()
</script>

<Seo title="TODO" description="TODO" />

<Hero>
	<Form>
		{#snippet title()}
			<h1 class="font-heading">Lint CSS</h1>
		{/snippet}
	</Form>
</Hero>

<Container>
	<Linter css={css_state.css} />
</Container>

<style>
	.font-heading {
		font-size: var(--size-5xl);
	}
</style>
