<script lang="ts">
	import type { Snippet } from 'svelte'

	let {
		href,
		children
	}: {
		href: string
		children: Snippet
	} = $props()
</script>

<a {href} class="skip-link">
	{@render children?.()}
</a>

<style>
	/* stylelint-disable projectwallace/max-average-declarations-per-rule -- Exception to the stylelint config: skiplinks are hard to compose 🙈 */
	.skip-link {
		position: absolute;
		inset-inline-start: -1000px;
		inset-block-start: -1000px;
		inline-size: 1px;
		block-size: 1px;
		text-align: start;
		overflow: clip;

		&:focus-visible,
		&:focus,
		&:active {
			position: absolute;
			inset-inline-start: 50%;
			inset-block-start: 0;
			inline-size: auto;
			block-size: auto;
			transform: translateX(-50%);
			padding-block: var(--space-2);
			padding-inline: var(--space-4);
			background: var(--bg-100);
			color: var(--fg-100);
			box-shadow: var(--shadow);
		}
	}
</style>
