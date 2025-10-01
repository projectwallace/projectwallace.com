<script lang="ts">
	import { page } from '$app/state'

	const defaultTitle = 'Project Wallace'
	const defaultUrl = 'https://www.projectwallace.com'

	interface Props {
		title: string
		description?: string
		image?: string
		robots?: string
	}

	let {
		title,
		description = 'Analyze your CSS and keep track of changes in complexity and branding. Share your statistics with everyone in your team and get conversations going.',
		image = '',
		robots = 'index, follow'
	}: Props = $props()

	// Add a trailing slash for the homepage only
	let url = $derived(defaultUrl + (page.url.pathname === '/' ? '/' : page.url.pathname.replace(/\/$/, '')))
	let theTitle = $derived(title ? title + ' - ' + defaultTitle : defaultTitle)
</script>

<svelte:head>
	<!-- HTML Meta Tags -->
	<title>{theTitle}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	<meta name="robots" content={robots} />

	<!-- OpenGraph Meta Tags -->
	<meta property="og:url" content={url} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content={theTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:site_name" content="projectwallace.com" />
	<meta property="og:locale" content="en" />

	{#if image}
		<meta property="og:image" content={image} />
		<meta property="og:image:width" content="1140" />
		<meta property="og:image:height" content="600" />
	{/if}

	<!-- See: https://whitep4nth3r.com/blog/level-up-your-link-previews-in-slack/ -->
	{#if url.includes('/blog')}
		<meta name="twitter:label1" content="Written by" />
		<meta name="twitter:data1" content="Bart Veneman" />
	{/if}
</svelte:head>
