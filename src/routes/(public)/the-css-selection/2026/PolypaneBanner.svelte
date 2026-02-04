<script>
	import Button from '$components/Button.svelte'
</script>

<div class="polypane-banner">
	<small>(sponsored)</small>

	<!-- Ignore explicit label becase the alt provides that title -->
	<!-- svelte-ignore a11y_consider_explicit_label -->
	<a
		href="https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection&utm_content=banner-image"
		target="_blank"
	>
		<enhanced:img src="./polypane-banner.png?w=760" alt="Polypane: The missing half of your development environment" />
	</a>

	<p>See every breakpoint. Catch every accessibility issue. Make your site work for everyone.</p>
	<p>
		<a href="https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection&utm_content=banner-text">
			Polypane
		</a> is a development browser that shows your site in multiple viewports at once, with built-in tools to test accessibility
		(WCAG violations, color contrast, DOM structure), performance metrics, layout debugging, and meta tag validation.
	</p>
	<p>
		Thousands of developers trust Polypane to build sites that work beautifully for everyone without constant
		tab-switching and browser resizing.
	</p>

	<div class="cta">
		<Button
			element="a"
			icon="external"
			size="lg"
			href="https://polypane.app/?utm_source=projectwallace&utm_medium=the-css-selection&utm_content=banner-button"
		>
			Start your free trial
		</Button>
	</div>
</div>

<style>
	.polypane-banner {
		margin-top: var(--space-8);
		background-color: var(--bg-200);
		padding-block: var(--space-4) var(--space-12);
		padding-inline: var(--space-4);
		max-width: 60ch;
		display: grid;
		gap: var(--space-6);

		@media (min-width: 33rem) {
			padding-inline: var(--space-8);
		}

		@media (min-width: 44rem) {
			padding-inline: var(--space-12);
		}

		/* Reset markdown styles */
		:global(picture, img, p) {
			margin: 0;
		}
	}

	small {
		display: block;
		text-align: center;
		font-weight: var(--font-medium);
	}

	.cta {
		text-align: right;
	}
</style>
