<script lang="ts">
	import CopyButton from '$components/CopyButton.svelte'
	import Pre from '$components/Pre.svelte'

	interface Props {
		css?: string
	}

	let { css = '' }: Props = $props()
</script>

<div class="toolbar">
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
