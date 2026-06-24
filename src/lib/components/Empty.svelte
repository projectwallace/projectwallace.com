<script lang="ts">
	import type { SvelteHTMLElements } from 'svelte/elements'

	type Props = SvelteHTMLElements['div'] & {
		element?: string
	}

	let { element = 'p', children, ...rest }: Props = $props()
</script>

<svelte:element this={element} {...rest} class="empty">
	{@render children?.()}
</svelte:element>

<style>
	/* stylelint-disable projectwallace/max-average-declarations-per-rule -- versatile little thing */
	.empty {
		padding-block: var(--space-4);
		padding-inline: var(--space-6);
		border: 2px dashed light-dark(var(--fg-850), var(--fg-700));
		text-align: center;
		font-weight: var(--font-medium);
		color: light-dark(var(--fg-600), var(--fg-400));
		text-wrap: balance;
		display: flex;
		align-items: center;
		justify-content: center;

		@media (forced-colors: active), print {
			border-color: GrayText;
			border-width: 2px;
			color: GrayText;
		}
	}
</style>
