<script lang="ts">
	import Container from '$lib/components/Container.svelte'
	import Seo from '$lib/components/Seo.svelte'
	import Button from '$lib/components/Button.svelte'
	import Heading from '$lib/components/Heading.svelte'
	// @ts-expect-error No type definitions for importing images
	import Image from './(public)/analyze-css/og-image.png?w=1200'
</script>

<Seo
	title="CSS Analytics"
	description="The best CSS Analyzer on the web. Check your CSS complexity, specificity, performance, design tokens and much more."
	image={Image}
/>

<Container>
	<div class="wrapper">
		<section class="hero-section">
			<div>
				<Heading element="h1">
					The best <em class="prevent-orphan">CSS analyzer</em> out there.
				</Heading>
				<p>
					Project Wallace is a set of CSS analyzers that check your complexity, specificity, performance, Design Tokens
					and much more. And all of that in a single web app.
				</p>

				<Button element="a" href="/analyze-css" size="lg">Analyze CSS now!</Button>
			</div>

			<enhanced:img
				loading="eager"
				fetchpriority="high"
				alt="Example output of Project Wallace's CSS Analyzer"
				src="$lib/img/analyzer-units.png?w=640;320;190"
			/>
		</section>

		<blockquote>
			<Container>
				<p class="title">
					<q>
						If you need to get a handle on your CSS,
						<br />
						<em>you need Project Wallace</em>.
					</q>
				</p>
				<cite>
					Harry Roberts (<a href="https://csswizardry.com/" rel="external">csswizardry.com</a>)
				</cite>
			</Container>
		</blockquote>

		<Container size="3xl">
			<section class="feature-list">
				<Heading element="h2" size={1}>Audit your CSS like a Pro</Heading>
				<p>
					See every color, check every single media query, inspect the format of your colors. Everything is made visible
					in our CSS Analyzer.
				</p>
				<ol>
					<li>
						<Heading element="h3">Dive deep into your CSS</Heading>
						<p>
							See every color, check every single media query, inspect the format of your colors. Everything is made
							visible in our CSS Analyzer.
						</p>
						<Button element="a" href="/analyze-css">Analyze css</Button>
					</li>
					<li>
						<Heading element="h3">Code Quality check</Heading>
						<p>
							Need a quick check-up on your CSS without all the details from the analyzer? Do a CSS code quality check.
						</p>
						<Button element="a" href="/css-code-quality" variant="secondary">Check code quality</Button>
					</li>
					<li>
						<Heading element="h3">Specificity what?</Heading>
						<p>
							Very few tools get this right, but we&rsquo;ve got your back: our specificity analyzer supports all the
							latest specs.
						</p>
						<Button element="a" href="/specificity-calculator" variant="secondary">Calculate specificity</Button>
					</li>
					<li>
						<Heading element="h3">Want to play a game?</Heading>
						<p>
							Are you in the mood for a game? Let&rsquo;s see how many CSS units you have remembered over the years!
						</p>
						<Button href="/css-units-game" element="a" variant="secondary">Play the CSS Units game</Button>
					</li>
				</ol>
			</section>
		</Container>

		<section class="marketing-section">
			<Heading element="h2" size={4}>Audit your Design System</Heading>
			<p class="title h2-title">Your Design System team will love it</p>
			<p>
				Wallace encourages you to reduce the amount of colors, shadows and typography choices. Consistency is key for
				well-engineered Design Systems.
			</p>

			<div class="hero-section">
				<ol>
					<li>
						<Heading element="h3" size={2}>
							<span aria-hidden="true">#</span>
							Colors
						</Heading>
						<p>
							Keep your colors in check. Get rid of that <i>slightly off</i> brand color.
						</p>
					</li>
					<li>
						<Heading element="h3" size={2}>
							<span aria-hidden="true"> 1 </span>
							Font-sizes
						</Heading>
						<p>Make typography consistent by spotting all unnecessary font-sizes.</p>
					</li>
					<li>
						<Heading element="h3" size={2}>
							<span aria-hidden="true">@</span>Animations
						</Heading>
						<p>Animations are cool, but make sure your timing functions are all approved!</p>
					</li>
					<li>
						<Heading element="h3" size={2}>
							<span aria-hidden="true">f</span>Typefaces
						</Heading>
						<p>That paragraph in the footer looks odd. Wallace tells you why.</p>
					</li>
				</ol>
				<enhanced:img
					src="$lib/img/project-colors.png?w=640;320;190"
					alt="Example project color tokens"
					loading="lazy"
					fetchpriority="low"
				/>
			</div>
		</section>

		<Container>
			<blockquote>
				<p class="title">
					<q>
						I&rsquo;ve been using @projectwallace with my client and it is a
						<strong>fantastic</strong>
						dashboard to keep an eye on your CSS.
					</q>
				</p>
				<cite>Stuart Robson (<a href="https://www.alwaystwisted.com/" rel="external">alwaystwisted.com</a>)</cite>
			</blockquote>
		</Container>
	</div>
</Container>

<style>
	.wrapper {
		display: grid;
		gap: var(--space-16);

		@media (min-width: 33rem) {
			gap: var(--space-32);
		}

		@media (min-width: 44rem) {
			gap: var(--space-48);
		}
	}

	:global(img) {
		width: 100%;
		box-shadow: var(--shadow-2xl);
	}

	.hero-section {
		display: grid;
		grid-template-columns: 1fr;
		gap: var(--space-8);
		align-items: center;

		@media (min-width: 44rem) {
			grid-template-columns: 1fr 1fr;
			gap: var(--space-24);
			padding-block: var(--space-8);
		}

		p {
			margin-block: var(--space-8);
			font-size: var(--size-2xl);
			line-height: var(--leading-base);
		}

		& [aria-hidden='true'] {
			display: inline-block;
			width: 1.5em;
			line-height: var(--leading-base);
			text-align: center;
			color: var(--black);
			background-color: var(--teal-400);
			margin-inline-end: var(--space-4);
		}
	}

	blockquote {
		background-color: var(--teal-400);
		color: var(--black);
		padding: var(--space-4);
		text-align: center;
		font-size: var(--size-4xl);
		line-height: var(--leading-none);

		@media (min-width: 44rem) {
			padding: var(--space-8);
			font-size: var(--size-5xl);
		}

		@media (min-width: 66rem) {
			padding: var(--space-16);
		}

		cite {
			display: block;
			margin-top: var(--space-8);
			color: var(--gray-800);
			font-size: var(--size-xl);

			a {
				text-decoration: underline;
			}
		}
	}

	.feature-list {
		display: grid;
		gap: var(--space-12);
		text-align: center;

		& > p {
			text-align: center;
			max-width: 44rem;
			margin-inline: auto;
			font-size: var(--size-lg);

			@media (min-width: 33rem) {
				font-size: var(--size-2xl);
			}
		}

		& ol {
			display: grid;
			grid-template-columns: 1fr;
			gap: var(--space-8);
			text-align: start;

			@media (min-width: 44rem) {
				grid-template-columns: repeat(2, 1fr);
			}
		}

		& li {
			background-color: var(--bg-200);
			padding-block: var(--space-5);
			padding-inline: var(--space-4);
			box-shadow: var(--shadow-lg);
			display: grid;
			gap: var(--space-4);

			@media (min-width: 44rem) {
				padding-block: var(--space-6);
				padding-inline: var(--space-8);
			}

			& p {
				font-size: var(--size-lg);
			}

			:global(.btn) {
				justify-self: end;
			}
		}
	}

	.h2-title {
		font-size: var(--size-5xl);
		margin-block: var(--space-8);

		& + p {
			font-size: var(--size-2xl);
			max-width: 66ch;
			line-height: var(--leading-base);
		}
	}
</style>
