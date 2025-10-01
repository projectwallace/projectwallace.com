<script lang="ts">
	import type { Snippet } from 'svelte'

	type Status = 'closed' | 'open'

	interface Props {
		initial_open: boolean
		closable: boolean
		children?: Snippet<[{ status: Status }]>
	}

	let { children, initial_open: initialOpen = false, closable = false }: Props = $props()

	let status: Status = $state(initialOpen ? 'open' : 'closed')
	let element: HTMLDivElement

	function open() {
		status = 'open'
	}

	function close() {
		status = 'closed'

		// Scroll to the top of the element if it's taller than the viewport,
		// to avoid the user losing their scroll position in the document
		if (element.scrollHeight > window.innerHeight) {
			element.scrollIntoView({ behavior: 'instant', block: 'start' })
		}
	}
</script>

<div class="show-more" data-status={status} bind:this={element}>
	{@render children?.({ status })}
	{#if status === 'closed'}
		<button class="[ action opener ] shadow-xl" type="button" onclick={open}>Show more</button>
	{/if}
	{#if closable && status === 'open'}
		<button class="[ action ]" type="button" onclick={close}>Show less</button>
	{/if}
</div>

<style>
	.show-more {
		position: relative;
		overflow: hidden;
	}

	.show-more[data-status='closed'] {
		max-height: 400px;
	}

	@media print {
		.show-more[data-status='closed'] {
			max-height: none;
		}

		.opener {
			display: none;
		}
	}

	.action {
		display: block;
		width: 100%;
		padding: var(--space-2) var(--space-8);
		font-weight: var(--font-bold);
		text-align: center;
	}

	.action:hover {
		text-decoration: underline;
	}

	.action:focus {
		border: 2px solid var(--accent-400);
		outline: none;
		background-color: var(--bg-600);
	}

	.opener {
		position: absolute;
		bottom: 0;
		left: 0;
		width: 100%;
		z-index: 1;
		background-image: linear-gradient(rgb(0 0 0 / 0), light-dark(var(--bg-100), var(--bg-200)) 40%);
		background-size: 100% 100%;
		padding-block: var(--space-4);
	}
</style>
