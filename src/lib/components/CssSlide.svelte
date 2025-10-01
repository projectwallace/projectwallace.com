<script lang="ts">
	import { format } from '@projectwallace/format-css'
	import type { CssLocation } from '$lib/css-location'
	import Icon from '$lib/components/Icon.svelte'
	import CopyButton from '$lib/components/CopyButton.svelte'
	import Button from '$lib/components/Button.svelte'
	import Pre from '$components/Pre.svelte'

	interface Props {
		css?: string
		locations?: CssLocation[]
		highlight_location?: CssLocation | undefined
		allow_prettify?: boolean
		allow_copy?: boolean
		allow_copy_highlighted?: boolean
		on_close: () => void
	}

	let {
		css = $bindable(''),
		locations = [],
		highlight_location = undefined,
		allow_prettify = false,
		allow_copy = false,
		allow_copy_highlighted = false,
		on_close
	}: Props = $props()

	function format_css() {
		css = format(css)
	}

	function close() {
		on_close()
	}
</script>

<div class="slide" data-testid="css-slide">
	<div class="slide-tools">
		<button type="button" class="closer" onclick={close} aria-labelledby="close-css-slide">
			<span class="sr-only" id="close-css-slide">Close panel</span>
			<Icon size={16} name="minimize" />
		</button>
		{#if allow_prettify}
			<Button size="sm" variant="secondary" onclick={format_css}>
				<Icon size={16} name="brush" />
				Format CSS
			</Button>
		{/if}
		{#if allow_copy}
			<CopyButton text={css}>Copy CSS</CopyButton>
		{/if}
		{#if allow_copy_highlighted && highlight_location}
			<CopyButton
				text={css.substring(highlight_location.offset, highlight_location.offset + highlight_location.length)}
			>
				Copy selection
			</CopyButton>
		{/if}
	</div>
	<div class="slide-body">
		<Pre {css} selected_location={highlight_location} line_numbers />
	</div>
</div>

<style>
	.slide {
		height: 100%;
		max-height: 100%;
		border-left: 1px solid var(--fg-450);
		overflow: hidden;
		display: flex;
		flex-direction: column;
	}

	.slide-tools {
		border-bottom: 1px solid var(--fg-450);
		padding: var(--space-2) var(--space-2);
		display: flex;
		flex-wrap: wrap;
		gap: var(--space-2);
		align-items: center;
	}

	.closer {
		margin-right: auto;
	}

	.slide-body {
		overflow-y: auto;
		height: 100%;
		max-height: 100%;
		flex-grow: 1;
	}
</style>
