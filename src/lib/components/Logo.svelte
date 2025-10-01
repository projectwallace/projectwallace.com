<a class="logo font-heading" href="/" aria-label="Project Wallace">
	<span class="sr-only">Project Wallace</span>
</a>

<style>
	.logo {
		display: block;
		color: light-dark(var(--accent-500), var(--accent-400));
		padding: var(--space-1);
		line-height: var(--leading-none);

		@media (min-width: 44rem) {
			padding: var(--space-4);
		}

		&:hover {
			color: var(--accent-700);
		}
	}

	:global(html:not([data-theme='naked'])) .logo {
		&::after {
			content: 'W';
			display: inline-block;
			font-size: var(--size-2xl);
		}

		@media (min-width: 44rem) {
			&::after {
				content: 'Wallace';
				font-size: var(--size-2xl);
			}
		}
	}
</style>
