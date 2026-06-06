<script lang="ts">
	import CopyButton from '$components/CopyButton.svelte'
	import Pre from '$components/Pre.svelte'
	import Button from '$components/Button.svelte'

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
		top: var(--space-4);
		right: var(--space-6);
	}
</style>
