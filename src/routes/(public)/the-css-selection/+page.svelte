<script>
	import Container from '$components/Container.svelte'
	import Heading from '$components/Heading.svelte'
	import SEO from '$components/Seo.svelte'
	import Image from './2026/og-image-the-css-selection-2026.png'
</script>

<SEO
	title="The CSS Selection"
	description="The CSS Selection shows real-world CSS usage from over 100,000 websites and looks at the most important metrics."
	image={Image}
/>

<Container size="xl">
	<header>
		<Heading element="h1">The CSS Selection</Heading>
		<p class="sub-title">The state of real-world CSS usage</p>
	</header>

	<ol>
		<li>
			<article class="css-selection-card">
				<h2 class="card-title">
					<a class="card-link" href="/the-css-selection/2026">The CSS Selection</a>
				</h2>
				<div class="card-year">2026</div>
				<ul class="card-stats">
					<li>100+ metrics</li>
					<li>100,000 websites</li>
					<li class="break"></li>
					<li><u>41%</u> use <code>:has()</code></li>
					<li><u>9.61%</u> use <code>@container</code></li>
					<li><u>1.89%</u> use <code>OkLCH</code></li>
				</ul>
			</article>
		</li>
	</ol>
</Container>

<style>
	header {
		margin-block: var(--space-16);
	}

	.sub-title {
		font-size: var(--size-2xl);
		color: var(--fg-300);
	}

	.css-selection-card {
		aspect-ratio: 1200 / 630;
		container-type: inline-size;
		position: relative;
		background-color: var(--bg-100);
		color: var(--fg-200);
		font-family: var(--font-body);
		background-image: radial-gradient(circle at top, var(--teal-900), transparent 80%);
		background-repeat: no-repeat;
		border: 0.3rem solid var(--accent-400);
		padding-block: var(--space-8);
		padding-inline: var(--space-12);
		display: grid;
		align-content: start;
		gap: var(--space-6);

		:global([data-theme='light']) & {
			background-image: radial-gradient(circle at top, var(--teal-200), transparent 80%);

			&:hover,
			&:focus-within {
				background-image: radial-gradient(circle at top, var(--teal-200), transparent 100%);
			}
		}

		&:hover,
		&:focus-within {
			background-image: radial-gradient(circle at top, var(--teal-900), transparent 100%);

			.card-link {
				text-decoration: underline;
				text-decoration-thickness: 0.2rem;
				outline: none;
			}
		}

		&:focus-within {
			outline: 4px solid var(--fg-0);
		}
	}

	.card-year {
		font-size: var(--size-8xl);
		font-family: var(--font-display);
		font-weight: 500;
		margin-block-start: var(--space-6);
	}

	.card-title {
		font-weight: 900;
		color: var(--fg-100);
		font-size: var(--size-4xl);
		margin: 0;
		line-height: 0.88;

		@container (width > 33rem) {
			font-size: var(--size-6xl);
			width: 66%;
		}
	}

	.card-link::after {
		content: '';
		position: absolute;
		inset: 0;
	}

	.card-stats {
		display: flex;
		flex-wrap: wrap;
		column-gap: var(--space-6);
		row-gap: var(--space-2);
		margin-top: var(--space-6);

		.break {
			width: 100%;
		}

		code {
			position: relative;
			background-color: transparent;
			color: var(--black);
			z-index: 1;
			margin: 0;

			&::after {
				content: '';
				position: absolute;
				inset: -0.2em -0.1em;
				background-color: var(--teal-400);
				rotate: -0.004turn;
				z-index: -1;
				opacity: 0.8;
			}
		}

		u {
			text-decoration: none;
			position: relative;

			&::after {
				content: '';
				position: absolute;
				bottom: -0.4cqb;
				right: 0;
				left: 0;
				border-bottom: 0.4cqb solid var(--purple-400);
				rotate: -0.004turn;
			}
		}
	}
</style>
