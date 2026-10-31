<script lang="ts">
	import CopyButton from '#lib/components/CopyButton.svelte'
	import Pre from '#lib/components/Pre.svelte'
	import Button from '#lib/components/Button.svelte'

	interface Props {
		css?: string
	}

	let { css = '' }: Props = $props()
</script>

<div class="toolbar">
	<Button
		element="a"
		variant="secondary"
		size="sm"
		icon="file"
		href={`data:text/css;charset=utf-8,${encodeURIComponent(css)}`}
		download="projectwallace-css.css"
	>
		Download CSS
	</Button>
	<CopyButton text={css}>Copy CSS</CopyButton>
</div>

<Pre {css} />

<style>
	.toolbar {
		z-index: 1;
		position: fixed;
		inset-block-start: var(--space-4);
		inset-inline-end: var(--space-6);
	}
</style>
