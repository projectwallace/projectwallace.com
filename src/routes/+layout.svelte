<script lang="ts">
	import { onMount } from 'svelte'
	import Nav from '$lib/components/Nav.svelte'
	import Footer from '$lib/components/Footer.svelte'
	import CmdK from '$components/cmd-k/CmdK.svelte'
	import SkipLink from '$components/SkipLink.svelte'
	import '$lib/css/reset.css'
	import '$lib/css/style.css'
	import { set_css_state } from '$lib/css-state.svelte'
	import type { LayoutProps } from './$types'
	import ThemeSwitch from '$components/ThemeSwitch.svelte'

	set_css_state()

	let { children, data }: LayoutProps = $props()

	let hydrated = $state(false)

	onMount(function () {
		hydrated = true
	})
</script>

<svelte:head>
	<meta name="hydration-status" content={hydrated.toString()} />
	{#if data.allow_analytics}
		<script
			id="counterscale-script"
			data-site-id="projectwallace.com"
			src="https://counterscale.bartveneman.workers.dev/tracker.js"
			defer
		></script>
	{/if}
</svelte:head>

<SkipLink href="#main">Skip to main content</SkipLink>
<SkipLink href="#footer">Skip to footer</SkipLink>

<Nav>
	<CmdK />
	<ThemeSwitch initial_theme={data.theme} />
</Nav>

<main id="main">
	{@render children?.()}
</main>

<Footer />
