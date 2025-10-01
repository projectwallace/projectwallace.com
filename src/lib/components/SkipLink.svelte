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
	.skip-link {
		position: absolute;
		left: -1000px;
		top: -1000px;
		width: 1px;
		height: 1px;
		text-align: left;
		overflow: clip;

		&:focus-visible,
		&:focus,
		&:active {
			position: absolute;
			left: 50%;
			top: 0;
			width: auto;
			height: auto;
			overflow: visible;
			transform: translateX(-50%);
			padding: var(--space-2) var(--space-4);
			background: var(--bg-100);
			color: var(--fg-100);
			box-shadow: var(--shadow);
		}
	}
</style>
