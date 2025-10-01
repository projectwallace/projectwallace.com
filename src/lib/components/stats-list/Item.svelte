<script lang="ts">
	interface Props {
		key: string
		value: string | number
		secondary_value?: string | number | undefined
	}

	let { key, value, secondary_value = undefined }: Props = $props()
</script>

<div>
	<dt class="key">{key}</dt>
	<dd class="value">
		{String(value)}
	</dd>
	{#if secondary_value}
		<dd class="secondary">
			{String(secondary_value)}
		</dd>
	{/if}
</div>

<style>
	.key {
		color: var(--fg-300);
	}

	.value {
		font-size: var(--size-3xl);
		font-weight: var(--font-medium);
		line-height: var(--leading-none);
		color: var(--fg-100);
	}

	.secondary {
		color: var(--fg-300);
		font-weight: var(--font-medium);
		margin-top: var(--space-1);
	}
</style>
