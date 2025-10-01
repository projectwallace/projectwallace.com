<script lang="ts">
	type Specificity = [number, number, number]

	interface Props {
		specificity: Specificity
	}

	let { specificity }: Props = $props()
</script>

<dl data-testid="specificity-item">
	<dt>ID's</dt>
	<dd>{specificity[0]}</dd>
	<dt>Classes, attributes and pseudo-classes</dt>
	<dd>{specificity[1]}</dd>
	<dt>Elements, pseudo-elements</dt>
	<dd>{specificity[2]}</dd>
</dl>

<style>
	dl {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: var(--space-4);
		text-align: center;
	}

	dt {
		grid-row: 2;
		text-transform: uppercase;
		font-weight: var(--font-bold);
		font-size: var(--size-sm);
		color: var(--fg-200);
	}

	dd {
		grid-row: 1;
		font-size: var(--size-6xl);
		line-height: var(--leading-none);
		font-weight: var(--font-ultrabold);
	}
</style>
