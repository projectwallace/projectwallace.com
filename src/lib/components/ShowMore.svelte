<script lang="ts">
	import type { Snippet } from 'svelte'

	type Status = 'closed' | 'open'

	interface Props {
		/** When false the content is just shown in full, without any buttons */
		collapsible?: boolean
		children?: Snippet<[{ status: Status }]>
	}

	let { children, collapsible = true }: Props = $props()

	// svelte-ignore state_referenced_locally
	let status: Status = $state(collapsible ? 'closed' : 'open')
	let element: HTMLDivElement | undefined = undefined

	function open() {
		status = 'open'
	}

	function close() {
		status = 'closed'
		if (!element) {
			return
		}

		// Scroll to the top of the element if it's taller than the viewport,
		// to avoid the user losing their scroll position in the document
		if (element.scrollHeight > window.innerHeight) {
			element.scrollIntoView({ behavior: 'instant', block: 'start' })
		}
	}
</script>

<div class="show-more" data-status={status} bind:this={element}>
	{@render children?.({ status })}
	<!-- One persistent button: Svelte reuses the element, so the browser keeps focus on it -->
	{#if collapsible}
		<button
			class={['action', status === 'closed' && 'opener shadow-xl']}
			type="button"
			onclick={status === 'closed' ? open : close}
		>
			{status === 'closed' ? 'Show more' : 'Show less'}
		</button>
	{/if}
</div>

<style>
	.show-more {
		position: relative;
		overflow: hidden;
	}

	.show-more[data-status='closed'] {
		max-block-size: 400px;
	}

	@media print {
		.show-more[data-status='closed'] {
			max-block-size: none;
		}

		.opener {
			display: none;
		}
	}

	.action {
		display: block;
		inline-size: 100%;
		padding-block: var(--space-2);
		padding-inline: var(--space-8);
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
		inset-block-end: 0;
		inset-inline-start: 0;
		inline-size: 100%;
		z-index: 1;
		background-image: linear-gradient(rgb(0 0 0 / 0), light-dark(var(--bg-100), var(--bg-200)) 40%);
		background-size: 100% 100%;
		padding-block: var(--space-4);
	}
</style>
