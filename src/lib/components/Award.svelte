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

		&::after {
			content: '';
			position: absolute;
			z-index: -1;
			inset: 1rem -1rem -1rem 1rem;
			background-color: var(--bg-200);
		}

		&::before {
			content: '';
			position: absolute;
			inset: 2rem -2rem -2rem 2rem;
			z-index: -1;
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
		background-color: var(--bg-300);
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
