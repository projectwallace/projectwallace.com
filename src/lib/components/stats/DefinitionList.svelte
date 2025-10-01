<script lang="ts">
	import { format_number } from '$lib/format-number'

	type Stat = {
		name: string
		value: number | number[] | string | string[]
		ratio?: number
	}

	interface Props {
		stats?: Stat[]
	}

	let { stats = [] }: Props = $props()
</script>

<dl>
	{#each stats as { name, value, ratio }}
		<div>
			<dt>{name}</dt>
			<dd>
				{#if Array.isArray(value)}
					{#each value as v, i}
						{v}
						{#if i < value.length - 1}
							<span class="separator">/</span>
						{/if}
					{/each}
				{:else if typeof value === 'string'}
					{value}
				{:else}
					{format_number(value, { decimals: 2 })}
				{/if}
				{#if ratio !== undefined && ratio > 0}
					<span class="ratio">
						({format_number(ratio * 100, { decimals: 1 })}%)
					</span>
				{/if}
			</dd>
		</div>
	{/each}
</dl>

<style>
	dl {
		display: flex;
		gap: var(--space-4);
		align-items: flex-start;
	}

	dt {
		text-transform: uppercase;
		font-size: var(--size-xs);
		font-weight: var(--font-medium);
		line-height: var(--leading-none);
		color: var(--fg-300);
	}

	dd {
		font-weight: var(--font-bold);
		line-height: var(--leading-snug);
		font-variant-numeric: tabular-nums;
	}

	.ratio {
		font-size: var(--size-sm);
		color: var(--fg-300);
		font-weight: var(--font-normal);
	}

	.separator {
		font-weight: var(--font-normal);
		color: var(--fg-400);
	}
</style>
