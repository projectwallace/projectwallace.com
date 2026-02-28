<script lang="ts">
	import type { Snippet } from 'svelte'

	type Props = {
		children?: Snippet
		status?: 'neutral' | 'success' | 'warning' | 'error' | 'info' | 'secondary'
	}

	let { children, status = 'neutral' }: Props = $props()
</script>

<span class={['status-badge', status]}>
	{@render children?.()}
</span>

<style>
	.status-badge {
		font-size: 0.8rem;
		line-height: var(--leading-none);
		border-radius: 0;
		max-block-size: max-content;
		max-inline-size: max-content;
		padding-block: 0.3em;
		padding-inline: var(--space-2);
		font-family: var(--font-mono);
		font-size-adjust: 0.5;
		text-transform: uppercase;
		font-weight: 700;
		display: inline-block;
	}

	.neutral {
		background-color: light-dark(var(--gray-300), var(--gray-500));
		color: light-dark(var(--gray-800), var(--gray-200));
	}

	.success {
		background-color: light-dark(var(--green-500), var(--green-700));
		color: light-dark(var(--green-100), var(--green-200));
	}

	.info {
		background-color: var(--blue-200);
		color: var(--blue-800);
	}

	.warning {
		background-color: light-dark(var(--yellow-300), var(--yellow-900));
		color: light-dark(var(--yellow-900), var(--yellow-400));
	}

	.error {
		background-color: light-dark(var(--red-200), var(--red-700));
		color: light-dark(var(--red-800), var(--red-400));
	}

	.secondary {
		background-color: light-dark(var(--purple-200), var(--purple-800));
		color: light-dark(var(--purple-800), var(--purple-200));
	}
</style>
