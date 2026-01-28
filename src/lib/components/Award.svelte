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
		display: grid;
		grid-template-columns: max-content auto;
		align-items: start;
		gap: var(--space-6);
		margin-block: var(--space-8);
		margin-inline: var(--space-8);
		max-width: min(calc(100% - var(--space-16)), 33rem);
		position: relative;

		&::before {
			content: '';
			position: absolute;
			z-index: -1;
			inset: 1rem -1rem -1rem 1rem;
			background-color: var(--bg-200);
		}
	}

	.size {
		font-size: var(--size-3xl);
		font-weight: var(--font-ultrabold);
		border: 4px solid var(--gray-400);
		padding-block: var(--space-6);
		padding-inline: var(--space-4);
	}

	.content {
		padding-top: var(--space-6);
		font-style: italic;
		margin: 0 !important; /* reset markdown margin */
		font-size: var(--size-base);
	}
</style>
