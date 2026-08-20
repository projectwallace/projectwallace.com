<a class="logo font-heading" href="/">
	<span>Project</span>
	<br />
	<span>Wallace</span>
</a>

<style>
	.logo {
		display: block;
		line-height: var(--leading-none);
		font-size: var(--size-sm);

		&:hover {
			&,
			& span:nth-of-type(2) {
				color: var(--accent-700);
			}
		}

		span:nth-of-type(2) {
			color: light-dark(var(--accent-500), var(--accent-400));
		}
	}
</style>
