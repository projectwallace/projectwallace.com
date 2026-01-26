<script lang="ts">
	import SEO from '$components/Seo.svelte'
	import Intro from './intro.svx'
	import Accountability from './accountability.svx'
	import Markdown from '$components/Markdown.svelte'
	import Composition from './1-composition.svx'
	import Atrules from './2-atrules.svx'
	import Rules from './3-rules.svx'
	import Selectors from './4-selectors.svx'
	import Declarations from './5-declarations.svx'
	import Values from './6-values.svx'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import Nav from '$components/stats/Nav.svelte'
	import { onMount } from 'svelte'
	import avatar from '$lib/img/bartveneman.png'

	type NavItem = {
		id: string
		title: string
		items?: NavItem[]
	}

	let nav: NavItem[] = $state([])

	onMount(() => {
		const headings = document.querySelectorAll('.the-css-selection :is(h2, h3)')
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

<Container size="3xl">
	<!-- Table of Contents -->
	<!-- Disclaimer: data does not match Web Almanac because of different analyzer -->
	<!-- AI disclaimer: no AI used for writing, only for generating SQL queries -->

	<div class="the-css-selection">
		<header>
			<Heading element="h1" size={0}>The CSS Selection</Heading>
			<p class="subtitle">The state of real-world CSS usage, 2026 edition.</p>
			<p class="author">
				<img class="author-avatar" src={avatar} alt="User avatar for Bart Veneman" width="25" height="25" />
				Bart Veneman
			</p>
		</header>

		<div class="nav">
			<Nav {nav} scroll_spy />
		</div>

		<div class="content">
			<Markdown>
				<Intro />

				<Composition />
				<Atrules />
				<Rules />
				<Selectors />
				<Declarations />
				<Values />

				<Accountability />
			</Markdown>
		</div>
	</div>
</Container>

<style>
	.the-css-selection {
		font-size: 100%;
		display: grid;
		column-gap: var(--space-24);

		@media (min-width: 44em) {
			font-size: 120%;
			grid-template-columns: 1fr max-content;
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
	}

	header {
		margin-block: var(--space-24);
	}

	.author {
		display: flex;
		gap: var(--space-4);
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

	:global(.markdown h2) {
		margin-block-start: var(--space-24);
		font-size: var(--size-4xl);
	}

	:global(.markdown h3) {
		margin-block-start: var(--space-16);
		font-size: var(--size-2xl);
	}

	:global(.markdown > :is(p, #ID-HACK)) {
		margin-top: var(--space-12);
	}
</style>
