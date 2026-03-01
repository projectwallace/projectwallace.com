<script lang="ts">
	import { page } from '$app/state'
	import Container from '$lib/components/Container.svelte'
	import Hero from '$lib/components/Hero.svelte'

	const dev = process.env.NODE_ENV === 'development'
</script>

<svelte:head>
	<title>{page.status}</title>
</svelte:head>

<Hero>
	<h1 class="font-heading">{page.status}</h1>
	<p>{page.error?.message}</p>
</Hero>

{#if dev}
	<Container>
		<pre>{JSON.stringify(page.error, null, 2)}</pre>
	</Container>
{/if}
