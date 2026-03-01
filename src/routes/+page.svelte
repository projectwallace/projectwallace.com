<script lang="ts">
	import Container from '$lib/components/Container.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import Button from '$lib/components/Button.svelte'
	import Heading from '$lib/components/Heading.svelte'
	// @ts-expect-error No type definitions for importing images
	import Image from './(public)/analyze-css/og-image.png?w=1200'

	const tools: Record<string, string> = {
		'CSS prettifier': '/prettify-css',
		'CSS Minifier': '/minify-css',
		'CSS diff viewer': '/css-diff',
		'Coverage inspector': '/css-coverage-inspector',
		'Specificity calculator': '/specificity-calculator',
		'Selector complexity': '/selector-complexity'
	}
	import StatusBadge from '$components/StatusBadge.svelte'
	import Icon from '$components/Icon.svelte'
</script>

<Seo
	title="CSS Analytics"
	description="The best CSS Analyzer on the web. Check your CSS complexity, specificity, performance, design tokens and much more."
	image={Image}
/>

<header>
	<h1>
		Your CSS tells a story.
		<br />
		Do you know <em>what it says</em><i>?</i>
	</h1>
	<p class="lead">
		47 shades of gray in your design tokens. Specificity wars you didn't know existed. 12 competing font stacks across
		your codebase. Project Wallace reveals the big picture from every angle.
	</p>

	<div class="button-group">
		<Button size="lg" icon="arrow-right">Analyze your CSS</Button>
		<Button size="lg" variant="secondary">See what it finds</Button>
	</div>
</header>

<section>
	<h2 class="section-heading">The blind spot</h2>
	<p class="faux-heading">
		CSS grows in every direction.
		<br />
		The big picture becomes invisible.
	</p>
	<p class="lead">
		Every team reviews components. Nobody reviews all stylesheets. Over time, small inconsistencies compound into
		systemic problems that hide in plain sight.
	</p>

	<Container size="3xl">
		<ul class="panel-grid">
			<li>
				<Icon name="brush" />
				<Heading element="h3">Colors multiply quietly</Heading>
				<p>
					What started as a clean palette becomes 140+ unique values. Off-brand grays, duplicate blues in different
					formats, opacity hacks nobody remembers.
				</p>
				<StatusBadge status="warning">invisible drift</StatusBadge>
			</li>
			<li>
				<Icon name="code" />
				<Heading element="h3">Specificity creeps upward</Heading>
				<p>
					Every quick fix adds another layer. Before you know it, selectors are fighting each other and overrides are
					the norm instead of the exception.
				</p>
				<StatusBadge status="error">growing complexity</StatusBadge>
			</li>
			<li>
				<Icon name="layers" />
				<Heading element="h3">Design systems drift silently</Heading>
				<p>
					Tokens get duplicated. Custom properties multiply. Font stacks diverge. Nobody notices until the bundle is
					300kb and the design review falls apart.
				</p>
				<StatusBadge status="info">system-level debt</StatusBadge>
			</li>
		</ul>
	</Container>
</section>

<section>
	<h2 class="section-heading">The missing view</h2>
	<p class="faux-heading">
		Project Wallace gives you the <em>aerial view</em>
		<br />
		of your entire CSS codebase.
	</p>
	<p class="lead">
		Paste a URL or your raw CSS. Get a complete x-ray of your stylesheets: from colors and typography to specificity and
		cascade layers, in seconds.
	</p>

	<Container size="3xl">
		<ul class="panel-grid feature-grid">
			<li>
				<StatusBadge status="success">Core analyzer</StatusBadge>
				<Heading element="h3">Full CSS analysis</Heading>
				<p>
					Every selector, every media query, every property — surfaced, counted, and visualized. Understand the true
					structure and complexity of your stylesheets.
				</p>
				<a href="/analyze-css">Analyze CSS →</a>
			</li>
			<li>
				<StatusBadge status="warning">Code quality</StatusBadge>
				<Heading element="h3">Opinionated quality score</Heading>
				<p>
					Get a single, actionable score for your CSS health. Based on specificity distribution, redundancy, selector
					complexity, and proven best practices.
				</p>
				<a href="/css-code-quality">Check code quality →</a>
			</li>
			<li>
				<StatusBadge status="secondary">Design tokens</StatusBadge>
				<Heading element="h3">Design token audit</Heading>
				<p>
					Every color, font-size, shadow, and spacing value extracted and grouped. See where your design system is
					consistent and where it's quietly drifting.
				</p>
				<a href="/css-code-quality">Check code quality →</a>
			</li>
			<li>
				<StatusBadge status="info">Custom properties</StatusBadge>
				<Heading element="h3">Custom property inspector</Heading>
				<p>
					Trace every CSS custom property. See which are declared, which are used, and which are quietly orphaned across
					your stylesheets.
				</p>
				<a href="/custom-property-inspector">Inspect properties →</a>
			</li>
			<li>
				<StatusBadge status="neutral">Cascade layers</StatusBadge>
				<Heading element="h3">@layer visualizer</Heading>
				<p>
					Visualize your cascade layer structure. Understand the order, nesting, and specificity implications of your
					@layer declarations.
				</p>
				<a href="/custom-property-inspector">View layers →</a>
			</li>
		</ul>
	</Container>
</section>

<section>
	<h2 class="section-heading">Standalone tools</h2>
	<p class="faux-heading">One-off tools for everyday CSS work</p>
	<p class="lead">No signup. No paywall. Just paste your CSS and get your job done.</p>

	<Container size="3xl">
		<ul class="tools-list">
			{#each Object.entries(tools) as [label, href]}
				<li>
					<a {href}>{label} <span aria-hidden="true">→</span></a>
				</li>
			{/each}
		</ul>
	</Container>
</section>

<section>
	<Container size="2xl">
		<ul class="testimonials">
			<li class="testimonial">
				<blockquote>
					<p><q>If you need to get a handle on your CSS, <em>you need Project Wallace</em>.</q></p>
				</blockquote>
				<div class="author">Harry Roberts <span class="website">csswizardry.com</span></div>
			</li>
			<li class="testimonial">
				<blockquote>
					<p>
						<q
							>I&rsquo;ve been using Wallace with my client and it is a <em>fantastic dashboard</em> to keep an eye on your
							CSS.</q
						>
					</p>
				</blockquote>
				<div class="author">Stuart Robson <span class="website">alwaystwisted.com</span></div>
			</li>
		</ul>
	</Container>
</section>

<style>
	header {
		padding-block: min(20rem, 16cqb);
		text-align: center;
		display: grid;
		gap: var(--space-8);
		justify-content: center;
		overflow: clip;

		background-image: radial-gradient(
			circle at top center,
			rgb(from var(--accent-400) r g b / 0.1) 0%,
			transparent 70%
		);
	}

	.section-heading {
		text-transform: uppercase;
		font-family: var(--font-mono);
		font-size: var(--size-base);
		color: var(--fg-300);
	}

	h1 {
		font-family: var(--font-serif);
		font-weight: var(--font-normal);
		font-size: var(--size-7xl);
		line-height: var(--leading-none);
		text-wrap: balance;
		text-align: center;
		font-weight: var(--font-normal);
		color: var(--fg-100);

		em {
			color: var(--accent-300);
			font-style: italic;
		}
	}

	.faux-heading {
		font-family: var(--font-serif);
		font-weight: var(--font-normal);
		font-size: var(--size-4xl);
		line-height: var(--leading-snug);
		text-wrap: balance;
		text-align: center;
		font-weight: var(--font-normal);
		color: var(--fg-100);

		em {
			color: var(--accent-300);
			font-style: italic;
		}
	}

	p.lead {
		font-size: var(--size-xl);
		max-width: 66ch;
		text-wrap: balance;
		line-height: var(--leading-relaxed);
	}

	.button-group {
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-4);
		margin-inline: auto;
	}

	section {
		container-type: inline-size;
		padding-block: min(var(--space-16), 18cqb);
		display: grid;
		gap: var(--space-8);
		place-content: center;
		border-block-start: 1px solid var(--fg-500);
	}

	:global(section h2),
	section p.lead {
		text-align: center;
		margin-inline: auto;
	}

	.panel-grid {
		display: grid;
		gap: var(--space-px);
		background-color: var(--bg-300);

		li {
			background-color: var(--bg-200);
			display: grid;
			place-content: start;
			gap: var(--space-4);
			padding-inline: var(--space-4);
			padding-block: var(--space-8);
		}

		@container (min-width: 44rem) {
			grid-template-columns: repeat(6, 1fr);

			& li {
				grid-column: span 2;
				padding-inline: var(--space-12);
				padding-block: var(--space-16);
			}
		}

		section & {
			margin-block-start: var(--space-8);
		}
	}

	.feature-grid {
		@container (min-width: 44rem) {
			& li:nth-child(-n + 2) {
				grid-column: span 3;
			}
		}
	}

	:where(section) a:last-child {
		color: var(--accent-400);
		font-weight: var(--font-medium);
		justify-self: start;

		&:hover {
			color: var(--accent-300);
		}
	}

	.tools-list {
		display: grid;
		gap: var(--space-3);

		@container (min-width: 33rem) {
			grid-template-columns: repeat(2, 1fr);
		}

		@container (min-width: 44rem) {
			grid-template-columns: repeat(3, 1fr);
		}

		a {
			display: flex;
			width: 100%;
			gap: var(--space-2);
			justify-content: space-between;
			background-color: var(--bg-200);
			padding-block: var(--space-4);
			padding-inline: var(--space-6);
			color: inherit;
			transition: color 0.1s ease-out;

			[aria-hidden] {
				opacity: 0;
				translate: -5px 0;
				transition:
					translate 0.1s ease-out,
					opacity 0.1s ease-out;
			}

			&:hover,
			&:focus {
				[aria-hidden] {
					translate: 0;
					opacity: 1;
				}
			}
		}
	}

	.testimonials {
		display: grid;
		gap: var(--space-4);

		li {
			background-color: var(--bg-200);
			display: grid;
			gap: var(--space-4);
			padding-inline: var(--space-4);
			padding-block: var(--space-8);
		}

		@container (min-width: 44rem) {
			grid-template-columns: repeat(2, 1fr);

			& li {
				padding-inline: var(--space-12);
				padding-block: var(--space-16);
			}
		}

		& blockquote {
			font-family: var(--font-serif);
			font-weight: var(--font-normal);
			font-size: var(--size-2xl);
			line-height: var(--leading-snug);
			/* text-wrap: balance; */
			font-weight: var(--font-normal);
			color: var(--fg-100);
			font-style: italic;

			em {
				color: var(--accent-300);
				font-style: italic;
			}
		}

		.author {
			font-weight: var(--font-bold);
		}

		.website {
			font-weight: var(--font-normal);
			color: var(--fg-300);

			&::before {
				content: '—';
				margin-inline: 1ch;
			}
		}
	}
</style>
