<script lang="ts">
	let { children, size } = $props()
</script>

<aside class="award">
	<span class="size" aria-hidden="true">{size}</span>
	<p class="content">
		{@render children?.()}
	</p>
</aside>

<style>
	.award {
		margin-block: var(--space-12) var(--space-20);
		width: auto;
		max-width: min(36rem, 90%);
		position: relative;
		display: flow-root;

		&::before,
		&::after {
			content: '';
			position: absolute;
			z-index: -1;
		}

		&::after {
			inset-block-start: 1rem;
			inset-inline-end: -1rem;
			inset-block-end: -1rem;
			inset-inline-start: 1rem;
			background-color: var(--bg-200);
		}

		&::before {
			inset-block-start: 2rem;
			inset-inline-end: -2rem;
			inset-block-end: -2rem;
			inset-inline-start: 2rem;
			border: 2px solid var(--bg-300);
		}
	}

	.size {
		font-size: var(--size-3xl);
		font-weight: var(--font-ultrabold);
		border: 4px solid var(--bg-500);
		padding-block: var(--space-6);
		padding-inline: var(--space-4);
		float: left;
		margin-inline-end: var(--space-8);
		margin-block-end: var(--space-1);
		background-color: light-dark(var(--bg-200), var(--bg-300));
		position: relative;
	}

	.content {
		padding-block-start: var(--space-8);
		padding-inline-start: var(--space-8);
		font-style: italic;
		margin: 0 !important; /* reset markdown margin */
		font-size: var(--size-base);
		text-wrap: balance;
	}
</style>
