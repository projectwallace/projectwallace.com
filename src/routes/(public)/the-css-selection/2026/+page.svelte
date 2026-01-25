<script lang="ts">
	import SEO from '$components/Seo.svelte'
	import Intro from './intro.svx'
	import Accountability from './accountability.svx'
	import Markdown from '$components/Markdown.svelte'
	import Composition from './1-composition.svx'
	import Atrules from './2-atrules.svx'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import Nav from '$components/stats/Nav.svelte'
	import { onMount } from 'svelte'

	type NavItem = {
		id: string
		title: string
		items?: NavItem[]
	}

	let nav: NavItem[] = $state([])

	onMount(() => {
		const headings = document.querySelectorAll('.the-css-selection :is(h2, h3):not(#report-nav-title)')
		const navItems: NavItem[] = []
		let currentH2: NavItem | null = null

		headings.forEach((heading) => {
			const id = heading.id
			const title = heading.textContent || ''

			if (heading.tagName === 'H2') {
				currentH2 = { id, title, items: [] }
				navItems.push(currentH2)
			} else if (heading.tagName === 'H3' && currentH2) {
				currentH2.items!.push({ id, title })
			}
		})

		nav = navItems
	})
</script>

<SEO
	title="The CSS Selection - 2026 Edition"
	description="The CSS Selection shows real-world CSS usage from over 100,000 websites and looks at the most important metrics."
	robots="noindex,nofollow"
/>

<Container size="2xl">
	<!-- Table of Contents -->
	<!-- Disclaimer: data does not match Web Almanac because of different analyzer -->
	<!-- AI disclaimer: no AI used for writing, only for generating SQL queries -->

	<div class="the-css-selection">
		<header>
			<Heading element="h1" size={0}>The CSS Selection</Heading>
			<p class="subtitle">The state of real-world CSS usage, 2026 edition.</p>
		</header>

		<div class="nav">
			<Nav {nav} scroll_spy />
		</div>

		<div class="content">
			<Markdown>
				<Intro />

				<Composition />
				<Atrules />

				<Accountability />
			</Markdown>
		</div>
	</div>
</Container>

<style>
	.the-css-selection {
		font-size: 120%;
		display: grid;
		grid-template-columns: 1fr max-content;
		column-gap: var(--space-24);
		position: relative;

		> header {
			grid-column: 1 / -1;
		}

		.nav {
			grid-column: 2;
			grid-row: 2;
		}

		.content {
			grid-row: 2;
			grid-column: 1;
		}
	}

	header {
		text-align: center;
		margin-block: var(--space-16);
	}

	.subtitle {
		color: var(--gray-300);
		font-size: var(--size-2xl);
		margin-block: var(--space-6);
	}

	.nav {
		position: sticky;
		top: var(--space-4);
		align-self: start;
		max-height: 100vh;
		overflow-y: auto;
	}
</style>
