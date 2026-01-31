<script lang="ts">
	import SEO from '$components/Seo.svelte'
	import Markdown from '$components/Markdown.svelte'
	import Intro from './0-intro.md'
	import Composition from './1-composition.svx'
	import Atrules from './2-atrules.svx'
	import Rules from './3-rules.svx'
	import Selectors from './4-selectors.svx'
	import Declarations from './5-declarations.svx'
	import Values from './6-values.svx'
	import Conclusion from './7-conclusion.md'
	import Accountability from './8-accountability.md'
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import Nav from '$components/stats/Nav.svelte'
	import avatar from '$lib/img/bartveneman.png'

	let { data } = $props()
	let nav = data.nav
</script>

<SEO
	title="The CSS Selection - 2026 Edition"
	description="The CSS Selection shows real-world CSS usage from over 100,000 websites and looks at the most important metrics."
	robots="noindex,nofollow"
/>

<Container size="3xl">
	<div class="the-css-selection">
		<header>
			<Heading element="h1" size={0}>The CSS Selection</Heading>
			<p class="subtitle">The state of real-world CSS usage, 2026 edition.</p>
			<p class="author">
				<img class="author-avatar" src={avatar} alt="User avatar for Bart Veneman" width="25" height="25" />
				Bart Veneman
			</p>
		</header>

		<div class="nav scroll-container">
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

				<Conclusion />
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
				position: relative;

				@media (min-width: 66rem) {
					&::before,
					&::after {
						content: '';
						position: absolute;
						aspect-ratio: 1;
					}

					&::after {
						width: 6rem;
						border: 4px solid var(--accent-700);
						top: 1rem;
						right: 17rem;
					}

					&::before {
						top: 0;
						right: 10rem;
						width: 10rem;
						border: 4px solid var(--bg-400);
					}
				}
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
		margin-block-start: var(--space-24);
		margin-block-end: var(--space-36);
	}

	.author {
		display: flex;
		gap: var(--space-4);
	}

	.subtitle {
		color: var(--fg-300);
		font-size: var(--size-2xl);
		margin-block: var(--space-6);
	}

	.nav {
		position: sticky;
		top: 0;
		align-self: start;
		overflow-y: auto;
	}

	:global(.markdown h2) {
		margin-block-start: var(--space-24);
		font-size: var(--size-4xl);
	}

	:global(.markdown h2:first-of-type) {
		margin-block-start: 0;
	}

	:global(.markdown h3) {
		margin-block-start: var(--space-16);
		font-size: var(--size-2xl);
	}

	:global(.markdown h4) {
		margin-block-start: var(--space-8);
		font-size: var(--size-xl);
		font-weight: var(--font-bold);
	}

	:global(.markdown > :is(p, #ID-HACK)) {
		margin-top: var(--space-12);
	}

	:global(.markdown :is(.scroller:has(table) + p:has(> a[href]), #ID-HACK)) {
		max-width: none;
		text-align: end;
		margin-block-start: var(--space-2);
		font-size: var(--size-base);

		& a {
			color: var(--fg-300);
		}
	}
</style>
