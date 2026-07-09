<script lang="ts">
	import { browser } from '$app/environment'
	import Seo from '$components/Seo.svelte'
	import Hero from '$components/Hero.svelte'
	import Container from '$components/Container.svelte'
	import Form from '$components/css-form/Form.svelte'
	import PrettyJson from '$components/PrettyJson.svelte'
	import { get_css_state } from '$lib/css-state.svelte'

	let css_state = get_css_state()
	let loading = $state(false)
	let result: unknown = $state()
	let error: string | undefined = $state()

	let effective_url = $derived(css_state.url)

	async function fetch_tokens(url: string) {
		loading = true
		error = undefined
		result = undefined
		try {
			let response = await fetch(`/api/design-tokens?url=${encodeURIComponent(url)}`)
			let data = await response.json()
			if (!response.ok || (data && typeof data === 'object' && 'error' in data)) {
				let api_error = (data as { error?: unknown })?.error
				error =
					typeof api_error === 'string'
						? api_error
						: ((api_error as { message?: string })?.message ?? 'Something went wrong.')
			} else {
				result = data
			}
		} catch {
			error = 'Something went wrong.'
		} finally {
			loading = false
		}
	}

	$effect(() => {
		if (browser && effective_url) {
			fetch_tokens(effective_url)
		}
	})
</script>

<Seo
	title="Component Design Tokens"
	description="Inspect suggested design token combinations for common components on any URL."
/>

<Hero>
	<Form on_url_submit={() => false} external_loading={loading}>
		{#snippet title()}
			<h1 class="font-heading">Component Design Tokens</h1>
		{/snippet}
	</Form>
</Hero>

<Container>
	{#if loading}
		<p>Loading&hellip;</p>
	{:else if error}
		<p class="error-msg">{error}</p>
	{:else if result}
		<PrettyJson json={JSON.stringify(result, null, 2)} />
	{/if}
</Container>

<style>
	.font-heading {
		font-size: var(--size-5xl);
	}

	.error-msg {
		color: var(--error-300);
		font-weight: var(--font-medium);
	}
</style>
