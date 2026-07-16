<script lang="ts">
	import { format_number } from '$lib/format-number'

	interface Props {
		label: string
		value: number | string
		href: string
	}

	let { label, value, href }: Props = $props()
</script>

<a class="overview-stat" {href}>
	<dt>{label}</dt>
	<dd>{typeof value === 'number' ? format_number(value) : value}</dd>
</a>

<style>
	.overview-stat {
		display: block;
		color: inherit;
		text-decoration: none;
		padding-block: var(--space-2);
		border-radius: var(--space-1);
	}

	.overview-stat:hover,
	.overview-stat:focus-visible {
		color: var(--accent-400);
	}

	dt {
		text-transform: uppercase;
		font-size: var(--size-xs);
		font-weight: var(--font-medium);
		color: var(--fg-300);
	}

	dd {
		font-size: var(--size-3xl);
		line-height: var(--leading-none);
		font-weight: var(--font-ultrabold);
		font-variant-numeric: tabular-nums;
		margin-block-start: var(--space-2);
	}
</style>
