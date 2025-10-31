<script lang="ts">
	import { onDestroy } from 'svelte'
	import Button, { type Variant } from './Button.svelte'

	interface Props {
		text: string
		variant?: Variant
		children?: import('svelte').Snippet
	}

	let { text, variant = 'secondary', children }: Props = $props()

	let timer_id: number | undefined = $state()

	async function copyToClipBoard() {
		try {
			await navigator.clipboard.writeText(text)
			timer_id = window.setTimeout(() => {
				timer_id = undefined
			}, 2000)
		} catch (error) {
			// fail silently
		}
	}

	onDestroy(() => {
		if (timer_id) {
			window.clearTimeout(timer_id)
		}
	})
</script>

<span class="copy-button">
	<Button size="sm" {variant} type="button" onclick={copyToClipBoard} icon="copy">
		<span class:see-through={timer_id}>
			{@render children?.()}
		</span>
		{#if timer_id}
			<span class="confirmation-message">Copied!</span>
		{/if}
	</Button>
</span>

<style>
	/* A bit hacky, but good for now */
	.copy-button :global(button) {
		position: relative;
		white-space: nowrap;
	}

	.see-through {
		visibility: hidden;
	}

	.confirmation-message {
		position: absolute;
		top: 0.3em;
		left: var(--space-2); /* Make it look centered with the icon on the left */
		right: 0;
		width: 100%;
		text-align: center;
	}
</style>
