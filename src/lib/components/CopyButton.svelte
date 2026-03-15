<script lang="ts">
	import { onDestroy, type Snippet } from 'svelte'
	import Button from './Button.svelte'
	import type { Variant } from './Button'

	interface Props {
		text: string | (() => string)
		variant?: Variant
		children?: Snippet
	}

	let { text, variant = 'secondary', children }: Props = $props()

	let timer_id: number | undefined = $state()

	async function copyToClipBoard() {
		let txt = typeof text === 'function' ? text() : text
		try {
			await navigator.clipboard.writeText(txt)
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
		<div class="inner">
			<span class:see-through={timer_id}>
				{@render children?.()}
			</span>
			{#if timer_id}
				<span class="confirmation-message">Copied!</span>
			{/if}
		</div>
	</Button>
</span>

<style>
	.inner {
		white-space: nowrap;
		position: relative;
	}

	.see-through {
		visibility: hidden;
	}

	.confirmation-message {
		position: absolute;
		top: 0;
		left: 0;
	}
</style>
